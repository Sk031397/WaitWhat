import { spawnSync } from 'child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { BedrockRuntimeClient, ConverseCommand } from '@aws-sdk/client-bedrock-runtime';
import type { ContentBlock } from '@aws-sdk/client-bedrock-runtime';
import { GetObjectCommand, ListObjectsV2Command, S3Client } from '@aws-sdk/client-s3';
import { CATALOG } from '../src/data/catalog';
import { videoIdFor } from '../src/sidekick/ModeRouter';
import type { CatalogItem } from '../src/data/types';

/**
 * Pre-generates the proactive "scene insights" the app shows unprompted.
 *
 * For every catalog video it reads the frames already in S3 (extract-frames.sh),
 * finds scene changes with ffmpeg, asks Nova Lite for a one-line note about each
 * new scene, and writes src/data/insights.ts. Doing this offline means insights
 * cost nothing at playback time and appear instantly.
 *
 *   cd backend && npm run insights          (needs AWS creds + ffmpeg)
 *   FFMPEG=/path/to/ffmpeg npm run insights
 */

const REGION = process.env.AWS_REGION ?? 'us-east-1';
const BUCKET = process.env.MEDIA_BUCKET ?? 'sidekickvegaos';
const MODEL_ID = process.env.BEDROCK_MODEL_ID ?? 'us.amazon.nova-lite-v1:0';
const FFMPEG = process.env.FFMPEG ?? 'ffmpeg';
const OUT = join(__dirname, '..', 'src', 'data', 'insights.ts');

// ffmpeg scene score (0..1) above which consecutive frames count as a cut.
const SCENE_THRESHOLD = 0.3;
const MIN_GAP_S = 20; // don't nag: at most one insight per 20s
const MAX_PER_VIDEO = 6;
const SKIP_FIRST_S = 4; // the opening is covered by the mode banner

const s3 = new S3Client({ region: REGION });
const bedrock = new BedrockRuntimeClient({ region: REGION, maxAttempts: 4 });

interface Insight {
  /** When to show the card (seconds). */
  t: number;
  text: string;
}

/**
 * Hand-written insights, checked frame by frame, for the short sports clips.
 * The model misreads them (the ball is a few pixels, so it guesses passes,
 * hits and misses), and each clip only needs one note. Used instead of the
 * model for these ids.
 */
const MANUAL: Record<string, Insight[]> = {
  basketball: [{ t: 6, text: 'The player in the white tank top gets a step and drives to the rim.' }],
  american_football: [{ t: 8, text: 'The play collapses into a pileup around the 30-yard line.' }],
  hockey: [{ t: 8, text: 'Black jerseys win the battle on the boards and push toward the net.' }],
  soccer: [{ t: 4, text: 'The maroon player lines up a shot on goal.' }],
  tennis: [{ t: 6, text: 'Long rally: both players stay pinned deep behind the baseline.' }],
  boxing: [{ t: 8, text: 'The fighters close the distance and trade at short range.' }],
  wrestling: [{ t: 2, text: 'The wrestler in red takes his opponent to the mat as the referee watches.' }],
  baseball: [{ t: 4, text: 'The catcher stands to follow the play out into the field.' }],
  rowing: [{ t: 8, text: "Three crews row in parallel lanes as the coach's launch shadows them." }],
};

const listFrameTimes = async (videoId: string): Promise<number[]> => {
  const times: number[] = [];
  let token: string | undefined;
  do {
    const page = await s3.send(
      new ListObjectsV2Command({ Bucket: BUCKET, Prefix: `frames/${videoId}/`, ContinuationToken: token }),
    );
    for (const o of page.Contents ?? []) {
      const m = o.Key?.match(/\/(\d+)\.jpg$/);
      if (m) times.push(Number(m[1]));
    }
    token = page.NextContinuationToken;
  } while (token);
  return times.sort((a, b) => a - b);
};

const getFrame = async (videoId: string, t: number): Promise<Uint8Array> => {
  const obj = await s3.send(new GetObjectCommand({ Bucket: BUCKET, Key: `frames/${videoId}/${t}.jpg` }));
  return obj.Body!.transformToByteArray();
};

