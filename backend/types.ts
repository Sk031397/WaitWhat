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
    /** Frame-set id (video file stem): frames live at frames/<videoId>/<sec>.jpg. */
    videoId?: string;
  };
  /** True when the app just seeked to positionSeconds because the user asked to. */
  navigated?: boolean;
  /** Recent exchanges about this title, oldest first, so follow-ups make sense. */
  history?: AskTurn[];
}

/** One prior question/answer pair. */
export interface AskTurn {
  question: string;
  answer: string;
}

export interface AskResponse {
  text: string;
  /** True when no model answer was produced; `text` is an error message. */
  failed?: boolean;
}
