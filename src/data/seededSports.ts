import { StatCard } from './types';

/**
 * Seeded sports data for the demo. Two jobs:
 *   1. On-device: lets sports-mode stat cards render instantly and
 *      deterministically during the demo video (no flaky live API).
 *   2. Backend: the Lambda imports the same shape as grounding context
 *      for Bedrock, and as the fallback if Bedrock is unavailable.
 *
 * The data is a plausible snapshot of a fictional game so there are no
 * third-party trademarks in the submission.
 */

export interface PlayerStatLine {
  name: string;
  team: string;
  points: number;
  rebounds: number;
  assists: number;
  fieldGoalPct: number;
}

export interface GameSnapshot {
  gameId: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  quarter: string;
  clock: string;
  players: PlayerStatLine[];
  /** Plain-language recap used for "catch me up". */
  recap: string;
}

export const GAME_SNAPSHOTS: Record<string, GameSnapshot> = {
  game01: {
    gameId: 'game01',
    homeTeam: 'Summit City',
    awayTeam: 'Coastal Kings',
    homeScore: 98,
    awayScore: 94,
    quarter: 'Q4',
    clock: '6:12',
    players: [
      { name: 'A. Okafor', team: 'Summit City', points: 31, rebounds: 12, assists: 4, fieldGoalPct: 54 },
      { name: 'D. Reyes', team: 'Summit City', points: 18, rebounds: 3, assists: 9, fieldGoalPct: 47 },
      { name: 'J. Thorne', team: 'Coastal Kings', points: 27, rebounds: 5, assists: 6, fieldGoalPct: 49 },
      { name: 'M. Vance', team: 'Coastal Kings', points: 22, rebounds: 8, assists: 2, fieldGoalPct: 51 },
    ],
    recap:
      'Summit City leads 98-94 midway through the fourth. A. Okafor is having a monster night with a 31-point, 12-rebound double-double. Coastal Kings clawed back from a 12-point third-quarter deficit behind J. Thorne, who has 27. Summit City is in the bonus, so expect free throws down the stretch.',
  },
};

/** Build a ready-to-render stat card for a player, from seeded data. */
export const playerStatCard = (gameId: string, playerName: string): StatCard | undefined => {
  const game = GAME_SNAPSHOTS[gameId];
  if (!game) return undefined;
  const p = game.players.find(
    (pl) => pl.name.toLowerCase().includes(playerName.toLowerCase()),
  );
  if (!p) return undefined;
  return {
    heading: p.name,
    subheading: `${p.team} • ${game.quarter} ${game.clock}`,
    rows: [
      { label: 'PTS', value: String(p.points), highlight: p.points >= 25 },
      { label: 'REB', value: String(p.rebounds) },
      { label: 'AST', value: String(p.assists) },
      { label: 'FG%', value: `${p.fieldGoalPct}%` },
    ],
  };
};

/** Build a scoreboard stat card from seeded data. */
export const scoreboardCard = (gameId: string): StatCard | undefined => {
  const game = GAME_SNAPSHOTS[gameId];
  if (!game) return undefined;
  return {
    heading: `${game.awayTeam} ${game.awayScore} — ${game.homeScore} ${game.homeTeam}`,
    subheading: `${game.quarter} • ${game.clock} remaining`,
    rows: game.players.map((p) => ({
      label: `${p.name} (${p.team === game.homeTeam ? 'H' : 'A'})`,
      value: `${p.points} PTS`,
      highlight: p.points >= 25,
    })),
  };
};

/**
 * Seeded "big play" moments for proactive surfacing. In sports mode, when
 * playback crosses one of these timestamps, SideKick auto-surfaces a StatCard
 * — intelligence without being asked. Scripted so the demo is reliable.
 */
export interface BigPlay {
  atSeconds: number;
  gameId: string;
  player: string;
  text: string;
}

export const BIG_PLAYS: BigPlay[] = [
  {
    atSeconds: 8,
    gameId: 'game01',
    player: 'A. Okafor',
    text: 'A. Okafor just hit 31 — a season high and a double-double night.',
  },
];

/** Find a big play whose timestamp was just crossed between prev and now. */
export const bigPlayCrossed = (prev: number, now: number): BigPlay | undefined =>
  BIG_PLAYS.find((bp) => prev < bp.atSeconds && now >= bp.atSeconds);
