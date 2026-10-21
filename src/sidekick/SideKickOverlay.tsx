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
import { buildAskRequest, suggestedPrompts } from './ModeRouter';
import { ask } from './bedrockClient';
import { formatTime } from '@sidekick/util/formatTime';
import { parseSeekIntent, parseFractionalPhrase } from '@sidekick/util/parseTimePhrase';
import { GradientScrim } from '@sidekick/components/GradientScrim';
import { useTypewriter } from '@sidekick/util/useTypewriter';

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
  const { mode, snapshot, addAskMarker, resurface, requestSeek, durationSeconds } =
    useVideoContext();
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

  // ----- Signature mode-switch animation -----
  // modeAnim: 0 = general, 1 = sports. Drives an interpolated accent color and
  // a badge "morph" pulse so context-awareness is something you SEE happen.
  const modeAnim = useRef(new Animated.Value(mode === 'sports' ? 1 : 0)).current;
  const badgePulse = useRef(new Animated.Value(1)).current;
  const prevMode = useRef(mode);
  useEffect(() => {
    if (prevMode.current === mode) return;
    prevMode.current = mode;
    // Accent sweeps to the new mode's color; badge pops then settles.
    Animated.parallel([
      Animated.timing(modeAnim, {
        toValue: mode === 'sports' ? 1 : 0,
        duration: 420,
        useNativeDriver: false, // color interpolation needs JS driver
      }),
      Animated.sequence([
        Animated.timing(badgePulse, { toValue: 1.18, duration: 180, useNativeDriver: true }),
        Animated.spring(badgePulse, { toValue: 1, speed: 14, bounciness: 10, useNativeDriver: true }),
      ]),
    ]).start();
  }, [mode, modeAnim, badgePulse]);

  const animatedAccent = modeAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [theme.colors.primary, theme.colors.sports],
  });

  // ----- Answer entrance animation (fade + slide-up) -----
  const answerAnim = useRef(new Animated.Value(0)).current;
  const playAnswerIn = useCallback(() => {
    answerAnim.setValue(0);
    Animated.timing(answerAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start();
  }, [answerAnim]);

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
      playAnswerIn();
    }
  }, [proactive, announce, playAnswerIn]);

  // When the user selects a timeline marker, re-surface that saved answer.
  useEffect(() => {
    if (resurface?.answer) {
      setAnswer(resurface.answer);
      setOpen(true);
      playAnswerIn();
    }
    // token changes each selection, so repeat selects re-fire
  }, [resurface?.token]); // eslint-disable-line react-hooks/exhaustive-deps

  const accent = mode === 'sports' ? theme.colors.sports : theme.colors.primary;

  // Typewriter reveal of the answer text (only once the answer is in, not while
  // pending). Keyed on answer.id so each new answer re-reveals.
  const revealTarget = answer && !answer.pending ? answer.text : '';
  const { shown: revealedText, done: revealDone } = useTypewriter(
    revealTarget,
    true,
  );

  const handleSubmit = useCallback(
    async (question: string) => {
      const snap = snapshot();
      if (!snap.item) return;

      const dur = durationSeconds || Infinity;
      const clampTime = (s: number) => Math.max(0, dur === Infinity ? s : Math.min(dur, s));

      let jumpedToSeconds: number | null = null;

      // ----- Fractional / landmark navigation ("go to the middle/end/quarter") -----
      // Needs a known duration. Treated as a pure control command: seek + a
      // confident confirmation, no model round-trip.
      const frac = parseFractionalPhrase(question, durationSeconds || 0);
      if (frac !== null) {
        const target = clampTime(frac);
        requestSeek(target);
        const label = formatTime(target);
        addAskMarker(target, snap.mode);
        const confirm: SideKickAnswer = {
          id: `${Date.now()}`,
          mode: snap.mode,
          question,
          text: `Jumped to ${label}.`,
          askedAtSeconds: target,
          askedAtLabel: label,
          jumpedToSeconds: target,
          jumpedToLabel: label,
        };
        setAnswer(confirm);
        announce(confirm);
        playAnswerIn();
        return;
      }

      // ----- Playback control intent (rewind / forward / jump) -----
      const intent = parseSeekIntent(question);
      if (intent) {
        const base = snap.positionSeconds;
        const target = clampTime(
          intent.absoluteSeconds !== null
            ? intent.absoluteSeconds
            : base + (intent.relativeSeconds ?? 0),
        );
        requestSeek(target);
        const label = formatTime(target);

        // PURE control command ("rewind", "go back 10s") → confident local
        // confirmation, NO model call (so SideKick never "apologizes").
        if (intent.pureControl) {
          const verb = intent.verb ?? 'Jumped';
          addAskMarker(target, snap.mode);
          const confirm: SideKickAnswer = {
            id: `${Date.now()}`,
            mode: snap.mode,
            question,
            text: `${verb} to ${label}.`,
            askedAtSeconds: target,
            askedAtLabel: label,
            jumpedToSeconds: target,
            jumpedToLabel: label,
          };
          setAnswer(confirm);
          announce(confirm);
          playAnswerIn();
          return; // no Bedrock round-trip for a bare control command
        }
        // "jump AND tell me about it" → ground the answer at the target time.
        jumpedToSeconds = target;
      }

      // The answer is grounded at the jumped-to time when present, else "now".
      const askedAtSeconds = jumpedToSeconds ?? snap.positionSeconds;
      const askedAtLabel = formatTime(askedAtSeconds);
      const jumpedToLabel = jumpedToSeconds !== null ? formatTime(jumpedToSeconds) : undefined;

      const pendingId = `${Date.now()}`;
      setAnswer({
        id: pendingId,
        mode: snap.mode,
        question,
        text: '',
        pending: true,
        askedAtSeconds,
        askedAtLabel,
        jumpedToSeconds: jumpedToSeconds ?? undefined,
        jumpedToLabel,
      });

      const req = buildAskRequest(snap.item, askedAtSeconds, snap.mode, question);
      const res = await ask(req);

      const finalAnswer: SideKickAnswer = {
        id: pendingId,
        mode: snap.mode,
        question,
        text: res.text,
        fromFallback: res.fromFallback,
        askedAtSeconds,
        askedAtLabel,
        jumpedToSeconds: jumpedToSeconds ?? undefined,
        jumpedToLabel,
      };
      setAnswer(finalAnswer);
      announce(finalAnswer);
      playAnswerIn();
      // Drop a navigable marker carrying this answer at the (possibly jumped) time.
      addAskMarker(askedAtSeconds, snap.mode, finalAnswer);
    },
    [snapshot, addAskMarker, announce, playAnswerIn, requestSeek, durationSeconds],
  );

  return (
    <View style={styles.root} pointerEvents="box-none">
      {/* ---- Floating trigger tab (right edge) ---- */}
      {!open ? (
        <Pressable
          hasTVPreferredFocus
          accessibilityRole="button"
          accessibilityLabel="Open SideKick. Ask about what you're watching without pausing."
          onPress={() => setOpen(true)}
          onFocus={() => setTabFocused(true)}
          onBlur={() => setTabFocused(false)}
          style={[styles.tab, { borderColor: accent }, tabFocused && styles.tabFocused]}
        >
          <View style={[styles.tabDot, { backgroundColor: accent }]} />
          <Text style={styles.tabText}>Ask Wait, What?</Text>
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
          <Animated.View
            style={[
              styles.badge,
              { backgroundColor: animatedAccent, transform: [{ scale: badgePulse }] },
            ]}
          >
            <Text style={styles.badgeText}>
              {mode === 'sports' ? 'SPORTS MODE' : 'SIDEKICK'}
            </Text>
          </Animated.View>
          <Pressable
            onPress={() => setOpen(false)}
            accessibilityRole="button"
            accessibilityLabel="Close SideKick"
            style={styles.close}
          >
            <Text style={styles.closeText}>Close ✕</Text>
          </Pressable>
        </View>

        <View
          style={styles.answerArea}
          accessible
          accessibilityLiveRegion="polite"
        >
          {answer ? (
            <Animated.View
              style={{
                opacity: answerAnim,
                transform: [
                  {
                    translateY: answerAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [theme.spacing.md, 0],
                    }),
                  },
                ],
              }}
            >
              {answer.proactive ? (
                <View style={[styles.proactivePill, { borderColor: accent }]}>
                  <Text style={[styles.proactivePillText, { color: accent }]}>
                    {answer.insight ? '✨ SCENE INSIGHT' : '⚡ BIG PLAY'}
                  </Text>
                </View>
              ) : (
                <Text style={styles.question} numberOfLines={2}>
                  “{answer.question}”
                </Text>
              )}
              {answer.jumpedToLabel ? (
                <View style={[styles.jumpPill, { borderColor: accent }]}>
                  <Text style={[styles.jumpPillText, { color: accent }]}>
                    ⤷ Jumped to {answer.jumpedToLabel}
                  </Text>
                </View>
              ) : null}
              {answer.askedAtLabel && !answer.jumpedToLabel ? (
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
                  <Text style={styles.answerText}>
                    {revealedText}
                    {!revealDone ? <Text style={{ color: accent }}>▋</Text> : null}
                  </Text>
                  {revealDone && answer.fromFallback ? (
                    <Text style={styles.fallbackNote}>offline answer</Text>
                  ) : null}
                </>
              )}
            </Animated.View>
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

        {/* Accessibility affordance — makes the spoken-answers feature visible */}
        <View style={styles.a11yRow}>
          <Text style={styles.a11yText}>🔊 Answers are read aloud with VoiceView</Text>
        </View>

        {/* Real voice/text entry (system keyboard mic = Vega STT) */}
        <QuestionInput mode={mode} onSubmit={handleSubmit} />

        {/* Embeddability note — SideKick is a layer any streaming app can add */}
        <Text style={styles.embedNote}>
          A companion layer any streaming app can embed.
        </Text>
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
  a11yRow: {
    marginBottom: theme.spacing.sm,
  },
  a11yText: {
    color: theme.colors.textMuted,
    fontSize: theme.font.caption,
    letterSpacing: theme.tracking.wide,
  },
  embedNote: {
    color: theme.colors.textMuted,
    fontSize: theme.font.caption,
    textAlign: 'center',
    marginTop: theme.spacing.sm,
    fontStyle: 'italic',
  },
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
  jumpPill: {
    alignSelf: 'flex-start',
    borderWidth: 2,
    borderRadius: theme.radius.pill,
    paddingVertical: theme.spacing.xs / 2,
    paddingHorizontal: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  jumpPillText: {
    fontSize: theme.font.caption,
    fontWeight: theme.weight.bold,
    letterSpacing: theme.tracking.wide,
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
