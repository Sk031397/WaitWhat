import { AskRequest, CatalogItem, SideKickMode } from '@sidekick/data/types';

/**
 * ModeRouter — the heart of SideKick's "context awareness".
 *
 * It takes a snapshot of what's playing plus the user's spoken question and
 * assembles the grounding context the AI needs. The SAME pipeline serves both
 * modes; only the context payload differs:
 *   - general mode: show synopsis + cast / previous-episode context
 *   - sports mode:  attaches the gameId so the backend can ground on live stats
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
): AskRequest => ({
  mode,
  question,
  content: {
    title: item.title,
    contentType: item.contentType,
    synopsis: item.synopsis,
    positionSeconds: Math.round(positionSeconds),
    gameId: item.gameId,
    context: item.context,
  },
});

/**
 * Suggested prompts shown as hints, tailored to the active mode. Gives the
 * demo clear, reliable things to ask on camera.
 */
export const suggestedPrompts = (mode: SideKickMode): string[] =>
  mode === 'sports'
    ? ['What are Okafor\'s stats?', 'Catch me up', 'What\'s the score?']
    : ['Who is in this scene?', 'What happened last episode?', 'What\'s this show about?'];
