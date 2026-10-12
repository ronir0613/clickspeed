import { useCallback, useEffect } from 'react';
import { useReactionTest } from './engine/useReactionTest';
import { useCursorTrail } from './engine/useCursorTrail';
import { getReactionTier } from '../config/tiers';

const REACTION_GREEN = '#39e079';

export default function ReactionTest() {
  const { arenaRef, canvasRef } = useCursorTrail();
  const {
    state, currentRound, totalRounds, rounds, currentMs, result,
    handleInput, reset,
  } = useReactionTest();

  // Keyboard input starts or advances the test. Arrow keys are reserved for site navigation.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.repeat) return;
      if (['Shift','Control','Alt','Meta','Tab'].includes(e.key)) return;
      if (['ArrowLeft', 'ArrowRight', '[', ']'].includes(e.key)) return;
      if (e.key === 'Escape') { reset(); return; }
      if (e.key === 'r' || e.key === 'R') { reset(); return; }
      if (e.code === 'Space') e.preventDefault();
      handleInput();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [handleInput, reset]);

  const bgColor = state === 'ready'  ? REACTION_GREEN
    : state === 'fault'  ? 'var(--danger)'
    : state === 'done'   ? 'var(--panel-2)'
    : 'var(--bg)';

  const bigLabel = state === 'idle'    ? 'CLICK TO START'
    : state === 'waiting' ? 'WAIT FOR GREEN…'
    : state === 'ready'   ? 'CLICK NOW!'
    : state === 'fault'   ? '⚡ TOO EARLY'
    : result ? `AVG ${result.average.toFixed(0)} ms` : '';

  const bigColor = state === 'ready'  ? '#0A0A0B'
    : state === 'done'   ? REACTION_GREEN
    : state === 'fault'  ? 'var(--text)'
    : 'var(--text)';

  const subLabel = state === 'idle'   ? 'Or press any key'
    : state === 'fault'  ? 'Click to retry this round'
    : state === 'waiting' ? `Round ${currentRound + 1} of ${totalRounds}`
    : state === 'ready'   ? 'GO!'
    : state === 'done'    ? 'Click or press R to restart'
    : '';

  const tier = result ? getReactionTier(result.average) : null;

  return (
    <div className="reaction-test" style={{ display: 'flex', flexDirection: 'column', gap: '12px', height: '100%', '--accent': REACTION_GREEN } as React.CSSProperties}>
      {/* Round indicators */}
      <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
        <span className="section-label" style={{ marginBottom: 0, marginRight: '8px' }}>
          ROUNDS
        </span>
        {Array.from({ length: totalRounds }).map((_, i) => {
          const r = rounds[i];
          const color = !r ? 'var(--line)'
            : r.fault ? 'var(--danger)'
            : REACTION_GREEN;
          const txt = r ? (r.fault ? 'F' : `${r.ms.toFixed(0)}`) : '—';
          return (
            <div key={i} style={{
              flex: 1,
              border: `1px solid ${color}`,
              padding: '4px 6px',
              textAlign: 'center',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.65rem',
              fontVariantNumeric: 'tabular-nums',
              color,
            }}>
              {txt}
            </div>
          );
        })}
      </div>

      {/* Arena */}
      <div
        ref={arenaRef}
        role="button"
        tabIndex={0}
        aria-label={bigLabel}
        onPointerDown={handleInput}
        onKeyDown={e => { if (e.key === 'Enter') handleInput(); }}
        className="arena chamfer-clip-lg"
        style={{
          flex: 1,
          minHeight: 'clamp(280px, 55vh, 640px)',
          background: bgColor,
          border: `2px solid ${state === 'ready' ? REACTION_GREEN : state === 'fault' ? 'var(--danger)' : 'var(--line)'}`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          cursor: 'crosshair',
          transition: 'background 80ms linear, border-color 80ms linear',
        }}
      >
        <canvas
          ref={canvasRef}
          aria-hidden="true"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 1 }}
        />

        {/* Corner ticks */}
        {['tl','tr','bl','br'].map(pos => (
          <div key={pos} aria-hidden="true" style={{
            position: 'absolute',
            zIndex: 2,
            width: 16, height: 16,
            ...(pos === 'tl' ? { top: 8, left: 8, borderTop: '2px solid var(--accent)', borderLeft: '2px solid var(--accent)' } : {}),
            ...(pos === 'tr' ? { top: 8, right: 8, borderTop: '2px solid var(--accent)', borderRight: '2px solid var(--accent)' } : {}),
            ...(pos === 'bl' ? { bottom: 8, left: 8, borderBottom: '2px solid var(--accent)', borderLeft: '2px solid var(--accent)' } : {}),
            ...(pos === 'br' ? { bottom: 8, right: 8, borderBottom: '2px solid var(--accent)', borderRight: '2px solid var(--accent)' } : {}),
            pointerEvents: 'none',
            opacity: state === 'ready' ? 0 : 1,
            transition: 'opacity 80ms linear',
          }} />
        ))}

        <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', pointerEvents: 'none', padding: '0 24px' }}>
          {/* Big readout */}
          {currentMs !== null && state !== 'waiting' && state !== 'ready' && (
            <div className="readout readout-hero" style={{ color: bigColor }} aria-live="polite">
              {currentMs.toFixed(0)}
              <span className="readout-unit"> ms</span>
            </div>
          )}

          <div style={{
            fontFamily: 'var(--font-head)',
            fontSize: state === 'ready' ? '3rem' : '1.1rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.12em',
            color: bigColor,
            transition: 'font-size 80ms linear',
          }}>
            {bigLabel}
          </div>

          {subLabel && (
            <div style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.75rem',
              color: state === 'ready' ? 'rgba(10,10,11,0.7)' : 'var(--dim)',
              marginTop: '8px',
              letterSpacing: '0.1em',
            }}>
              {subLabel}
            </div>
          )}

          {/* Results */}
          {state === 'done' && result && (
            <div style={{ marginTop: '24px' }}>
              <div style={{ display: 'flex', gap: '24px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <div style={{ textAlign: 'center' }}>
                  <div className="stat-label">AVERAGE</div>
                  <div className="readout readout-sm" style={{ color: REACTION_GREEN }}>
                    {result.average.toFixed(0)} ms
                  </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div className="stat-label">BEST</div>
                  <div className="readout readout-sm">{result.best.toFixed(0)} ms</div>
                </div>
              </div>
              {tier && (
                <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'center' }}>
                  <span className="tier-badge" style={{ color: tier.color }}>{tier.label}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Fault overlay label */}
        {state === 'fault' && (
          <div style={{
            position: 'absolute',
            zIndex: 2,
            bottom: 24,
            fontFamily: 'var(--font-mono)',
            fontSize: '0.75rem',
            color: 'var(--danger)',
            letterSpacing: '0.1em',
            pointerEvents: 'none',
          }}>
            ROUND WILL RESTART
          </div>
        )}
      </div>

      {/* Key hints */}
      <div style={{
        fontFamily: 'var(--font-mono)',
        fontSize: '0.65rem',
        color: 'var(--faint)',
        letterSpacing: '0.08em',
        display: 'flex',
        gap: '12px',
      }}>
        <span><span className="key-badge">R</span> reset</span>
        <span><span className="key-badge">Esc</span> cancel</span>
        <span><span className="key-badge">ANY KEY</span> input</span>
      </div>
    </div>
  );
}
