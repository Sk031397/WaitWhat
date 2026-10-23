import {SceneInsight} from '@sidekick/data/types';

/**
 * How far past an insight's time playback may be and still show it. Normal
 * playback crosses each time within one progress tick; a seek that lands well
 * past an insight shouldn't pop a stale note.
 */
export const INSIGHT_WINDOW_S = 3;

/**
 * The insight playback just reached, moving from `prev` to `now` seconds, or
 * null. Only forward, near-real-time progress triggers one, so seeking or
 * rewinding never replays or skips ahead into notes.
 */
export const dueInsight = (
  insights: SceneInsight[],
  prev: number,
  now: number,
): SceneInsight | null => {
  if (now <= prev || now - prev > INSIGHT_WINDOW_S) {
    return null;
  }
  return insights.find((i) => i.t > prev && i.t <= now) ?? null;
};
