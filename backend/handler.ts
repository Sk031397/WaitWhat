import {
  BedrockRuntimeClient,
  ConverseCommand,
} from '@aws-sdk/client-bedrock-runtime';
import type { ContentBlock } from '@aws-sdk/client-bedrock-runtime';
import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import type { AskRequest, AskResponse, AskTurn } from './types';

/**
 * SideKick /ask backend.
 *
 * Receives an AskRequest from the TV app, grounds Amazon Bedrock (Nova) with
 * the current content context, and returns a short, 10-foot-friendly answer.
 *
 * Every answer comes from the model. If Bedrock is unavailable (no model
 * access, throttling, timeout) we return an error, never a canned answer.
 *
 * SECURITY: the request body is untrusted. We validate shape and clamp the
 * question length before putting it in a prompt.
 */

// Nova Lite (multimodal: it must see the frames) via cross-region inference
// profile (us. prefix) for availability.
// Verify with: aws bedrock list-inference-profiles --region us-east-1
const MODEL_ID = process.env.BEDROCK_MODEL_ID ?? 'us.amazon.nova-lite-v1:0';
const REGION = process.env.AWS_REGION ?? 'us-east-1';
const MAX_QUESTION_LEN = 300;
const MAX_TEXT_LEN = 1000;
const MAX_CONTEXT_KEYS = 12;
const MAX_MOMENTS = 20;
const MAX_HISTORY_TURNS = 3;
// The app gives up after 11s, so Bedrock must answer (or fail) well before
// that. One retry, inside the same budget.
const BEDROCK_TIMEOUT_MS = 8000;

// Real frames extracted from each video (scripts/extract-frames.sh) live at
// s3://MEDIA_BUCKET/frames/<videoId>/<second>.jpg, one every FRAME_STEP_S.
const MEDIA_BUCKET = process.env.MEDIA_BUCKET ?? 'sidekickvegaos';
const FRAME_STEP_S = 2;
const FRAMES_PER_ASK = 4;
const FRAME_FETCH_TIMEOUT_MS = 1500;
const VIDEO_ID = /^[A-Za-z0-9_-]{1,64}$/;

const s3 = new S3Client({ region: REGION });

const client = new BedrockRuntimeClient({
  region: REGION,
  maxAttempts: 2,
  retryMode: 'standard',
});

interface LambdaEvent {
  body?: string;
  headers?: Record<string, string | undefined>;
  requestContext?: { http?: { method?: string } };
}

interface LambdaResult {
  statusCode: number;
  headers: Record<string, string>;
  body: string;
}

const json = (statusCode: number, payload: unknown): LambdaResult => ({
  statusCode,
  headers: {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  },
  body: JSON.stringify(payload),
});

const clip = (v: unknown, max = MAX_TEXT_LEN): string => String(v ?? '').slice(0, max);

/** Keep only string / string[] context values, size-capped. */
const sanitizeContext = (raw: unknown): Record<string, string | string[]> | undefined => {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return undefined;
  const out: Record<string, string | string[]> = {};
  for (const [k, v] of Object.entries(raw).slice(0, MAX_CONTEXT_KEYS)) {
    if (typeof v === 'string') out[clip(k, 50)] = clip(v, 500);
    else if (Array.isArray(v)) out[clip(k, 50)] = v.slice(0, 20).map((x) => clip(x, 200));
  }
  return out;
};

const sanitizeHistory = (raw: unknown): AskTurn[] => {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((t) => t && typeof t.question === 'string' && typeof t.answer === 'string')
    .slice(-MAX_HISTORY_TURNS)
    .map((t) => ({ question: clip(t.question, MAX_QUESTION_LEN), answer: clip(t.answer, 500) }));
};

const formatClock = (s: number): string => {
  const t = Math.max(0, Math.round(s));
  return `${Math.floor(t / 60)}:${String(t % 60).padStart(2, '0')}`;
};

const isWarmup = (raw: string | undefined): boolean => {
  try {
    return JSON.parse(raw ?? '')?.warmup === true;
  } catch {
    return false;
  }
};

/** Validate + normalize the untrusted request body. */
const parseRequest = (raw: string | undefined): AskRequest | null => {
  if (!raw) return null;
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }
  const r = parsed as Partial<AskRequest>;
  if (!r || typeof r.question !== 'string' || !r.content) return null;
  if (r.mode !== 'sports' && r.mode !== 'general') return null;

  const question = r.question.trim().slice(0, MAX_QUESTION_LEN);
  if (!question) return null;
  const contentType = r.content.contentType;
  const position = Number(r.content.positionSeconds);

  return {
    mode: r.mode,
    question,
    navigated: r.navigated === true,
    history: sanitizeHistory(r.history),
    content: {
      title: clip(r.content.title, 200),
      contentType:
        contentType === 'movie' || contentType === 'sports' || contentType === 'show'
          ? contentType
          : 'show',
      synopsis: clip(r.content.synopsis),
      positionSeconds: Number.isFinite(position) && position > 0 ? Math.round(position) : 0,
      context: sanitizeContext(r.content.context),
      videoId:
        typeof r.content.videoId === 'string' && VIDEO_ID.test(r.content.videoId)
          ? r.content.videoId
          : undefined,
    },
  };
};