/** Frame times where a new scene starts, by ffmpeg's scene-change score. */
const sceneChanges = async (videoId: string, times: number[]): Promise<number[]> => {
  const dir = mkdtempSync(join(tmpdir(), 'ww-insights-'));
  try {
    // Download in parallel batches; long films have hundreds of frames.
    for (let i = 0; i < times.length; i += 16) {
      await Promise.all(
        times.slice(i, i + 16).map(async (t, j) =>
          writeFileSync(join(dir, `${i + j + 1}.jpg`), await getFrame(videoId, t)),
        ),
      );
    }
    // One input frame per second, so pts_time is the 0-based frame index.
    // showinfo logs each selected frame to stderr.
    const res = spawnSync(
      FFMPEG,
      ['-hide_banner', '-framerate', '1', '-start_number', '1', '-i', join(dir, '%d.jpg'),
        '-vf', `select='gt(scene,${SCENE_THRESHOLD})',showinfo`, '-f', 'null', '-'],
      { encoding: 'utf8' },
    );
    if (res.status !== 0) throw new Error(`ffmpeg failed: ${res.error ?? res.stderr.slice(-500)}`);
    return [...res.stderr.matchAll(/pts_time:([\d.]+)/g)]
      .map((m) => times[Math.round(Number(m[1]))])
      .filter((t): t is number => t !== undefined);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
};

/** Pick well-spaced moments; fall back to one mid-clip moment for short clips. */
const pickMoments = (cuts: number[], times: number[]): number[] => {
  const picked: number[] = [];
  for (const t of cuts) {
    if (t < SKIP_FIRST_S) continue;
    if (picked.length && t - picked[picked.length - 1] < MIN_GAP_S) continue;
    picked.push(t);
    if (picked.length === MAX_PER_VIDEO) break;
  }
  if (!picked.length && times.length > 2) {
    picked.push(times[Math.floor(times.length * 0.4)]);
  }
  return picked;
};

const contextLines = (item: CatalogItem): string => {
  const lines = [`Title: "${item.title}" (${item.contentType})`, `Synopsis: ${item.synopsis}`];
  for (const [k, v] of Object.entries(item.context ?? {})) {
    lines.push(`${k}: ${Array.isArray(v) ? v.join('; ') : v}`);
  }
  return lines.join('\n');
};

/** Retry transient network errors (e.g. an HTTP/2 session dropped while idle). */
const withRetry = async <T>(fn: () => Promise<T>, tries = 3): Promise<T> => {
  for (let i = 1; ; i++) {
    try {
      return await fn();
    } catch (err) {
      if (i >= tries) throw err;
      console.warn(`   retrying after: ${(err as Error).message}`);
      await new Promise((r) => setTimeout(r, 1000 * i));
    }
  }
};

const describeMoment = async (item: CatalogItem, videoId: string, frameTimes: number[]): Promise<string> => {
  const blocks: ContentBlock[] = [];
  for (const t of frameTimes) {
    blocks.push({ image: { format: 'jpeg', source: { bytes: await getFrame(videoId, t) } } });
  }
  const sports = item.contentType === 'sports';
  const res = await bedrock.send(
    new ConverseCommand({
      modelId: MODEL_ID,
      system: [
        {
          text:
            'You write the short note a TV viewing companion pops up, unprompted, when a ' +
            'new scene starts. One line, at most 12 words, present tense, no quotes, no ' +
            'markdown. Say something useful about what just appeared on screen ' +
            (sports
              ? '(the play, the formation, the moment), like a sharp broadcast analyst. ' +
                'The ball or puck is often too small to follow, so describe positions ' +
                'and movement, not passes, hits or misses. '
              : '(who or what is on screen, where we are, what is changing). ') +
            'Describe only what is clearly visible. Never claim an outcome you cannot ' +
            'see happen (a goal, a miss, an interception, a knockout), and never invent ' +
            'scores, stats or plot events or hint at what happens later. Name a ' +
            'character only when the context lists a single main character; otherwise ' +
            'describe people by what they wear or do. Never mention frames, images or ' +
            'the camera. If the scene is a title card, credits or a blank screen, reply ' +
            `exactly SKIP.\n\n<context>\n${contextLines(item)}\n</context>`,
        },
      ],
      messages: [{ role: 'user', content: [...blocks, { text: 'Write the note for this new scene.' }] }],
      inferenceConfig: { maxTokens: 40, temperature: 0.2 },
    }),
  );
  return (res.output?.message?.content ?? [])
    .map((b) => b.text ?? '')
    .join('')
    .trim()
    .replace(/^["“]|["”]$/g, '');
};

const run = async () => {
  const all: Record<string, Insight[]> = {};
  for (const item of CATALOG) {
    const videoId = videoIdFor(item.videoUrl);
    if (MANUAL[videoId]) {
      all[videoId] = MANUAL[videoId];
      console.log(`== ${item.title}: ${MANUAL[videoId].length} insights (hand-written)`);
      continue;
    }
    const times = await listFrameTimes(videoId);
    if (!times.length) {
      console.warn(`== ${item.title}: no frames in S3, skipped (run scripts/extract-frames.sh)`);
      continue;
    }
    const moments = pickMoments(await sceneChanges(videoId, times), times);
    const insights: Insight[] = [];
    for (const t of moments) {
      // The new scene's first frame plus the next one; show once both have aired.
      const next = times.find((x) => x > t);
      const frames = next !== undefined ? [t, next] : [t];
      const text = await withRetry(() => describeMoment(item, videoId, frames));
      if (text && text !== 'SKIP') insights.push({ t: frames[frames.length - 1], text });
      console.log(`   ${t}s  ${text}`);
    }
    console.log(`== ${item.title}: ${insights.length} insights`);
    all[videoId] = insights;
  }

  const header =
    '// GENERATED by backend/generateInsights.ts — do not edit by hand.\n' +
    '// Regenerate: cd backend && npm run insights\n\n' +
    "import {SceneInsight} from './types';\n\n" +
    '/** Proactive scene insights per video id (see videoIdFor), in time order. */\n' +
    'export const INSIGHTS: Record<string, SceneInsight[]> = ';
  writeFileSync(OUT, `${header}${JSON.stringify(all, null, 2)};\n`);
  console.log(`\nWrote ${OUT}`);
};

void run().catch((err) => {
  console.error(err);
  process.exit(1);
});
