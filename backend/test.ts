import type { AskRequest } from './types';

/**
 * Lightweight test harness (no framework needed). Forces the Bedrock call to
 * fail deterministically (bogus model id + an unroutable endpoint, so the SDK
 * errors immediately instead of making real calls), so we exercise request
 * validation, auth, and the error path — which must never invent an answer.
 * Run: npm test
 */
process.env.BEDROCK_MODEL_ID = 'nonexistent.model';
process.env.AWS_REGION = 'us-east-1';
process.env.AWS_ENDPOINT_URL = 'http://127.0.0.1:1';
process.env.AWS_ACCESS_KEY_ID = 'test';
process.env.AWS_SECRET_ACCESS_KEY = 'test';

/** Load a fresh handler so it re-reads env (e.g. ASK_API_KEY). */
const loadHandler = async () => {
  delete require.cache[require.resolve('./handler')];
  return (await import('./handler')).handler;
};

let passed = 0;
let failed = 0;

const assert = (cond: boolean, msg: string): void => {
  if (cond) {
    passed++;
    console.log(`  ✓ ${msg}`);
  } else {
    failed++;
    console.error(`  ✗ ${msg}`);
  }
};

const generalReq = (question: string): AskRequest => ({
  mode: 'general',
  question,
  content: {
    title: 'The Northern Expanse',
    contentType: 'show',
    synopsis: 'A survival drama in the arctic.',
    positionSeconds: 300,
    context: { cast: ['Mara Lindqvist as Dr. Elin Vos'] },
  },
});

const run = async () => {
  console.log('SideKick backend tests (validation, auth, error path):');
  delete process.env.ASK_API_KEY;
  const handler = await loadHandler();
  const call = async (req: unknown) => {
    const res = await handler({ body: JSON.stringify(req) });
    return { status: res.statusCode, data: JSON.parse(res.body) };
  };

  // 1. Invalid body -> 400
  const bad = await handler({ body: 'not json' });
  assert(bad.statusCode === 400, 'invalid body returns 400');

  // 2. Missing fields -> 400
  const missing = await handler({ body: JSON.stringify({ mode: 'general' }) });
  assert(missing.statusCode === 400, 'missing content returns 400');

  // 3. Blank question -> 400
  const blank = await call(generalReq('   '));
  assert(blank.status === 400, 'blank question returns 400');

  // 4. Model unavailable -> error, never a made-up answer
  const down = await call(generalReq('Who is in this scene?'));
  assert(down.status === 503, 'model failure returns 503');
  assert(down.data.text === undefined, 'model failure returns no answer text');

  // 5. Sports request validates and reaches the model (then fails the same way)
  const sports = await call({
    mode: 'sports',
    question: "What's the score?",
    content: {
      title: 'Coastal Kings vs. Summit City — Q4',
      contentType: 'sports',
      synopsis: 'Fourth quarter, close game.',
      positionSeconds: 120,
    },
  });
  assert(sports.status === 503, 'sports request passes validation');

  // 6. Hostile/oversized input is normalized, not rejected
  const messy = await call({
    ...generalReq('x'.repeat(5000)),
    history: [{ question: 'Who is Elin?', answer: 'The lead scientist.' }, { bogus: true }],
  });
  assert(messy.status === 503, 'oversized question + junk history passes validation');

  // 7. Shared key: enforced only when ASK_API_KEY is set
  process.env.ASK_API_KEY = 'k';
  const keyed = await loadHandler();
  const body = JSON.stringify(generalReq('hi'));
  const denied = await keyed({ body, headers: {} });
  assert(denied.statusCode === 401, 'missing key returns 401');
  const allowed = await keyed({ body, headers: { 'x-ww-key': 'k' } });
  assert(allowed.statusCode !== 401, 'correct key is accepted');

  // 8. Warm-up ping: answered without touching the model, still behind the key
  const warmBody = JSON.stringify({ warmup: true });
  const warm = await keyed({ body: warmBody, headers: { 'x-ww-key': 'k' } });
  assert(warm.statusCode === 200, 'warm-up ping returns 200');
  const warmDenied = await keyed({ body: warmBody, headers: {} });
  assert(warmDenied.statusCode === 401, 'warm-up ping still needs the key');

  console.log(`\n${passed} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
};

void run();
