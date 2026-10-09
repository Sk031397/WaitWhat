/** Shared domain types for the SideKick backend (mirrors src/data/types.ts). */

export type ContentType = 'show' | 'movie' | 'sports';
export type SideKickMode = 'general' | 'sports';

export interface StatRow {
  label: string;
  value: string;
  highlight?: boolean;
}

export interface StatCard {
  heading: string;
  subheading?: string;
  rows: StatRow[];
}

export interface AskRequest {
  mode: SideKickMode;
  question: string;
  content: {
    title: string;
    contentType: ContentType;
    synopsis: string;
    positionSeconds: number;
    gameId?: string;
    context?: Record<string, string | string[]>;
  };
}

export interface AskResponse {
  text: string;
  statCard?: StatCard;
  fromFallback?: boolean;
}
