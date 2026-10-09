import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Animated,
  ActivityIndicator,
  Platform,
  AccessibilityInfo,
} from 'react-native';
import { SideKickAnswer } from '@sidekick/data/types';
import { theme } from '@sidekick/theme';
import { useVideoContext } from '@sidekick/player/useVideoContext';
import { QuestionInput } from './QuestionInput';
import { StatCard } from './StatCard';
import { buildAskRequest, suggestedPrompts } from './ModeRouter';
import { ask } from './bedrockClient';
import { formatTime } from '@sidekick/util/formatTime';
import { GradientScrim } from '@sidekick/components/GradientScrim';

/**
 * SideKickOverlay — a SLIDE-OUT companion panel.
 *
 * A compact "Ask SideKick" tab floats on the right edge of the player.
 * Selecting it slides the panel in (translateX animation); Close slides it
 * away. Playback never pauses underneath.
 *
 * Voice input is real and platform-correct: the panel hosts a TextInput
 * (QuestionInput). Focusing it brings up the Vega system keyboard, whose mic
 * lets the user hold the Alexa button and dictate — the only app-usable STT
 * path on VegaOS. The recognized/typed text is routed to Bedrock by mode.
 */
export const SideKickOverlay: React.FC<{ proactive?: SideKickAnswer | null }> = ({
  proactive,
}) => {
  const { mode, snapshot, addAskMarker } = useVideoContext();
  const [open, setOpen] = useState(false);
  const [answer, setAnswer] = useState<SideKickAnswer | null>(null);
  const [tabFocused, setTabFocused] = useState(false);

  // Panel slides along X. Starts fully off-screen (= panel width).
  const translateX = useRef(new Animated.Value(theme.overlayWidth)).current;

  useEffect(() => {
    // useNativeDriver can be unsupported for some props on some runtimes;
    // transforms are the safe case, but fall back to JS-driven if it throws.
    const useNative = Platform.OS !== 'web';
    const anim = Animated.timing(translateX, {
      toValue: open ? 0 : theme.overlayWidth,
      duration: 280,
      useNativeDriver: useNative,
    });
    try {
      anim.start();
    } catch {
      Animated.timing(translateX, {
        toValue: open ? 0 : theme.overlayWidth,
        duration: 280,
        useNativeDriver: false,
      }).start();
    }
  }, [open, translateX]);

  // Announce answers to VoiceView (the only speech-output path on Vega — there
  // is no app-level TTS). If the user has VoiceView on, it reads this aloud.
  const announce = useCallback((a: SideKickAnswer) => {
    const where = a.askedAtLabel ? ` at ${a.askedAtLabel}` : '';
    AccessibilityInfo.announceForAccessibility?.(
      `SideKick${where}: ${a.text}`,
    );
  }, []);

  // When a proactive answer arrives (timestamp-triggered big play), surface it.
  useEffect(() => {
    if (proactive) {
      setAnswer(proactive);
      setOpen(true);
      announce(proactive);
    }
  }, [proactive, announce]);

  const accent = mode === 'sports' ? theme.colors.sports : theme.colors.primary;

  const handleSubmit = useCallback(
    async (question: string) => {
      const snap = snapshot();
      if (!snap.item) return;

      const askedAtSeconds = snap.positionSeconds;
      const askedAtLabel = formatTime(askedAtSeconds);
      // Drop a marker on the seek bar where the question was asked.
      addAskMarker(askedAtSeconds, snap.mode);

      const pendingId = `${Date.now()}`;
      setAnswer({
        id: pendingId,
        mode: snap.mode,
        question,
        text: '',
        pending: true,
        askedAtSeconds,
        askedAtLabel,
      });

      const req = buildAskRequest(snap.item, askedAtSeconds, snap.mode, question);
      const res = await ask(req);

      const finalAnswer: SideKickAnswer = {
        id: pendingId,
        mode: snap.mode,
        question,
        text: res.text,
        statCard: res.statCard,
        fromFallback: res.fromFallback,
        askedAtSeconds,
        askedAtLabel,
      };
      setAnswer(finalAnswer);
      announce(finalAnswer);
    },
    [snapshot, addAskMarker, announce],
  );

  return (
    <View style={styles.root} pointerEvents="box-none">
      {/* ---- Floating trigger tab (right edge) ---- */}
      {!open ? (
        <Pressable
          hasTVPreferredFocus
          onPress={() => setOpen(true)}
          onFocus={() => setTabFocused(true)}
          onBlur={() => setTabFocused(false)}
          style={[styles.tab, { borderColor: accent }, tabFocused && styles.tabFocused]}
        >
          <View style={[styles.tabDot, { backgroundColor: accent }]} />
          <Text style={styles.tabText}>Ask SideKick</Text>
        </Pressable>
      ) : null}

      {/* ---- Slide-out panel ---- */}
      <Animated.View
        style={[styles.panel, { transform: [{ translateX }] }]}
        pointerEvents={open ? 'auto' : 'none'}
      >
        {/* Soft left-edge fade so the panel blends into the video */}
        <GradientScrim
          color="#0B0C10"
          direction="to-right"
          intensity={0.5}
          bands={8}
          style={styles.panelFade}
        />
        <View style={styles.header}>
          <View style={[styles.badge, { backgroundColor: accent }]}>
            <Text style={styles.badgeText}>
              {mode === 'sports' ? 'SPORTS MODE' : 'SIDEKICK'}
            </Text>
          </View>
          <Pressable onPress={() => setOpen(false)} style={styles.close}>
            <Text style={styles.closeText}>Close ✕</Text>
          </Pressable>
        </View>

        <View
          style={styles.answerArea}
          accessible
          accessibilityLiveRegion="polite"
        >
          {answer ? (
            <>
              {answer.proactive ? (
                <View style={[styles.proactivePill, { borderColor: accent }]}>
                  <Text style={[styles.proactivePillText, { color: accent }]}>
                    ⚡ BIG PLAY
                  </Text>
                </View>
              ) : (
                <Text style={styles.question} numberOfLines={2}>
                  “{answer.question}”
                </Text>
              )}
              {answer.askedAtLabel ? (
                <Text style={styles.anchor}>
                  {answer.proactive ? 'at ' : 'asked at '}
                  {answer.askedAtLabel}
                </Text>
              ) : null}
              {answer.pending ? (
                <View style={styles.pending}>
                  <ActivityIndicator color={accent} />
                  <Text style={styles.pendingText}>Thinking…</Text>
                </View>
              ) : (
                <>
                  <Text style={styles.answerText}>{answer.text}</Text>
                  {answer.statCard ? <StatCard data={answer.statCard} /> : null}
                  {answer.fromFallback ? (
                    <Text style={styles.fallbackNote}>offline answer</Text>
                  ) : null}
                </>
              )}
            </>
          ) : (
            <View style={styles.hints}>
              <Text style={styles.hintTitle}>Try asking:</Text>
              {suggestedPrompts(mode).map((p) => (
                <Text key={p} style={styles.hint}>
                  • {p}
                </Text>
              ))}
            </View>
          )}
        </View>

        {/* Real voice/text entry (system keyboard mic = Vega STT) */}
        <QuestionInput mode={mode} onSubmit={handleSubmit} />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { ...StyleSheet.absoluteFillObject },

  tab: {
    position: 'absolute',
    top: '42%',
    end: 0,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderWidth: 2,
    borderEndWidth: 0,
    borderTopStartRadius: theme.radius.pill,
    borderBottomStartRadius: theme.radius.pill,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
  },
  tabFocused: { borderWidth: 4, borderEndWidth: 0, transform: [{ scale: 1.06 }] },
  tabDot: {
    width: theme.spacing.sm,
    height: theme.spacing.sm,
    borderRadius: theme.spacing.sm / 2,
    marginEnd: theme.spacing.sm,
  },
  tabText: {
    color: theme.colors.textPrimary,
    fontSize: theme.font.body,
    fontWeight: '700',
  },

  panel: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    end: 0,
    width: theme.overlayWidth,
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    justifyContent: 'space-between',
  },
  panelFade: {
    // sits at the panel's left edge, extending left to fade into the video
    start: -theme.spacing.xl,
    width: theme.spacing.xl,
    end: undefined,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badge: {
    borderRadius: theme.radius.pill,
    paddingVertical: theme.spacing.xs / 2,
    paddingHorizontal: theme.spacing.sm,
  },
  badgeText: {
    color: '#000000',
    fontWeight: '800',
    fontSize: theme.font.caption,
    letterSpacing: 1,
  },
  close: {
    paddingVertical: theme.spacing.xs / 2,
    paddingHorizontal: theme.spacing.sm,
    borderRadius: theme.radius.sm,
  },
  closeText: { color: theme.colors.textSecondary, fontSize: theme.font.caption },

  answerArea: { flex: 1, marginVertical: theme.spacing.md },
  question: {
    color: theme.colors.textSecondary,
    fontSize: theme.font.body,
    fontStyle: 'italic',
    marginBottom: theme.spacing.sm,
  },
  anchor: {
    color: theme.colors.textMuted,
    fontSize: theme.font.caption,
    marginBottom: theme.spacing.sm,
  },
  proactivePill: {
    alignSelf: 'flex-start',
    borderWidth: 2,
    borderRadius: theme.radius.pill,
    paddingVertical: theme.spacing.xs / 2,
    paddingHorizontal: theme.spacing.sm,
    marginBottom: theme.spacing.xs,
  },
  proactivePillText: {
    fontSize: theme.font.caption,
    fontWeight: '800',
    letterSpacing: 1,
  },
  answerText: {
    color: theme.colors.textPrimary,
    fontSize: theme.font.title,
    lineHeight: theme.font.title * 1.3,
  },
  pending: { flexDirection: 'row', alignItems: 'center' },
  pendingText: {
    color: theme.colors.textSecondary,
    fontSize: theme.font.body,
    marginStart: theme.spacing.sm,
  },
  fallbackNote: {
    color: theme.colors.textMuted,
    fontSize: theme.font.caption,
    marginTop: theme.spacing.sm,
  },
  hints: { marginTop: theme.spacing.md },
  hintTitle: {
    color: theme.colors.textSecondary,
    fontSize: theme.font.body,
    marginBottom: theme.spacing.sm,
  },
  hint: {
    color: theme.colors.textMuted,
    fontSize: theme.font.body,
    marginBottom: theme.spacing.xs,
  },
});
