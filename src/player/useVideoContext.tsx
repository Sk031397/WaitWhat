import React, {
  createContext,
  useContext,
  useMemo,
  useRef,
  useState,
  useCallback,
} from 'react';
import {
  CatalogItem,
  SideKickMode,
  AskMarker,
  SideKickAnswer,
} from '@sidekick/data/types';

/**
 * VideoContext is the "context capture" layer of SideKick: what is on screen,
 * where we are in it, and the navigable timeline of questions the user asked.
 *
 * The ask markers form a navigable Q&A timeline: each marker carries the answer
 * captured at that timestamp. Selecting a marker (from the seek bar) seeks the
 * video back to that moment AND re-surfaces that answer in the overlay. The
 * cross-component signaling is done with monotonically-increasing "request"
 * counters so a repeat selection of the same marker still fires.
 */
interface VideoContextValue {
  current: CatalogItem | null;
  positionSeconds: number;
  durationSeconds: number;
  mode: SideKickMode;
  setCurrent: (item: CatalogItem | null) => void;
  setProgress: (currentTime: number, duration: number) => void;

  /** Navigable Q&A timeline. */
  askMarkers: AskMarker[];
  addAskMarker: (
    positionSeconds: number,
    mode: SideKickMode,
    answer?: SideKickAnswer,
  ) => void;
  /** Select a marker: requests a seek to its time + re-surface of its answer. */
  selectMarker: (markerId: string) => void;
  /** Request a direct seek to an absolute time (natural-language seek). */
  requestSeek: (seconds: number) => void;

  /** Seek request (seconds) + a token that changes each request. */
  seekRequest: {seconds: number; token: number} | null;
  /** Answer to re-surface + a token that changes each request. */
  resurface: {answer: SideKickAnswer; token: number} | null;

  snapshot: () => {
    item: CatalogItem | null;
    positionSeconds: number;
    mode: SideKickMode;
  };
}

const VideoContext = createContext<VideoContextValue | null>(null);

export const deriveMode = (item: CatalogItem | null): SideKickMode =>
  item?.contentType === 'sports' ? 'sports' : 'general';

export const VideoProvider: React.FC<{children: React.ReactNode}> = ({
  children,
}) => {
  const [current, setCurrentState] = useState<CatalogItem | null>(null);
  const [positionSeconds, setPositionSeconds] = useState(0);
  const [durationSeconds, setDurationSeconds] = useState(0);
  const [askMarkers, setAskMarkers] = useState<AskMarker[]>([]);
  const [seekRequest, setSeekRequest] = useState<{
    seconds: number;
    token: number;
  } | null>(null);
  const [resurface, setResurface] = useState<{
    answer: SideKickAnswer;
    token: number;
  } | null>(null);

  const positionRef = useRef(0);
  const currentRef = useRef<CatalogItem | null>(null);
  const markersRef = useRef<AskMarker[]>([]);
  const tokenRef = useRef(0);

  const setCurrent = useCallback((item: CatalogItem | null) => {
    currentRef.current = item;
    setCurrentState(item);
    positionRef.current = 0;
    setPositionSeconds(0);
    markersRef.current = [];
    setAskMarkers([]); // markers are per-title
  }, []);

  const setProgress = useCallback((currentTime: number, duration: number) => {
    positionRef.current = currentTime;
    setPositionSeconds(currentTime);
    setDurationSeconds(duration);
  }, []);

  const addAskMarker = useCallback(
    (pos: number, mode: SideKickMode, answer?: SideKickAnswer) => {
      const marker: AskMarker = {
        id: `${Date.now()}-${pos}`,
        positionSeconds: pos,
        mode,
        answer,
      };
      markersRef.current = [...markersRef.current, marker];
      setAskMarkers(markersRef.current);
    },
    [],
  );

  const selectMarker = useCallback((markerId: string) => {
    const mk = markersRef.current.find((m) => m.id === markerId);
    if (!mk) {
      return;
    }
    tokenRef.current += 1;
    setSeekRequest({seconds: mk.positionSeconds, token: tokenRef.current});
    if (mk.answer) {
      setResurface({answer: mk.answer, token: tokenRef.current});
    }
  }, []);

  const requestSeek = useCallback((seconds: number) => {
    tokenRef.current += 1;
    setSeekRequest({seconds: Math.max(0, seconds), token: tokenRef.current});
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
      selectMarker,
      requestSeek,
      seekRequest,
      resurface,
      snapshot,
    }),
    [
      current,
      positionSeconds,
      durationSeconds,
      askMarkers,
      seekRequest,
      resurface,
      setCurrent,
      setProgress,
      addAskMarker,
      selectMarker,
      requestSeek,
      snapshot,
    ],
  );

  return (
    <VideoContext.Provider value={value}>{children}</VideoContext.Provider>
  );
};

export const useVideoContext = (): VideoContextValue => {
  const ctx = useContext(VideoContext);
  if (!ctx) {
    throw new Error('useVideoContext must be used within a VideoProvider');
  }
  return ctx;
};
