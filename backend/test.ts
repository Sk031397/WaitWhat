import { handler } from './handler';
import type { AskRequest } from './types';

/**
 * Lightweight test harness (no framework needed). Forces the Bedrock path to
 * fail deterministically (bogus model id + an unroutable endpoint, so the SDK
 * errors immediately instead of making real retried calls), so we exercise the
 * seeded fallback and assert the shape of each answer. Run: npm test
 */
process.env.BEDROCK_MODEL_ID = 'nonexistent.model';
process.env.AWS_REGION = 'us-east-1';
process.env.AWS_ENDPOINT_URL = 'http://127.0.0.1:1';
process.env.AWS_ACCESS_KEY_ID = 'test';
process.env.AWS_SECRET_ACCESS_KEY = 'test';

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

const call = async (req: AskRequest) => {
  const res = await handler({ body: JSON.stringify(req) });
  return { status: res.statusCode, data: JSON.parse(res.body) };
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
  console.log('SideKick backend tests (fallback path):');

  // 1. Invalid body -> 400
  const bad = await handler({ body: 'not json' });
  assert(bad.statusCode === 400, 'invalid body returns 400');

  // 2. Missing fields -> 400
  const missing = await handler({ body: JSON.stringify({ mode: 'general' }) });
  assert(missing.statusCode === 400, 'missing content returns 400');

  // 3. General "who" -> cast
  const who = await call(generalReq('Who is in this scene?'));
  assert(who.status === 200, 'general question returns 200');
  assert(who.data.fromFallback === true, 'who question used fallback');
  assert(who.data.text.includes('Lindqvist'), 'who answer includes cast member');

  // 4. Generic general -> synopsis
  const generic = await call(generalReq('Tell me about this'));
  assert(generic.data.text.includes('Northern Expanse'), 'generic answer references title');

  // 5. Sports mode still answers (no stat cards, just a grounded fallback)
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
  assert(sports.status === 200, 'sports question returns 200');
  assert(typeof sports.data.text === 'string' && sports.data.text.length > 0, 'sports answer has text');

  console.log(`\n${passed} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
};

void run();
