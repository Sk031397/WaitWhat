/** Shared domain types for SideKick. */

export type ContentType = 'show' | 'movie' | 'sports';

export interface CatalogItem {
  id: string;
  title: string;
  /** Drives whether SideKick enters sports mode. */
  contentType: ContentType;
  /** MP4/HLS URL played by the W3C VideoPlayer. */
  videoUrl: string;
  /** Short synopsis used as grounding context for the AI. */
  synopsis: string;
  /** Rich context the AI can reference (cast, teams, etc). */
  context?: Record<string, string | string[]>;

  // ----- Landing-page UI fields -----
  /** Row this item appears in on the home screen (e.g. "Featured"). */
  row?: string;
  /** Card art (portrait/landscape thumbnail) for the grid. */
  thumbnail?: string;
  /** Wide hero image shown in the header when this item is focused. */
  headerImage?: string;
  genres?: string[];
  releaseYear?: number;
  /** Display rating, e.g. "8.7" or "LIVE". */
  rating?: string;
}

export type SideKickMode = 'general' | 'sports';

/** A single answer rendered in the overlay. */
export interface SideKickAnswer {
  id: string;
  mode: SideKickMode;
  question: string;
  /** Plain-language answer text. */
  text: string;
  /** True while awaiting the backend. */
  pending?: boolean;
  /** True when the model couldn't be reached; `text` explains, it's not an answer. */
  failed?: boolean;
  /** Playback position (seconds) when the user asked — timeline anchoring. */
  askedAtSeconds?: number;
  /** Formatted version of askedAtSeconds, e.g. "2:14". */
  askedAtLabel?: string;
  /** When the question asked to jump to a time, the resolved target (seconds). */
  jumpedToSeconds?: number;
  /** Formatted jumpedToSeconds, e.g. "0:10". */
  jumpedToLabel?: string;
}

/** A marker on the seek bar showing where a question was asked. */
export interface AskMarker {
  id: string;
  positionSeconds: number;
  mode: SideKickMode;
  /** The answer captured at this timestamp (for re-surfacing on marker select). */
  answer?: SideKickAnswer;
}

/** Request sent to the backend /ask endpoint. */
export interface AskRequest {
  mode: SideKickMode;
  question: string;
  content: {
    title: string;
    contentType: ContentType;
    synopsis: string;
    /** Current playback position in seconds — scene/play context. */
    positionSeconds: number;
    context?: Record<string, string | string[]>;
    /**
     * Frame-set id (the video file's stem). The backend loads real frames
     * extracted from this video up to positionSeconds and shows them to Nova.
     */
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

/** Response from the backend /ask endpoint. */
export interface AskResponse {
  text: string;
  /** True when no model answer was produced; `text` is an error message. */
  failed?: boolean;
}
