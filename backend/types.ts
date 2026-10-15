/** Shared domain types for the SideKick backend (mirrors src/data/types.ts). */

export type ContentType = 'show' | 'movie' | 'sports';
export type SideKickMode = 'general' | 'sports';

export interface AskRequest {
  mode: SideKickMode;
  question: string;
  content: {
    title: string;
    contentType: ContentType;
    synopsis: string;
    positionSeconds: number;
    context?: Record<string, string | string[]>;
  };
}

export interface AskResponse {
  text: string;
  fromFallback?: boolean;
}
