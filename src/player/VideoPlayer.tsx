import React, { useEffect, useRef, useCallback } from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { VideoPlayer as W3CVideoPlayer } from '@amazon-devices/react-native-w3cmedia/dist/headless';
import { KeplerVideoSurfaceView } from '@amazon-devices/react-native-w3cmedia';

/**
 * VideoPlayer — a thin wrapper over the Vega W3C media stack that exposes a
 * `react-native-video`-like prop API.
 *
 * WHY THIS EXISTS
 * ---------------
 * Vega OS does NOT support `react-native-video` (it wraps ExoPlayer/AVPlayer,
 * which Vega doesn't use). Vega uses the W3C MSE/EME standard via
 * `@amazon-devices/react-native-w3cmedia`. This component keeps the familiar
 * react-native-video surface — `source`, `paused`, `onLoad`, `onProgress`,
 * `onEnd`, `onError` — so app code stays idiomatic while running on the
 * correct platform-native player underneath.
 *
 * This covers URL mode (flat .mp4/.mkv/.mp3 files), which is what the demo
 * catalog uses. For adaptive HLS/DASH or DRM you'd layer Shaka on top in
 * MSE mode; the surface-handle wiring below is identical.
 */

export interface OnProgressData {
  currentTime: number;
  duration: number;
}

