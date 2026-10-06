import { useState, useCallback, useRef, useEffect } from 'react';
import { useClickTest, calcConsistency, calcBestBurst } from './engine/useClickTest';
import { getCpsTier } from '../config/tiers';
import { useTelemetryStore } from '../stores/telemetry';
import type { InputType } from '../config/tests';

interface CpsTestProps {
  inputType?: InputType;
  duration?: number;
  ctaLabel?: string;
  testId?: string;
}

const DURATION_OPTIONS = [1, 2, 5, 10, 15, 30, 60] as const;

type Run = { cps: number; count: number; date: string };

export default function CpsTest({
  inputType = 'click',
  duration: defaultDuration = 5,
  ctaLabel = 'CLICK TO START',
  testId = 'cps-test',
}: CpsTestProps) {
  const [duration, setDuration] = useState(defaultDuration);
  const [history, setHistory] = useState<Run[]>([]);
  const [personalBest, setPersonalBest] = useState<number | null>(null);
  const [isNewPB, setIsNewPB] = useState(false);
  const arenaRef = useRef<HTMLDivElement>(null);
  const flashRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pbKey = `pb-${testId}-cps`;

  // Load personal best
  useEffect(() => {
    try {
      const stored = localStorage.getItem(pbKey);
      if (stored) setPersonalBest(parseFloat(stored));
    } catch {}
  }, [pbKey]);

  const handleComplete = useCallback((finalStats: Parameters<typeof useClickTest>[0]['onComplete'] extends ((s: infer S) => void) ? S : never) => {
    const cps = finalStats.cps;
    const run: Run = {
      cps,
      count: finalStats.count,
      date: new Date().toLocaleTimeString(),
    };
    setHistory(prev => [run, ...prev].slice(0, 5));

    // Personal best
    setPersonalBest(prev => {
      if (prev === null || cps > prev) {
        setIsNewPB(true);
        setTimeout(() => setIsNewPB(false), 3000);
        try { localStorage.setItem(pbKey, String(cps)); } catch {}
        return cps;
      }
      return prev;
    });
  }, [pbKey]);

  const { state, stats, registerClick, reset } = useClickTest({
    inputType,
    duration,
    onComplete: handleComplete,
  });

  // Push stats to zustand store for TelemetryPanel island
  const { setStats, setState: setStoreState, setDuration: setStoreDuration, addHistory } = useTelemetryStore();
  useEffect(() => { setStats(stats); }, [stats, setStats]);
  useEffect(() => { setStoreState(state); }, [state, setStoreState]);
  useEffect(() => { setStoreDuration(duration); }, [duration, setStoreDuration]);

  // Arena flash on click
  const flashArena = useCallback(() => {
    const el = arenaRef.current;
    if (!el) return;
    el.classList.remove('arena-flash');
    void el.offsetWidth; // reflow
    el.classList.add('arena-flash');
    if (flashRef.current) clearTimeout(flashRef.current);
    flashRef.current = setTimeout(() => {
      el.classList.remove('arena-flash');
    }, 120);
  }, []);

  // ── Pointer / keyboard handlers ──────────────────────────
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (inputType === 'rightclick') return; // handled by contextmenu
    if (inputType === 'touch' && e.pointerType !== 'touch') return;
    e.preventDefault();
    if (state === 'done') return;
    registerClick();
    flashArena();
  }, [inputType, state, registerClick, flashArena]);

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    if (inputType !== 'rightclick') return;
    if (state === 'done') return;
    registerClick();
    flashArena();
  }, [inputType, state, registerClick, flashArena]);

  // Spacebar handler
  const lastSpaceRef = useRef(false);
  useEffect(() => {
    if (inputType !== 'spacebar') return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code !== 'Space') return;
      if (e.repeat) return; // ignore auto-repeat
      if (e.target !== document.body && e.target !== document.documentElement) return;
      e.preventDefault();
      if (state === 'done') return;
      registerClick();
      flashArena();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [inputType, state, registerClick, flashArena]);

  // Global keyboard shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'r' || e.key === 'R') reset();
      if (e.key === 'Escape') reset();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [reset]);

  const tier = getCpsTier(stats.cps);
  const showDurationSelector = inputType !== 'spacebar'
    ? DURATION_OPTIONS
    : ([1, 5, 10, 30, 60] as const);

  const cta = state === 'done'
    ? 'PRESS R TO RETRY'
    : state === 'running'
    ? inputType === 'spacebar' ? 'KEEP PRESSING SPACE!' : 'KEEP CLICKING!'
    : ctaLabel;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', height: '100%' }}>

        {/* Duration selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="section-label" style={{ marginBottom: 0, flexShrink: 0 }}>DURATION</span>
          <div className="duration-selector">
            {showDurationSelector.map(d => (
              <button
                key={d}
                className={`duration-btn${duration === d ? ' selected' : ''}`}
                onClick={() => { setDuration(d); reset(); }}
                aria-pressed={duration === d}
                title={`${d} second${d !== 1 ? 's' : ''}`}
              >
                {d}s
              </button>
            ))}
          </div>
        </div>

        {/* Arena */}
        <div
          ref={arenaRef}
          className="arena bg-grid chamfer-clip-lg"
          role="button"
          tabIndex={0}
          aria-label={cta}
          onPointerDown={handlePointerDown}
          onContextMenu={handleContextMenu}
          style={{
            flex: 1,
            minHeight: '55vh',
            border: `2px solid ${state === 'running' ? 'var(--accent)' : state === 'done' ? 'var(--line-strong)' : 'var(--line)'}`,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            overflow: 'hidden',
            transition: 'border-color 80ms linear',
            touchAction: 'manipulation',
          }}
          onKeyDown={e => {
            if (e.key === 'Enter' && state !== 'done') {
              registerClick();
              flashArena();
            }
          }}
        >
          {/* Corner ticks */}
          <div style={{
            position: 'absolute', top: 8, left: 8,
            width: 16, height: 16,
            borderTop: '2px solid var(--accent)',
            borderLeft: '2px solid var(--accent)',
            pointerEvents: 'none',
          }} aria-hidden="true" />
          <div style={{
            position: 'absolute', bottom: 8, right: 8,
            width: 16, height: 16,
            borderBottom: '2px solid var(--accent)',
            borderRight: '2px solid var(--accent)',
            pointerEvents: 'none',
          }} aria-hidden="true" />
          <div style={{
            position: 'absolute', top: 8, right: 8,
            width: 16, height: 16,
            borderTop: '1px solid var(--line-strong)',
            borderRight: '1px solid var(--line-strong)',
            pointerEvents: 'none',
          }} aria-hidden="true" />
          <div style={{
            position: 'absolute', bottom: 8, left: 8,
            width: 16, height: 16,
            borderBottom: '1px solid var(--line-strong)',
            borderLeft: '1px solid var(--line-strong)',
            pointerEvents: 'none',
          }} aria-hidden="true" />

          {/* Big CPS readout */}
          <div style={{ textAlign: 'center', pointerEvents: 'none', position: 'relative', zIndex: 2 }}>
            <div className="readout readout-hero" aria-live="polite" aria-atomic="true">
              {stats.cps.toFixed(2)}
              <span className="readout-unit"> CPS</span>
            </div>

            {/* CTA / status */}
            <div style={{
              fontFamily: 'var(--font-head)',
              fontSize: '0.75rem',
              fontWeight: 600,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color: state === 'running' ? 'var(--accent)' : 'var(--dim)',
              marginTop: '12px',
            }}>
              {cta}
            </div>

            {/* Tier badge */}
            {(state === 'running' || state === 'done') && (
              <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'center' }}>
                <span className="tier-badge" style={{ color: tier.color }}>
                  {tier.label}
                </span>
              </div>
            )}

            {/* New PB */}
            {isNewPB && (
              <div style={{
                marginTop: '8px',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.7rem',
                letterSpacing: '0.1em',
                color: 'var(--accent)',
                animation: 'none',
              }}>
                ★ NEW PERSONAL BEST
              </div>
            )}
          </div>

          {/* Click count badge */}
          <div style={{
            position: 'absolute',
            top: 16,
            right: 24,
            fontFamily: 'var(--font-mono)',
            fontSize: '0.7rem',
            color: 'var(--faint)',
            letterSpacing: '0.08em',
            pointerEvents: 'none',
          }} aria-hidden="true">
            {stats.count} CLICKS
          </div>
        </div>

        {/* Segmented timer bar */}
        <SegmentedBar
          duration={duration}
          elapsed={stats.elapsed}
          state={state}
        />

        {/* Done results panel */}
        {state === 'done' && (
          <ResultsPanel
            stats={stats}
            duration={duration}
            personalBest={personalBest}
            onReset={reset}
          />
        )}
    </div>
  );
}

