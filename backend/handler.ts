import {
  BedrockRuntimeClient,
  ConverseCommand,
} from '@aws-sdk/client-bedrock-runtime';
import type { AskRequest, AskResponse } from './types';

/**
 * SideKick /ask backend.
 *
 * Receives an AskRequest from the TV app, grounds Amazon Bedrock (Nova) with
 * the current content context, and returns a short, 10-foot-friendly answer.
 *
 * If Bedrock is unavailable (no model access, throttling, timeout) we fall
 * back to a deterministic seeded answer so the client always gets a response.
 *
 * SECURITY: the request body is untrusted. We validate shape and clamp the
 * question length before putting it in a prompt.
 */

// Nova Lite via cross-region inference profile (us. prefix) for availability.
// Verify with: aws bedrock list-inference-profiles --region us-east-1
const MODEL_ID = process.env.BEDROCK_MODEL_ID ?? 'us.amazon.nova-lite-v1:0';
const REGION = process.env.AWS_REGION ?? 'us-east-1';
const MAX_QUESTION_LEN = 300;

const client = new BedrockRuntimeClient({
  region: REGION,
  maxAttempts: 5,
  retryMode: 'adaptive',
});

interface LambdaEvent {
  body?: string;
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

  return {
    mode: r.mode,
    question: r.question.slice(0, MAX_QUESTION_LEN),
    content: {
      title: String(r.content.title ?? ''),
      contentType: r.content.contentType ?? 'show',
      synopsis: String(r.content.synopsis ?? ''),
      positionSeconds: Number(r.content.positionSeconds ?? 0),
      context: r.content.context,
    },
  };
};

/** Build the grounding system prompt from the content context. */
const buildSystemPrompt = (req: AskRequest): string => {
  const base =
    'You are Wait, What?, a concise AI viewing companion shown on a TV while ' +
    'the user keeps watching. Answer in at most 2 short sentences, in plain ' +
    'spoken language suitable for reading on screen. Never ask the user to ' +
    'pause. Prefer the provided context below when it answers the question; ' +
    'otherwise use your general knowledge to give a helpful, direct answer ' +
    'about the title, cast, plot, sport, teams, or players. Only say you are ' +
    'not sure if the question is genuinely unanswerable. ' +
    'IMPORTANT: SideKick CAN control playback — it can rewind, fast-forward, ' +
    'and jump to any timestamp, and the app performs the seek for you. Never ' +
    'say you cannot rewind or that the scene will repeat. If the user asked to ' +
    'go to a moment, briefly confirm it (e.g. "Here\'s that moment —") and then ' +
    'describe what is happening there.';

  const ctx = req.content.context
    ? ` Known context: ${JSON.stringify(req.content.context)}.`
    : '';
  return (
    `${base}\nNow playing: "${req.content.title}" (${req.content.contentType}) — ` +
    `${req.content.synopsis}.${ctx} Current position: ${req.content.positionSeconds}s. ` +
    'If asked about an actor, character, plot point, or background not in the ' +
    'context, answer from general knowledge about this kind of title.'
  );
};

/** Deterministic fallback mirrored on the client (bedrockClient.seededFallback). */
const seededFallback = (req: AskRequest): AskResponse => {
  const q = req.question.toLowerCase();

  // General fallback — use whatever context the show provided.
  const ctx = req.content.context ?? {};
  if (q.includes('who') && Array.isArray(ctx.cast)) {
    return {
      text: `This episode features ${(ctx.cast as string[]).join(', ')}.`,
      fromFallback: true,
    };
  }
  if ((q.includes('last') || q.includes('previous') || q.includes('before')) && ctx.previousEpisode) {
    return { text: String(ctx.previousEpisode), fromFallback: true };
  }

  return {
    text: `You're watching "${req.content.title}". ${req.content.synopsis}`,
    fromFallback: true,
  };
};

export const handler = async (event: LambdaEvent): Promise<LambdaResult> => {
  // ----- Default: the /ask (Bedrock) flow -----
  const req = parseRequest(event.body);
  if (!req) return json(400, { error: 'Invalid request body' });

  try {
    const response = await client.send(
      new ConverseCommand({
        modelId: MODEL_ID,
        system: [{ text: buildSystemPrompt(req) }],
        messages: [{ role: 'user', content: [{ text: req.question }] }],
        inferenceConfig: { maxTokens: 256, temperature: 0.3 },
      }),
    );

    const text =
      response.output?.message?.content?.[0]?.text?.trim() ??
      seededFallback(req).text;

    const result: AskResponse = {
      text,
      fromFallback: false,
    };
    return json(200, result);
  } catch (err) {
    // Bedrock unavailable → graceful seeded answer, still HTTP 200.
    console.error('Bedrock call failed, using fallback:', err);
    return json(200, seededFallback(req));
  }
};
