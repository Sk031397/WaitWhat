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

  /**
   * Scripted proactive "scene insight" moments: at each timestamp SideKick
   * auto-surfaces a short insight (no question needed).
   */
  sceneMoments?: SceneMoment[];
}

/** A proactive scene-insight moment for general content. */
export interface SceneMoment {
  atSeconds: number;
  /** Short, 10-foot insight shown proactively. */
  text: string;
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
  /** True if this came from the seeded fallback, not live Bedrock. */
  fromFallback?: boolean;
  /** Playback position (seconds) when the user asked — timeline anchoring. */
  askedAtSeconds?: number;
  /** Formatted version of askedAtSeconds, e.g. "2:14". */
  askedAtLabel?: string;
  /** True when SideKick surfaced this proactively (no user question). */
  proactive?: boolean;
  /** True for a general-mode scene insight. */
  insight?: boolean;
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
  };
}

/** Response from the backend /ask endpoint. */
export interface AskResponse {
  text: string;
  fromFallback?: boolean;
}