export interface VideoPlayerProps {
  /** react-native-video style source. */
  source: { uri: string };
  /** When true, playback is paused. */
  paused?: boolean;
  /** Start playing automatically once ready. */
  autoplay?: boolean;
  style?: StyleProp<ViewStyle>;
  /** Fired once metadata (duration) is known. */
  onLoad?: (data: { duration: number }) => void;
  /** Fired on timeupdate with current position. */
  onProgress?: (data: OnProgressData) => void;
  /** Fired when playback reaches the end. */
  onEnd?: () => void;
  /** Fired on a media error with the W3C MediaError code. */
  onError?: (code: number | undefined, message: string) => void;
  /** Fired when the player instance is ready (initialized). */
  onReady?: (player: W3CVideoPlayer) => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  source,
  paused = false,
  autoplay = true,
  style,
  onLoad,
  onProgress,
  onEnd,
  onError,
  onReady,
}) => {
  const player = useRef<W3CVideoPlayer | null>(null);
  // Cache surface handle until initialize() resolves (per architecture doc).
  const surfaceHandleRef = useRef<string | null>(null);
  const initialized = useRef(false);
  const initializing = useRef(false);
  const loadedSrc = useRef<string | null>(null);

  // Latest prop values read via refs so the surface callbacks can stay stable
  // (empty-dep useCallback) and NOT get a new identity on every render — that
  // identity churn is what makes KeplerVideoSurfaceView tear down and recreate
  // the native pipeline mid-load, which crashes the media stack.
  const sourceUriRef = useRef(source.uri);
  const autoplayRef = useRef(autoplay);
  const pausedRef = useRef(paused);
  const cbRef = useRef({ onLoad, onProgress, onEnd, onError, onReady });
  useEffect(() => {
    sourceUriRef.current = source.uri;
    autoplayRef.current = autoplay;
    pausedRef.current = paused;
    cbRef.current = { onLoad, onProgress, onEnd, onError, onReady };
  });

  // ----- W3C event handlers (stable) -----
  const handleLoadedMetadata = useCallback(() => {
    const p = player.current;
    if (!p) return;
    cbRef.current.onLoad?.({ duration: p.duration ?? 0 });
    if (autoplayRef.current && !pausedRef.current) {
      void Promise.resolve(p.play()).catch(() => undefined);
    }
  }, []);
  const handleTimeUpdate = useCallback(() => {
    const p = player.current;
    if (p) cbRef.current.onProgress?.({ currentTime: p.currentTime ?? 0, duration: p.duration ?? 0 });
  }, []);
  const handleEnded = useCallback(() => cbRef.current.onEnd?.(), []);
  const handleError = useCallback(() => {
    const err = player.current?.error;
    cbRef.current.onError?.(err?.code, err?.message ?? 'Unknown media error');
  }, []);

  // Load current source exactly once per unique URI.
  const loadCurrentSource = useCallback(() => {
    const p = player.current;
    if (!p || !initialized.current) return;
    const uri = sourceUriRef.current;
    if (loadedSrc.current === uri) return; // already loaded this source
    loadedSrc.current = uri;
    p.autoplay = false; // we drive play() on loadedmetadata, never autoplay
    p.src = uri;
    p.load();
  }, []);

  // ----- Surface lifecycle (stable callbacks — empty deps) ----
  const onSurfaceViewCreated = useCallback(async (surfaceHandle: string) => {
    surfaceHandleRef.current = surfaceHandle;
    if (!player.current) player.current = new W3CVideoPlayer();
    const p = player.current;

    // Guard against concurrent/duplicate initialize() calls.
    if (!initialized.current && !initializing.current) {
      initializing.current = true;
      try {
        await p.initialize();
        initialized.current = true;
        p.addEventListener('loadedmetadata', handleLoadedMetadata);
        p.addEventListener('timeupdate', handleTimeUpdate);
        p.addEventListener('ended', handleEnded);
        p.addEventListener('error', handleError);
        cbRef.current.onReady?.(p);
      } catch {
        initializing.current = false;
        return;
      }
      initializing.current = false;
    }

    if (!initialized.current) return;
    // Attach surface after initialize() resolved, then load once.
    p.setSurfaceHandle(surfaceHandle);
    loadCurrentSource();
  }, [handleLoadedMetadata, handleTimeUpdate, handleEnded, handleError, loadCurrentSource]);

  const onSurfaceViewDestroyed = useCallback((surfaceHandle: string) => {
    const p = player.current;
    if (!p) return;
    try {
      p.pause();
    } catch {
      // best-effort
    }
    try {
      p.clearSurfaceHandle(surfaceHandle);
    } catch {
      // best-effort
    }
    // NOTE: we intentionally do NOT deinitialize here. The surface view can be
    // recreated by React during layout; tearing the pipeline down on every
    // transient surface-destroy is what crashes the native media stack. Full
    // teardown happens once on component unmount (effect below).
  }, []);

  // ----- React to `paused` prop -----
  useEffect(() => {
    const p = player.current;
    if (!p || !initialized.current) return;
    if (paused) p.pause();
    else void Promise.resolve(p.play()).catch(() => undefined);
  }, [paused]);

  // ----- React to source change: load the new source once -----
  useEffect(() => {
    loadedSrc.current === source.uri || loadCurrentSource();
  }, [source.uri, loadCurrentSource]);

  // ----- Full teardown on unmount only -----
  useEffect(() => {
    return () => {
      const p = player.current;
      if (!p) return;
      try {
        p.pause();
        p.removeEventListener('loadedmetadata', handleLoadedMetadata);
        p.removeEventListener('timeupdate', handleTimeUpdate);
        p.removeEventListener('ended', handleEnded);
        p.removeEventListener('error', handleError);
        // Prefer synchronous deinit (reference pattern) to avoid a dangling
        // async teardown racing a fresh mount.
        const anyP = p as unknown as { deinitializeSync?: (t: number) => string; deinitialize?: () => Promise<void> };
        if (typeof anyP.deinitializeSync === 'function') anyP.deinitializeSync(1500);
        else void anyP.deinitialize?.();
      } catch {
        // best-effort
      }
      player.current = null;
      initialized.current = false;
      initializing.current = false;
      loadedSrc.current = null;
      surfaceHandleRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View style={[styles.container, style]}>
      <KeplerVideoSurfaceView
        style={styles.surface}
        onSurfaceViewCreated={onSurfaceViewCreated}
        onSurfaceViewDestroyed={onSurfaceViewDestroyed}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  surface: { flex: 1 },
});
