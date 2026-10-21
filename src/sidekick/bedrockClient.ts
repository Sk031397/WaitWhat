import { AskRequest, AskResponse } from '@sidekick/data/types';
import { ASK_ENDPOINT, isPlaceholderEndpoint } from '@sidekick/config';

/**
 * bedrockClient — talks to the SideKick backend `/ask` endpoint, which runs
 * Amazon Bedrock (Nova) server-side. Keeping Bedrock behind a small backend
 * means no AWS credentials ever ship inside the TV app.
 *
 * The endpoint comes from src/config.ts (ASK_ENDPOINT). Until it's set to a
 * real deployed URL, or if the backend is unreachable (offline demo), we fall
 * back to a fully local seeded answer so the on-device experience never breaks.
 */

let endpoint = ASK_ENDPOINT;
export const setAskEndpoint = (url: string): void => {
  endpoint = url;
};

const REQUEST_TIMEOUT_MS = 6000;

export const ask = async (req: AskRequest): Promise<AskResponse> => {
  // No real endpoint configured yet → go straight to the seeded fallback
  // (keeps the demo fully functional offline, no failed network round-trip).
  if (isPlaceholderEndpoint(endpoint)) {
    return seededFallback(req);
  }
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req),
      signal: controller.signal,
    });
    clearTimeout(timer);

    if (!res.ok) throw new Error(`Backend returned ${res.status}`);
    const data = (await res.json()) as AskResponse;
    return data;
  } catch (err) {
    // Graceful local fallback keeps the demo bulletproof.
    return seededFallback(req);
  }
};

/**
 * Local seeded fallback. Mirrors what the backend's own fallback produces,
 * so behavior is consistent whether or not Bedrock is reachable.
 */
export const seededFallback = (req: AskRequest): AskResponse => {
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
