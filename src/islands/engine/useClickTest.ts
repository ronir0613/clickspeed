import { useCallback, useEffect, useRef, useState } from 'react';
import type { InputType } from '../../config/tests';

export type TestState = 'idle' | 'running' | 'done';

export interface ClickStats {
  count: number;
  cps: number;
  peakCps: number;
  elapsed: number;      // ms
  timeLeft: number;     // ms
  buckets: number[];    // clicks per 100ms bucket for live graph
  intervals: number[];  // ms between consecutive clicks for histogram
  lastClickTime: number | null;
}

export interface ClickTestOptions {
  inputType: InputType;
  duration: number; // seconds
  onComplete?: (stats: ClickStats) => void;
}

const DEFAULT_STATS: ClickStats = {
  count: 0,
  cps: 0,
  peakCps: 0,
  elapsed: 0,
  timeLeft: 0,
  buckets: [],
  intervals: [],
  lastClickTime: null,
};

export function useClickTest({ inputType, duration, onComplete }: ClickTestOptions) {
  const [state, setState] = useState<TestState>('idle');
  const [stats, setStats] = useState<ClickStats>({ ...DEFAULT_STATS, timeLeft: duration * 1000 });

  // Refs so callbacks are stable and don't close over stale values
  const startTimeRef    = useRef<number | null>(null);
  const lastClickRef    = useRef<number | null>(null);
  const countRef        = useRef(0);
  const peakCpsRef      = useRef(0);
  const bucketsRef      = useRef<number[]>([]);
  const intervalsRef    = useRef<number[]>([]);
  const animFrameRef    = useRef<number | null>(null);
  const durationMs      = duration * 1000;

  // ── Reset ────────────────────────────────────────────────
  const reset = useCallback(() => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    startTimeRef.current = null;
    lastClickRef.current = null;
    countRef.current = 0;
    peakCpsRef.current = 0;
    bucketsRef.current = [];
    intervalsRef.current = [];
    setState('idle');
    setStats({ ...DEFAULT_STATS, timeLeft: duration * 1000 });
  }, [duration]);

  // ── Ticker (rAF loop) ────────────────────────────────────
  const tick = useCallback(() => {
    const start = startTimeRef.current;
    if (!start) return;
    const now = performance.now();
    const elapsed = now - start;
    const timeLeft = Math.max(0, durationMs - elapsed);
    const cps = elapsed > 0 ? (countRef.current / elapsed) * 1000 : 0;

    if (cps > peakCpsRef.current) peakCpsRef.current = cps;

    setStats({
      count: countRef.current,
      cps,
      peakCps: peakCpsRef.current,
      elapsed,
      timeLeft,
      buckets: [...bucketsRef.current],
      intervals: [...intervalsRef.current],
      lastClickTime: lastClickRef.current,
    });

    if (timeLeft <= 0) {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      setState('done');
      onComplete?.({
        count: countRef.current,
        cps,
        peakCps: peakCpsRef.current,
        elapsed,
        timeLeft: 0,
        buckets: [...bucketsRef.current],
        intervals: [...intervalsRef.current],
        lastClickTime: lastClickRef.current,
      });
      return;
    }

    animFrameRef.current = requestAnimationFrame(tick);
  }, [durationMs, onComplete]);

  // ── Register a click ─────────────────────────────────────
  const registerClick = useCallback(() => {
    const now = performance.now();

    if (!startTimeRef.current) {
      // First click: start the timer
      startTimeRef.current = now;
      setState('running');
      animFrameRef.current = requestAnimationFrame(tick);
    }

    // Check within duration
    const elapsed = now - startTimeRef.current;
    if (elapsed > durationMs) return;

    // Interval tracking
    if (lastClickRef.current !== null) {
      intervalsRef.current.push(now - lastClickRef.current);
    }
    lastClickRef.current = now;

    // Bucket tracking (100ms buckets)
    const bucketIdx = Math.floor(elapsed / 100);
    bucketsRef.current[bucketIdx] = (bucketsRef.current[bucketIdx] ?? 0) + 1;

    countRef.current += 1;
  }, [durationMs, tick]);

  // ── Cleanup on unmount ───────────────────────────────────
  useEffect(() => {
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  return { state, stats, registerClick, reset };
}

// ── Utility: std deviation of click intervals ─────────────
export function calcConsistency(intervals: number[]): number {
  if (intervals.length < 2) return 0;
  const mean = intervals.reduce((a, b) => a + b, 0) / intervals.length;
  const variance = intervals.reduce((sum, v) => sum + (v - mean) ** 2, 0) / intervals.length;
  return Math.sqrt(variance);
}

// ── Best 1-second burst ───────────────────────────────────
export function calcBestBurst(buckets: number[]): number {
  // Sum over sliding 10-bucket (1-second) window
  let best = 0;
  for (let i = 0; i <= buckets.length - 10; i++) {
    const window = buckets.slice(i, i + 10).reduce((a, b) => a + (b ?? 0), 0);
    if (window > best) best = window;
  }
  return best;
}
