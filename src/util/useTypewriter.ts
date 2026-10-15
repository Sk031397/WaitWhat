import { useEffect, useRef, useState } from 'react';

/**
 * useTypewriter — progressively reveals `full` text, so an AI answer "types in"
 * like it's being generated live.
 *
 * This is a client-side reveal of an already-received answer (the backend
 * returns the full text in one shot — API Gateway buffers responses, so true
 * wire-level token streaming isn't available on this transport). It's a visual
 * effect, not real streaming, but it reads as live generation on screen.
 *
 * Returns the revealed substring and whether it's still revealing. Reveal
 * restarts whenever `full` changes (new answer).
 */
export const useTypewriter = (full: string, enabled = true, msPerStep = 18): {
  shown: string;
  done: boolean;
} => {
  const [shown, setShown] = useState(enabled ? '' : full);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!enabled || !full) {
      setShown(full);
      return;
    }
    setShown('');
    let i = 0;
    // Reveal a few characters per tick so it feels quick but visible.
    const step = Math.max(1, Math.round(full.length / 90)); // ~90 ticks total
    timer.current = setInterval(() => {
      i += step;
      if (i >= full.length) {
        setShown(full);
        if (timer.current) clearInterval(timer.current);
      } else {
        setShown(full.slice(0, i));
      }
    }, msPerStep);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [full, enabled, msPerStep]);

  return { shown, done: shown.length >= full.length };
};
