import {AskRequest, AskResponse} from '@sidekick/data/types';
import {ASK_ENDPOINT, isPlaceholderEndpoint} from '@sidekick/config';

/**
 * bedrockClient — talks to the SideKick backend `/ask` endpoint, which runs
 * Amazon Bedrock (Nova) server-side. Keeping Bedrock behind a small backend
 * means no AWS credentials ever ship inside the TV app.
 *
 * The endpoint comes from src/config.ts (ASK_ENDPOINT). Every answer comes from
 * the model; if it can't be reached we say so instead of inventing one.
 */

let endpoint = ASK_ENDPOINT;
export const setAskEndpoint = (url: string): void => {
  endpoint = url;
};

// Backend allows Bedrock 8s (it now reads video frames), plus S3 + network.
const REQUEST_TIMEOUT_MS = 11000;

export const ask = async (req: AskRequest): Promise<AskResponse> => {
  if (isPlaceholderEndpoint(endpoint)) {
    return failure(
      "Wait, What? isn't connected yet. Set ASK_ENDPOINT in src/config.ts.",
    );
  }
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(req),
      signal: controller.signal,
    });
    if (!res.ok) {
      throw new Error(`Backend returned ${res.status}`);
    }
    const data = (await res.json()) as Partial<AskResponse>;
    if (typeof data?.text !== 'string' || !data.text.trim()) {
      throw new Error('Backend returned no answer text');
    }
    return {text: data.text};
  } catch (err) {
    console.warn('[SideKick] /ask failed:', err);
    return failure("Couldn't reach Wait, What? just now. Try asking again.");
  } finally {
    // Covers the body read too, not just the headers.
    clearTimeout(timer);
  }
};

const failure = (text: string): AskResponse => ({text, failed: true});

/**
 * Fire-and-forget ping so a cold Lambda is warm before the first question.
 * Errors are ignored: a failed warm-up just means the first ask is slower.
 */
export const warmUp = (): void => {
  if (isPlaceholderEndpoint(endpoint)) {
    return;
  }
  fetch(endpoint, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({warmup: true}),
  }).catch(() => {});
};
