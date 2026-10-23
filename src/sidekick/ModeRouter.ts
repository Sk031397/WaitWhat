import {
  AskRequest,
  AskTurn,
  CatalogItem,
  SideKickMode,
} from '@sidekick/data/types';

/**
 * ModeRouter — the heart of SideKick's "context awareness".
 *
 * It takes a snapshot of what's playing plus the user's spoken question and
 * assembles the grounding context the AI needs. The SAME pipeline serves both
 * modes; only the context payload differs:
 *   - general mode: show synopsis + cast / previous-episode context
 *   - sports mode:  grounds the model on the game context (teams, venue)
 *
 * This is why combining "ask about anything" and "sports companion" is one
 * coherent product rather than two apps: a single gesture, a single pipeline,
 * context-selected behavior.
 */
export const buildAskRequest = (
  item: CatalogItem,
  positionSeconds: number,
  mode: SideKickMode,
  question: string,
  navigated = false,
  history: AskTurn[] = [],
): AskRequest => ({
  mode,
  question,
  navigated,
  history,
  content: {
    title: item.title,
    contentType: item.contentType,
    synopsis: item.synopsis,
    positionSeconds: Math.round(positionSeconds),
    context: item.context,
    // The backend shows Nova real frames from this video up to the position.
    videoId: videoIdFor(item.videoUrl),
  },
});

/** Frame-set id for a video URL: its file name without extension. */
export const videoIdFor = (url: string): string =>
  (url.split('?')[0].split('/').pop() ?? '').replace(/\.[a-z0-9]+$/i, '');

/**
 * Suggested prompts shown as hints, tailored to the active mode. Gives the
 * demo clear, reliable things to ask on camera.
 */
export const suggestedPrompts = (mode: SideKickMode): string[] =>
  mode === 'sports'
    ? ['Catch me up', "What's the score?", "Who's winning?"]
    : [
        "What's happening right now?",
        "What's this about?",
        'Who are the main characters?',
      ];
