import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { VideoProvider, useVideoContext } from '@sidekick/player/useVideoContext';
import { VideoPlayer } from '@sidekick/player/VideoPlayer';
import { SideKickOverlay } from '@sidekick/sidekick/SideKickOverlay';
import { PlayerControls } from '@sidekick/components/PlayerControls';
import { getCatalogItem } from '@sidekick/data/catalog';
import { bigPlayCrossed, playerStatCard } from '@sidekick/data/seededSports';
import { SideKickAnswer } from '@sidekick/data/types';
import { formatTime } from '@sidekick/util/formatTime';
import { theme } from '@sidekick/theme';

const CONTROLS_HIDE_MS = 5000;
const SEEK_STEP = 10;

/** Inner player (inside VideoProvider so it can use the context). */
const PlayerInner: React.FC<{ itemId: string; onBack: () => void }> = ({
  itemId,
  onBack,
}) => {
  const { current, setCurrent, setProgress, mode, askMarkers } = useVideoContext();
  const item = getCatalogItem(itemId);

  // Raw W3C player handle (captured via VideoPlayer onReady) for seeking.
  const playerRef = useRef<{ currentTime: number } | null>(null);
  const [paused, setPaused] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [controlsVisible, setControlsVisible] = useState(true);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Proactive big-play card (sports mode). Fired once when a seeded timestamp
  // is crossed; passed to the overlay which surfaces it without a question.
  const [proactive, setProactive] = useState<SideKickAnswer | null>(null);
  const firedBigPlays = useRef<Set<number>>(new Set());

  useEffect(() => {
    if (item) setCurrent(item);
  }, [item, setCurrent]);

  // Show controls and (re)arm the 5s auto-hide. Called on any interaction.
  const pokeControls = useCallback(() => {
    setControlsVisible(true);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setControlsVisible(false), CONTROLS_HIDE_MS);
  }, []);

  useEffect(() => {
    pokeControls();
    return () => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, [pokeControls]);

  const onPlayPause = useCallback(() => {
    setPaused((p) => !p);
    pokeControls();
  }, [pokeControls]);

  const seekBy = useCallback(
    (delta: number) => {
      const p = playerRef.current;
      if (p) {
        const next = Math.max(0, Math.min(duration || Infinity, (p.currentTime ?? 0) + delta));
        p.currentTime = next;
        setCurrentTime(next);
      }
      pokeControls();
    },
    [duration, pokeControls],
  );

  if (!current) return <View style={styles.root} />;

  return (
    <View style={styles.root}>
      <VideoPlayer
        source={{ uri: current.videoUrl }}
        autoplay
        paused={paused}
        style={StyleSheet.absoluteFill}
        onReady={(p) => {
          playerRef.current = p as unknown as { currentTime: number };
        }}
        onLoad={({ duration: d }) => setDuration(d)}
        onProgress={({ currentTime: t, duration: d }) => {
          setCurrentTime(t);
          if (d && d !== duration) setDuration(d);
          setProgress(t, d);

          // Proactive big-play detection (sports mode only).
          if (mode === 'sports' && current?.gameId) {
            const bp = bigPlayCrossed(currentTime, t);
            if (bp && bp.gameId === current.gameId && !firedBigPlays.current.has(bp.atSeconds)) {
              firedBigPlays.current.add(bp.atSeconds);
              // eslint-disable-next-line no-console
              console.info(`[SideKick] PROACTIVE big-play fired at ${t.toFixed(1)}s: ${bp.text}`);
              setProactive({
                id: `bigplay-${bp.atSeconds}`,
                mode: 'sports',
                question: '',
                text: bp.text,
                statCard: playerStatCard(bp.gameId, bp.player),
                askedAtSeconds: t,
                askedAtLabel: formatTime(t),
                proactive: true,
              });
            }
          }
        }}
      />

      {/* Top-left: now playing + back */}
      <View style={styles.topBar} pointerEvents="box-none">
        <Pressable onPress={onBack} style={({ pressed }) => [styles.back, pressed && styles.backPressed]}>
          <Text style={styles.backText}>‹ Back</Text>
        </Pressable>
        <Text style={styles.nowPlaying} numberOfLines={1}>
          {current.title}
        </Text>
      </View>

      {/* Bottom transport controls (Select = play/pause) */}
      <PlayerControls
        visible={controlsVisible}
        paused={paused}
        currentTime={currentTime}
        duration={duration}
        markers={askMarkers}
        onPlayPause={onPlayPause}
        onSeekBack={() => seekBy(-SEEK_STEP)}
        onSeekForward={() => seekBy(SEEK_STEP)}
      />

      {/* Slide-out SideKick companion */}
      <SideKickOverlay proactive={proactive} />
    </View>
  );
};

export const PlayerScreen = ({
  route,
  navigation,
}: {
  route: any;
  navigation: any;
}) => {
  const itemId: string = route?.params?.itemId;
  return (
    <VideoProvider>
      <PlayerInner itemId={itemId} onBack={() => navigation.goBack()} />
    </VideoProvider>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.colors.background },
  topBar: {
    position: 'absolute',
    top: theme.safeZones.vertical,
    start: theme.safeZones.horizontal,
    flexDirection: 'row',
    alignItems: 'center',
  },
  back: {
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.radius.pill,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.surface,
    marginEnd: theme.spacing.md,
  },
  backPressed: { opacity: 0.7 },
  backText: {
    color: theme.colors.textPrimary,
    fontSize: theme.font.body,
    fontWeight: '600',
  },
  nowPlaying: {
    color: theme.colors.textPrimary,
    fontSize: theme.font.title,
    fontWeight: '700',
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowRadius: 8,
  },
});
