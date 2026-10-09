import React, { createContext, useContext, useMemo, useRef, useState, useCallback } from 'react';
import { CatalogItem, SideKickMode, AskMarker } from '@sidekick/data/types';

/**
 * VideoContext is the "context capture" layer of SideKick: it holds what is
 * currently on screen and where we are in it, so the voice/AI layer can send
 * precise grounding context to the backend without pausing playback.
 *
 * It also holds the "ask markers" — the timeline positions where the user
 * asked SideKick something — so the seek bar can render them (timeline-
 * anchored answers).
 */
interface VideoContextValue {
  current: CatalogItem | null;
  positionSeconds: number;
  durationSeconds: number;
  /** Derived from the current item's contentType. */
  mode: SideKickMode;
  setCurrent: (item: CatalogItem | null) => void;
  setProgress: (currentTime: number, duration: number) => void;
  /** Timeline markers for where questions were asked. */
  askMarkers: AskMarker[];
  addAskMarker: (positionSeconds: number, mode: SideKickMode) => void;
  /** Snapshot used by the AI layer at the moment the user asks. */
  snapshot: () => {
    item: CatalogItem | null;
    positionSeconds: number;
    mode: SideKickMode;
  };
}

const VideoContext = createContext<VideoContextValue | null>(null);

export const deriveMode = (item: CatalogItem | null): SideKickMode =>
  item?.contentType === 'sports' ? 'sports' : 'general';

export const VideoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [current, setCurrentState] = useState<CatalogItem | null>(null);
  const [positionSeconds, setPositionSeconds] = useState(0);
  const [durationSeconds, setDurationSeconds] = useState(0);
  const [askMarkers, setAskMarkers] = useState<AskMarker[]>([]);

  // Keep a ref copy so snapshot() reads the latest value synchronously
  // even if called from an event handler mid-render.
  const positionRef = useRef(0);
  const currentRef = useRef<CatalogItem | null>(null);

  const setCurrent = useCallback((item: CatalogItem | null) => {
    currentRef.current = item;
    setCurrentState(item);
    positionRef.current = 0;
    setPositionSeconds(0);
    setAskMarkers([]); // markers are per-title
  }, []);

  const setProgress = useCallback((currentTime: number, duration: number) => {
    positionRef.current = currentTime;
    setPositionSeconds(currentTime);
    setDurationSeconds(duration);
  }, []);

  const addAskMarker = useCallback((pos: number, mode: SideKickMode) => {
    setAskMarkers((prev) => [
      ...prev,
      { id: `${Date.now()}-${pos}`, positionSeconds: pos, mode },
    ]);
  }, []);

  const snapshot = useCallback(
    () => ({
      item: currentRef.current,
      positionSeconds: positionRef.current,
      mode: deriveMode(currentRef.current),
    }),
    [],
  );

  const value = useMemo<VideoContextValue>(
    () => ({
      current,
      positionSeconds,
      durationSeconds,
      mode: deriveMode(current),
      setCurrent,
      setProgress,
      askMarkers,
      addAskMarker,
      snapshot,
    }),
    [current, positionSeconds, durationSeconds, askMarkers, addAskMarker, setCurrent, setProgress, snapshot],
  );

  return <VideoContext.Provider value={value}>{children}</VideoContext.Provider>;
};

export const useVideoContext = (): VideoContextValue => {
  const ctx = useContext(VideoContext);
  if (!ctx) throw new Error('useVideoContext must be used within a VideoProvider');
  return ctx;
};
