import { useCallback, useEffect, useRef, useState } from 'react';

export interface AimTarget {
  id: number;
  x: number; // percent 0-100
  y: number; // percent 0-100
}

export interface AimStats {
  hits: number;
  misses: number;
  timeLeft: number;
  elapsed: number;
  hitTimes: number[]; // ms per hit
}

export type AimState = 'idle' | 'running' | 'done';

const DURATION_MS = 30_000;
const TARGET_SIZE_PCT = 8; // target diameter as % of arena

function randPos(margin = 10) {
  return margin + Math.random() * (100 - margin * 2);
}

let nextId = 0;

export function useAimTrainer() {
  const [state, setState] = useState<AimState>('idle');
  const [target, setTarget] = useState<AimTarget | null>(null);
  const [stats, setStats] = useState<AimStats>({ hits: 0, misses: 0, timeLeft: DURATION_MS, elapsed: 0, hitTimes: [] });
  const [result, setResult] = useState<AimStats | null>(null);

  const startTimeRef    = useRef<number | null>(null);
  const lastHitTimeRef  = useRef<number | null>(null);
  const animFrameRef    = useRef<number | null>(null);
  const statsRef        = useRef(stats);
  statsRef.current = stats;

  const spawnTarget = useCallback(() => {
    setTarget({ id: nextId++, x: randPos(), y: randPos() });
  }, []);

  const tick = useCallback(() => {
    const start = startTimeRef.current;
    if (!start) return;
    const now = performance.now();
    const elapsed = now - start;
    const timeLeft = Math.max(0, DURATION_MS - elapsed);

    setStats(prev => ({ ...prev, elapsed, timeLeft }));

    if (timeLeft <= 0) {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      setState('done');
      setTarget(null);
      setResult({ ...statsRef.current, elapsed, timeLeft: 0 });
      return;
    }
    animFrameRef.current = requestAnimationFrame(tick);
  }, []);

  const start = useCallback(() => {
    startTimeRef.current = performance.now();
    lastHitTimeRef.current = startTimeRef.current;
    setState('running');
    setStats({ hits: 0, misses: 0, timeLeft: DURATION_MS, elapsed: 0, hitTimes: [] });
    setResult(null);
    spawnTarget();
    animFrameRef.current = requestAnimationFrame(tick);
  }, [spawnTarget, tick]);

  const reset = useCallback(() => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    startTimeRef.current = null;
    setState('idle');
    setTarget(null);
    setStats({ hits: 0, misses: 0, timeLeft: DURATION_MS, elapsed: 0, hitTimes: [] });
    setResult(null);
  }, []);

  const handleArenaClick = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (state === 'idle') { start(); return; }
    if (state === 'done') { reset(); return; }
    if (state !== 'running') return;

    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const xPct = ((e.clientX - rect.left) / rect.width) * 100;
    const yPct = ((e.clientY - rect.top)  / rect.height) * 100;

    if (!target) return;

    // Check hit
    const dx = xPct - target.x;
    const dy = yPct - target.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    const now = performance.now();
    if (dist <= TARGET_SIZE_PCT / 2) {
      const hitMs = lastHitTimeRef.current ? now - lastHitTimeRef.current : 0;
      lastHitTimeRef.current = now;
      setStats(prev => ({
        ...prev,
        hits: prev.hits + 1,
        hitTimes: [...prev.hitTimes, hitMs],
      }));
      spawnTarget();
    } else {
      setStats(prev => ({ ...prev, misses: prev.misses + 1 }));
    }
  }, [state, target, start, reset, spawnTarget]);

  useEffect(() => {
    return () => { if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current); };
  }, []);

  return {
    state, target, stats, result, TARGET_SIZE_PCT,
    handleArenaClick, reset,
  };
}