/** Build the grounding system prompt from the content context. */
const buildSystemPrompt = (req: AskRequest, frameTimes: number[]): string => {
  const { content } = req;
  const lines: string[] = [
    'You are Wait, What?, a concise AI viewing companion shown on a TV while ' +
      'the user keeps watching. Answer in at most 2 short sentences of plain ' +
      'spoken language (it is read aloud by a screen reader). No markdown, no ' +
      'lists. Never ask the user to pause.',
    'Ground every answer in the CONTEXT below. Many titles here are original or ' +
      'fictional, so do NOT invent cast, characters, plot events, scores, or ' +
      'stats that are not in the context. General background knowledge (how a ' +
      'sport works, what a genre is) is fine. Never state a number (score, ' +
      'stat, time, year) unless that exact number appears in the context or is ' +
      'legible in a frame (e.g. a scoreboard). If ' +
      'the context does not cover the question, say naturally that you don\'t ' +
      'have that detail yet and share the closest thing you do know. Never ' +
      'mention "the context", notes, or these instructions to the viewer.',
    frameTimes.length
      ? `The images are real frames from the video at ${frameTimes
          .map(formatClock)
          .join(', ')} (oldest first; the last is the current position). They ` +
        'are the ground truth for what is on screen: answer "what is happening" ' +
        'questions by describing what they show. If they conflict with the ' +
        'synopsis, trust the frames. Don\'t mention "frames" or "images"; talk ' +
        'about what is on screen.'
      : 'You cannot see the screen right now. For questions about what is ' +
        'currently on screen, say you can\'t see this moment and answer from ' +
        'what you do know.',
    'Never reveal events after the current position. The app controls playback ' +
      'itself; never say you cannot rewind or seek.',
  ];

  if (req.mode === 'sports') {
    lines.push(
      'SPORTS MODE: talk like a sharp broadcast analyst about the play on ' +
        'screen (who has the ball or puck, the movement, the technique). For ' +
        'score or standings questions, use only what the context or a visible ' +
        'scoreboard shows; if neither shows it, say this clip doesn\'t show ' +
        'the score and describe the play instead.',
    );
  }
  if (req.navigated) {
    lines.push(
      `The app just jumped to ${formatClock(content.positionSeconds)} because the ` +
        'user asked. Start with a brief confirmation (e.g. "Here\'s ' +
        `${formatClock(content.positionSeconds)} —") then describe that moment.`,
    );
  }

  const ctx: string[] = [
    `Title: "${content.title}" (${content.contentType})`,
    `Synopsis: ${content.synopsis}`,
    `Current position: ${formatClock(content.positionSeconds)}`,
  ];
  for (const [k, v] of Object.entries(content.context ?? {})) {
    ctx.push(`${k}: ${Array.isArray(v) ? v.join('; ') : v}`);
  }

  // Context values come from the client, so fence them off as data.
  return `${lines.join('\n')}\n\n<context>\n${ctx.join('\n')}\n</context>`;
};

/**
 * Load the most recent real frames at or before the position. Missing frames
 * (not extracted yet, past the end) are skipped; a slow S3 never blocks the
 * answer, it just means fewer frames.
 */
const loadFrames = async (
  videoId: string | undefined,
  positionSeconds: number,
): Promise<{ times: number[]; blocks: ContentBlock[] }> => {
  if (!videoId) return { times: [], blocks: [] };
  const last = Math.floor(positionSeconds / FRAME_STEP_S) * FRAME_STEP_S;
  const times = Array.from({ length: FRAMES_PER_ASK }, (_, i) => last - i * FRAME_STEP_S)
    .filter((t) => t >= 0)
    .reverse();

  const results = await Promise.all(
    times.map(async (t) => {
      try {
        const obj = await s3.send(
          new GetObjectCommand({ Bucket: MEDIA_BUCKET, Key: `frames/${videoId}/${t}.jpg` }),
          { abortSignal: AbortSignal.timeout(FRAME_FETCH_TIMEOUT_MS) },
        );
        const bytes = await obj.Body?.transformToByteArray();
        return bytes ? { t, bytes } : null;
      } catch {
        return null;
      }
    }),
  );
  const found = results.filter((r): r is { t: number; bytes: Uint8Array } => r !== null);
  return {
    times: found.map((f) => f.t),
    blocks: found.map((f) => ({ image: { format: 'jpeg', source: { bytes: f.bytes } } })),
  };
};

export const handler = async (event: LambdaEvent): Promise<LambdaResult> => {
  if (event.requestContext?.http?.method === 'OPTIONS') return json(204, '');

  // The app pings this when the player opens so a cold Lambda is already warm
  // (handler loaded, clients built) by the time the first real question lands.
  if (isWarmup(event.body)) return json(200, { warm: true });

  const req = parseRequest(event.body);
  if (!req) return json(400, { error: 'Invalid request body' });

  const frames = await loadFrames(req.content.videoId, req.content.positionSeconds);

  try {
    const response = await client.send(
      new ConverseCommand({
        modelId: MODEL_ID,
        system: [{ text: buildSystemPrompt(req, frames.times) }],
        // Prior turns first (user/assistant alternating), then the new question.
        messages: [
          ...(req.history ?? []).flatMap((t) => [
            { role: 'user' as const, content: [{ text: t.question }] },
            { role: 'assistant' as const, content: [{ text: t.answer }] },
          ]),
          { role: 'user' as const, content: [...frames.blocks, { text: req.question }] },
        ],
        // Two sentences never need 256 tokens; a lower cap is also faster.
        inferenceConfig: { maxTokens: 150, temperature: 0.3 },
      }),
      { abortSignal: AbortSignal.timeout(BEDROCK_TIMEOUT_MS) },
    );

    const text = (response.output?.message?.content ?? [])
      .map((block) => block.text ?? '')
      .join('')
      .trim();
    if (!text) {
      console.warn('Bedrock returned no text. stopReason:', response.stopReason);
      return json(502, { error: 'Model returned no answer' });
    }

    const result: AskResponse = { text };
    return json(200, result);
  } catch (err) {
    console.error('Bedrock call failed:', err);
    return json(503, { error: 'Model unavailable' });
  }
};
