import { GAME_SNAPSHOTS } from '@sidekick/data/seededSports';

/**
 * InterestTracker — the "adaptive learning" mechanic.
 *
 * SideKick remembers what you keep asking about. Every question is scanned for
 * known entities (players, cast, teams). When the same entity comes up enough
 * times, SideKick marks it a "learned interest" and will proactively pin it and
 * pre-surface related info — a moment that is *learned from your behavior*, not
 * scripted. This is what makes the companion feel like it adapts to you.
 *
 * Deliberately simple + deterministic (no server, no PII leaves the device):
 * an in-memory tally of entity mentions with a threshold.
 */

export interface LearnedInterest {
  entity: string;
  mentions: number;
  /** Where we can source facts about it (sports player, etc). */
  kind: 'player' | 'topic';
  gameId?: string;
}

const THRESHOLD = 2; // asked about twice => a learned interest

// Known entities we can recognize in a question. Players come from seeded data;
// extend with cast names, teams, etc. as the catalog grows.
const knownPlayers = (): { name: string; last: string; gameId: string }[] => {
  const out: { name: string; last: string; gameId: string }[] = [];
  for (const [gameId, game] of Object.entries(GAME_SNAPSHOTS)) {
    for (const p of game.players) {
      const last = p.name.split('. ').pop() ?? p.name;
      out.push({ name: p.name, last, gameId });
    }
  }
  return out;
};

export class InterestTracker {
  private counts = new Map<string, { entity: string; kind: 'player' | 'topic'; gameId?: string; n: number }>();
  private pinned = new Set<string>();

  /** Record a question; returns a newly-learned interest if one just crossed the threshold. */
  record(question: string): LearnedInterest | null {
    const q = question.toLowerCase();
    let hit: { entity: string; kind: 'player' | 'topic'; gameId?: string } | null = null;

    for (const p of knownPlayers()) {
      if (q.includes(p.last.toLowerCase())) {
        hit = { entity: p.name, kind: 'player', gameId: p.gameId };
        break;
      }
    }
    if (!hit) return null;

    const key = hit.entity.toLowerCase();
    const prev = this.counts.get(key);
    const n = (prev?.n ?? 0) + 1;
    this.counts.set(key, { ...hit, n });

    if (n >= THRESHOLD && !this.pinned.has(key)) {
      this.pinned.add(key);
      return { entity: hit.entity, mentions: n, kind: hit.kind, gameId: hit.gameId };
    }
    return null;
  }

  isPinned(entity: string): boolean {
    return this.pinned.has(entity.toLowerCase());
  }

  pinnedEntities(): string[] {
    return [...this.pinned];
  }
}
