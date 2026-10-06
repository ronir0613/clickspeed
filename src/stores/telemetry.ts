import { create } from 'zustand';
import type { ClickStats, TestState } from '../islands/engine/useClickTest';

interface TelemetryStore {
  stats: ClickStats;
  state: TestState;
  duration: number;
  history: Array<{ cps: number; count: number; date: string }>;
  setStats: (stats: ClickStats) => void;
  setState: (state: TestState) => void;
  setDuration: (d: number) => void;
  addHistory: (run: { cps: number; count: number; date: string }) => void;
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

export const useTelemetryStore = create<TelemetryStore>((set) => ({
  stats: DEFAULT_STATS,
  state: 'idle',
  duration: 5,
  history: [],
  setStats: (stats) => set({ stats }),
  setState: (state) => set({ state }),
  setDuration: (duration) => set({ duration }),
  addHistory: (run) => set((prev) => ({
    history: [run, ...prev.history].slice(0, 5),
  })),
}));
