/**
 * parseTimePhrase — pull a target time (in seconds) out of a natural-language
 * question, for "take me to 0:10 and tell me what I missed" style asks.
 *
 * Handles, in priority order:
 *   - clock form:    "0:10", "1:05", "12:30", "1:02:03"
 *   - "minute N":    "minute 2", "at minute 10", "min 3"
 *   - "N min[utes]": "2 minutes in", "3 min in", "go to 2 minutes"
 *   - "N second[s]": "10 seconds in", "45 secs in"
 *   - landmarks:     "the start" / "beginning" => 0
 *
 * Returns the time in seconds, or null if no time phrase is present. The caller
 * clamps to the media duration.
 */
export const parseTimePhrase = (raw: string): number | null => {
  const q = raw.toLowerCase();

  // 1) Clock form H:MM:SS or M:SS (also lone M:SS like 0:10)
  const clock = q.match(/\b(\d{1,2}):([0-5]?\d)(?::([0-5]?\d))?\b/);
  if (clock) {
    const a = parseInt(clock[1], 10);
    const b = parseInt(clock[2], 10);
    const c = clock[3] !== undefined ? parseInt(clock[3], 10) : null;
    // H:MM:SS when three groups, else M:SS
    return c !== null ? a * 3600 + b * 60 + c : a * 60 + b;
  }

  // 2) "minute N" / "min N"
  const minuteN = q.match(/\b(?:at\s+)?min(?:ute)?s?\s+(\d{1,3})\b/);
  if (minuteN) return parseInt(minuteN[1], 10) * 60;

  // 3) "N minute(s) [in]"
  const nMin = q.match(/\b(\d{1,3})\s*min(?:ute)?s?\b/);
  if (nMin) return parseInt(nMin[1], 10) * 60;

  // 4) "N second(s) [in]"
  const nSec = q.match(/\b(\d{1,4})\s*sec(?:ond)?s?\b/);
  if (nSec) return parseInt(nSec[1], 10);

  // 5) landmarks
  if (/\b(the\s+)?(start|beginning)\b/.test(q)) return 0;

  return null;
};

/**
 * parseFractionalPhrase — resolve duration-relative navigation to a target
 * time, e.g. "go to the middle", "the end", "a quarter of the way",
 * "halfway", "three quarters in", "60 percent". Needs the media duration.
 *
 * Returns seconds (0..duration) or null if no fractional phrase is present.
 */
export const parseFractionalPhrase = (raw: string, durationSeconds: number): number | null => {
  if (!isFinite(durationSeconds) || durationSeconds <= 0) return null;
  const q = raw.toLowerCase();
  const at = (frac: number) => Math.max(0, Math.min(durationSeconds, Math.round(durationSeconds * frac)));

  // Landmarks
  if (/\b(the\s+)?(start|beginning)\b/.test(q)) return 0;
  if (/\b(the\s+)?end\b|\bvery end\b|\bfinish\b/.test(q)) return at(0.98); // not exact end (avoids 'ended')
  if (/\b(the\s+)?(middle|halfway|half way|half-way)\b|\bhalf\s+way\b/.test(q)) return at(0.5);

  // Explicit percentage: "60 percent", "25%"
  const pct = q.match(/\b(\d{1,3})\s*(?:percent|%)\b/);
  if (pct) return at(Math.min(100, parseInt(pct[1], 10)) / 100);

  // Fractions / quarters / thirds
  if (/\bthree[\s-]?quarters?\b|\b3\/4\b/.test(q)) return at(0.75);
  if (/\b(a|one)?[\s-]?quarter\b|\b1\/4\b|\b25%?\b/.test(q)) return at(0.25);
  if (/\btwo[\s-]?thirds?\b|\b2\/3\b/.test(q)) return at(2 / 3);
  if (/\b(a|one)?[\s-]?third\b|\b1\/3\b/.test(q)) return at(1 / 3);

  return null;
};

/**
 * Classify a question as a playback-control command and extract intent.
 *
 * Returns the resolved target (seconds) and whether the phrase is a PURE
 * control command (no real content question), so the app can perform the seek
 * and give a confident local confirmation instead of asking the model —
 * which avoids the model ever claiming it "can't rewind".
 */
export interface SeekIntent {
  /** Absolute target in seconds, if resolvable (null for relative-only). */
  absoluteSeconds: number | null;
  /** Relative delta in seconds (negative = rewind), if a relative command. */
  relativeSeconds: number | null;
  /** Human verb for the confirmation ("Rewound", "Skipped ahead", "Jumped"). */
  verb: 'Rewound' | 'Skipped ahead' | 'Jumped' | null;
  /** True when the phrase is only a control command (nothing else to answer). */
  pureControl: boolean;
}

const PURE_CONTROL = /^(?:\s*(?:please|can you|could you|hey sidekick|sidekick)\s*)?(?:rewind|fast ?forward|skip (?:ahead|forward|back)?|go (?:back|forward|to)|jump (?:to|back|forward)?|take me (?:to|back)|replay|restart|back to|seek)\b[\s\w:.]*$/i;

export const parseSeekIntent = (raw: string): SeekIntent | null => {
  const q = raw.toLowerCase().trim();

  // Relative: "back/forward N seconds/minutes", "rewind 10 seconds"
  const rel = q.match(/\b(back|forward|rewind|fast ?forward|ahead)\b[^\d]*(\d{1,4})\s*(sec(?:ond)?s?|min(?:ute)?s?)?/);
  let relativeSeconds: number | null = null;
  if (rel) {
    const n = parseInt(rel[2], 10);
    const unit = rel[3] ?? 'sec';
    const mag = unit.startsWith('min') ? n * 60 : n;
    const back = /back|rewind/.test(rel[1]);
    relativeSeconds = back ? -mag : mag;
  }

  const absoluteSeconds = parseTimePhrase(raw); // reuse clock/minute parsing

  // Precedence: a relative directional command ("go back 10 seconds") means a
  // delta, not an absolute time — even though "10 seconds" also parses as an
  // absolute. Only treat as absolute when there's a clock form or "minute N"
  // and NO relative direction was detected.
  const hasClockOrMinute = /\b\d{1,2}:[0-5]?\d\b/.test(q) || /\bmin(?:ute)?s?\s+\d/.test(q);
  const effectiveAbsolute = relativeSeconds !== null && !hasClockOrMinute ? null : absoluteSeconds;

  // Bare directional with no number: "rewind", "go back", "skip ahead"
  const bareBack = /\b(rewind|go back|back to the|replay|restart|start over)\b/.test(q) && relativeSeconds === null && absoluteSeconds === null;
  const bareFwd = /\b(fast ?forward|skip ahead|skip forward)\b/.test(q) && relativeSeconds === null && absoluteSeconds === null;

  if (relativeSeconds === null && absoluteSeconds === null && !bareBack && !bareFwd) {
    return null; // not a seek command
  }

  let verb: SeekIntent['verb'] = 'Jumped';
  if (relativeSeconds !== null) verb = relativeSeconds < 0 ? 'Rewound' : 'Skipped ahead';
  else if (bareBack) verb = 'Rewound';
  else if (bareFwd) verb = 'Skipped ahead';

  // Default magnitudes for bare directional commands (10s step).
  if (bareBack && relativeSeconds === null) relativeSeconds = -10;
  if (bareFwd && relativeSeconds === null) relativeSeconds = 10;

  return {
    absoluteSeconds: effectiveAbsolute,
    relativeSeconds,
    verb,
    pureControl: PURE_CONTROL.test(q),
  };
};
