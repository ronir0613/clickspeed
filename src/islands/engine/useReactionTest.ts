import { useCallback, useRef, useState } from 'react';
import { getReactionTier } from '../../config/tiers';

export type ReactionState = 'idle' | 'waiting' | 'ready' | 'done' | 'fault';

export interface ReactionRound {
  ms: number;
  fault: boolean;
}

export interface ReactionResult {
  rounds: ReactionRound[];
  average: number;
  best: number;
}

const TOTAL_ROUNDS = 5;
const MIN_DELAY_MS = 2000;
const MAX_DELAY_MS = 5000;

export function useReactionTest() {
  const [state, setState] = useState<ReactionState>('idle');
  const [currentRound, setCurrentRound] = useState(0);
  const [rounds, setRounds] = useState<ReactionRound[]>([]);
  const [currentMs, setCurrentMs] = useState<number | null>(null);
  const [result, setResult] = useState<ReactionResult | null>(null);

  const goTimeRef  = useRef<number | null>(null);
  const timerRef   = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = null;
  };

  const startRound = useCallback(() => {
    clearTimer();
    setState('waiting');
    goTimeRef.current = null;
    const delay = MIN_DELAY_MS + Math.random() * (MAX_DELAY_MS - MIN_DELAY_MS);
    timerRef.current = setTimeout(() => {
      goTimeRef.current = performance.now();
      setState('ready');
    }, delay);
  }, []);

  const handleInput = useCallback(() => {
    if (state === 'idle') {
      // Start first round
      setCurrentRound(0);
      setRounds([]);
      setResult(null);
      setCurrentMs(null);
      startRound();
      return;
    }

    if (state === 'waiting') {
      // Early click = FAULT
      clearTimer();
      setState('fault');
      return;
    }

    if (state === 'fault') {
      // Retry this round
      startRound();
      return;
    }

    if (state === 'ready') {
      const ms = performance.now() - (goTimeRef.current ?? 0);
      setCurrentMs(ms);

      const newRound: ReactionRound = { ms, fault: false };
      setRounds(prev => {
        const updated = [...prev, newRound];
        const nextRound = currentRound + 1;

        if (nextRound >= TOTAL_ROUNDS) {
          // All rounds done
          const valid = updated.filter(r => !r.fault);
          const average = valid.reduce((s, r) => s + r.ms, 0) / valid.length;
          const best = Math.min(...valid.map(r => r.ms));
          setResult({ rounds: updated, average, best });
          setState('done');
        } else {
          setCurrentRound(nextRound);
          startRound();
        }
        return updated;
      });
      return;
    }

    if (state === 'done') {
      // Restart
      setCurrentRound(0);
      setRounds([]);
      setResult(null);
      setCurrentMs(null);
      startRound();
    }
  }, [state, currentRound, startRound]);

  const reset = useCallback(() => {
    clearTimer();
    setState('idle');
    setCurrentRound(0);
    setRounds([]);
    setResult(null);
    setCurrentMs(null);
    goTimeRef.current = null;
  }, []);

  return {
    state,
    currentRound,
    totalRounds: TOTAL_ROUNDS,
    rounds,
    currentMs,
    result,
    handleInput,
    reset,
  };
}
