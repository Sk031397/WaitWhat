import { StatCard } from './types';

/**
 * Seeded sports data (mirrors src/data/seededSports.ts). Serves as both
 * grounding context for Bedrock and the deterministic fallback. Fictional
 * teams/players — no third-party trademarks.
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

export const playerStatCard = (gameId: string, playerName: string): StatCard | undefined => {
  const game = GAME_SNAPSHOTS[gameId];
  if (!game) return undefined;
  const p = game.players.find((pl) => pl.name.toLowerCase().includes(playerName.toLowerCase()));
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