// ── Segmented timer bar ───────────────────────────────────
function SegmentedBar({ duration, elapsed, state }: {
  duration: number;
  elapsed: number;
  state: string;
}) {
  const segments = Math.min(duration * 2, 60); // max 60 segments
  const progress = state === 'done' ? 0 : Math.min(elapsed / (duration * 1000), 1);
  const filledCount = state === 'idle' ? segments : Math.round((1 - progress) * segments);

  return (
    <div className="seg-bar" role="progressbar"
      aria-valuenow={Math.round(progress * 100)}
      aria-valuemin={0} aria-valuemax={100}
      aria-label={`Time remaining: ${((1 - progress) * duration).toFixed(1)}s`}
    >
      {Array.from({ length: segments }).map((_, i) => (
        <div
          key={i}
          className={`seg-bar-block${i < filledCount ? (state === 'running' ? ' active' : ' done') : ''}`}
        />
      ))}
    </div>
  );
}

// ── Results panel ─────────────────────────────────────────
function ResultsPanel({ stats, duration, personalBest, onReset }: {
  stats: ReturnType<typeof useClickTest>['stats'];
  duration: number;
  personalBest: number | null;
  onReset: () => void;
}) {
  const tier = getCpsTier(stats.cps);
  const consistency = calcConsistency(stats.intervals);
  const bestBurst = calcBestBurst(stats.buckets);
  const score = consistency > 0
    ? Math.max(0, Math.round(100 - consistency / 5))
    : 100;

  return (
    <div style={{
      background: 'var(--panel-2)',
      border: '1px solid var(--line-strong)',
      padding: '16px',
      display: 'flex',
      flexWrap: 'wrap',
      gap: '16px',
      alignItems: 'center',
    }}>
      <div style={{ flex: 1, minWidth: 200 }}>
        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
          <ResultStat label="CPS" value={stats.cps.toFixed(2)} accent />
          <ResultStat label="CLICKS" value={String(stats.count)} />
          <ResultStat label="BEST BURST" value={`${bestBurst}/s`} />
          <ResultStat label="CONSISTENCY" value={`${score}%`} />
        </div>
        <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span className="tier-badge" style={{ color: tier.color }}>{tier.label}</span>
          {personalBest !== null && (
            <span style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.65rem',
              color: 'var(--faint)',
            }}>
              PB: {personalBest.toFixed(2)} CPS
            </span>
          )}
        </div>
      </div>
      <button className="btn btn-primary chamfer-clip-sm" onClick={onReset} aria-label="Retry test">
        RETRY  <span style={{ fontFamily: 'var(--font-mono)' }}>[R]</span>
      </button>
    </div>
  );
}

function ResultStat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div>
      <div className="stat-label">{label}</div>
      <div className="readout-sm readout" style={accent ? { color: 'var(--accent)' } : {}}>
        {value}
      </div>
    </div>
  );
}
