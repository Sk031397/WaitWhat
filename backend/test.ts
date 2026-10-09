import { handler } from './handler';
import type { AskRequest } from './types';

/**
 * Lightweight test harness (no framework needed). Forces the Bedrock path to
 * fail by using a bogus model id + region so we deterministically exercise the
 * seeded fallback, then asserts the shape of each answer. Run: npm test
 */
process.env.BEDROCK_MODEL_ID = 'nonexistent.model';
process.env.AWS_REGION = 'us-east-1';

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

const sportsReq = (question: string): AskRequest => ({
  mode: 'sports',
  question,
  content: {
    title: 'Coastal Kings vs. Summit City — Q4',
    contentType: 'sports',
    synopsis: 'Fourth quarter, close game.',
    positionSeconds: 120,
    gameId: 'game01',
  },
});

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

  // 3. Player stat lookup -> stat card with PTS
  const okafor = await call(sportsReq("What are Okafor's stats?"));
  assert(okafor.status === 200, 'player question returns 200');
  assert(okafor.data.fromFallback === true, 'player question used fallback');
  assert(!!okafor.data.statCard, 'player question has a stat card');
  assert(
    okafor.data.statCard?.heading?.includes('Okafor'),
    'stat card is for Okafor',
  );
  assert(okafor.data.text.includes('31'), 'answer includes 31 points');

  // 4. Catch me up -> recap + scoreboard
  const recap = await call(sportsReq('Catch me up on what I missed'));
  assert(recap.data.text.toLowerCase().includes('summit city'), 'recap mentions team');
  assert(!!recap.data.statCard, 'recap has a scoreboard card');

  // 5. Score question -> scoreboard
  const score = await call(sportsReq("What's the score?"));
  assert(score.data.text.includes('98') && score.data.text.includes('94'), 'score answer has both scores');

  // 6. General "who" -> cast
  const who = await call(generalReq('Who is in this scene?'));
  assert(who.status === 200, 'general question returns 200');
  assert(who.data.text.includes('Lindqvist'), 'who answer includes cast member');
  assert(who.data.statCard === undefined, 'general answer has no stat card');

  // 7. Generic general -> synopsis
  const generic = await call(generalReq('Tell me about this'));
  assert(generic.data.text.includes('Northern Expanse'), 'generic answer references title');

  console.log(`\n${passed} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
};

void run();
