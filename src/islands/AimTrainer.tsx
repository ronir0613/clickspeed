import { useAimTrainer } from './engine/useAimTrainer';
import { getAimTier } from '../config/tiers';

export default function AimTrainer() {
  const {
    state, target, stats, result, TARGET_SIZE_PCT,
    handleArenaClick, reset,
  } = useAimTrainer();

  const accuracy = (stats.hits + stats.misses) > 0
    ? Math.round((stats.hits / (stats.hits + stats.misses)) * 100)
    : 0;
  const avgMs = stats.hitTimes.length > 1
    ? Math.round(stats.hitTimes.slice(1).reduce((a, b) => a + b, 0) / (stats.hitTimes.length - 1))
    : 0;

  const tier = result ? getAimTier(
    (result.hits + result.misses) > 0
      ? (result.hits / (result.hits + result.misses)) * 100
      : 0
  ) : null;

  const timeLeftS = (stats.timeLeft / 1000).toFixed(1);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', height: '100%' }}>
      {/* Stats row */}
      <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
        <StatChip label="HITS"     value={String(stats.hits)} accent />
        <StatChip label="MISSES"   value={String(stats.misses)} danger={stats.misses > 0} />
        <StatChip label="ACC"      value={`${accuracy}%`} />
        <StatChip label="AVG"      value={avgMs > 0 ? `${avgMs}ms` : '—'} />
        <div style={{ marginLeft: 'auto', fontFamily: 'var(--font-mono)', fontVariantNumeric: 'tabular-nums', fontSize: '1.25rem', color: 'var(--accent)' }}>
          {timeLeftS}s
        </div>
      </div>

      {/* Arena */}
      <div
        role="button"
        tabIndex={0}
        aria-label={state === 'idle' ? 'Click to start aim training' : 'Aim arena'}
        className="arena chamfer-clip-lg"
        onPointerDown={handleArenaClick}
        style={{
          flex: 1,
          minHeight: '55vh',
          border: `2px solid ${state === 'running' ? 'var(--accent)' : 'var(--line)'}`,
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundImage: 'linear-gradient(var(--line) 1px, transparent 1px), linear-gradient(90deg, var(--line) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      >
        {/* Corner ticks */}
        {[
          { style: { top: 8, left: 8, borderTop: '2px solid var(--accent)', borderLeft: '2px solid var(--accent)' } },
          { style: { top: 8, right: 8, borderTop: '2px solid var(--accent)', borderRight: '2px solid var(--accent)' } },
          { style: { bottom: 8, left: 8, borderBottom: '2px solid var(--accent)', borderLeft: '2px solid var(--accent)' } },
          { style: { bottom: 8, right: 8, borderBottom: '2px solid var(--accent)', borderRight: '2px solid var(--accent)' } },
        ].map((t, i) => (
          <div key={i} aria-hidden="true" style={{ position: 'absolute', width: 16, height: 16, pointerEvents: 'none', ...t.style }} />
        ))}

        {/* Target */}
        {target && (
          <div
            key={target.id}
            aria-hidden="true"
            style={{
              position: 'absolute',
              left: `${target.x}%`,
              top: `${target.y}%`,
              width: `${TARGET_SIZE_PCT}%`,
              height: `${TARGET_SIZE_PCT}%`,
              transform: 'translate(-50%, -50%)',
              background: 'var(--accent)',
              border: '2px solid var(--text)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              pointerEvents: 'none',
              clipPath: `polygon(8px 0%,100% 0%,100% calc(100% - 8px),calc(100% - 8px) 100%,0% 100%,0% 8px)`,
            }}
          >
            {/* Crosshair */}
            <div style={{
              width: '30%', height: '2px',
              background: 'rgba(10,10,11,0.5)',
              position: 'absolute',
            }} />
            <div style={{
              width: '2px', height: '30%',
              background: 'rgba(10,10,11,0.5)',
              position: 'absolute',
            }} />
          </div>
        )}

        {/* Idle / done overlay */}
        {(state === 'idle' || state === 'done') && (
          <div style={{
            textAlign: 'center',
            padding: '0 24px',
            pointerEvents: 'none',
          }}>
            {state === 'done' && result ? (
              <>
                <div className="readout readout-hero" style={{ color: 'var(--accent)' }} aria-live="polite">
                  {result.hits}
                  <span className="readout-unit"> HITS</span>
                </div>
                <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', marginTop: '12px', flexWrap: 'wrap' }}>
                  <ResultStat label="ACCURACY" value={`${Math.round((result.hits/(result.hits+result.misses||1))*100)}%`} />
                  <ResultStat label="AVG TIME" value={
                    result.hitTimes.length > 1
                      ? `${Math.round(result.hitTimes.slice(1).reduce((a,b)=>a+b,0)/(result.hitTimes.length-1))}ms`
                      : '—'
                  } />
                  <ResultStat label="MISSES" value={String(result.misses)} />
                </div>
                {tier && (
                  <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'center' }}>
                    <span className="tier-badge" style={{ color: tier.color }}>{tier.label}</span>
                  </div>
                )}
                <div style={{
                  marginTop: '16px',
                  fontFamily: 'var(--font-head)',
                  fontSize: '0.75rem',
                  letterSpacing: '0.12em',
                  color: 'var(--dim)',
                  textTransform: 'uppercase',
                }}>
                  Click to play again
                </div>
              </>
            ) : (
              <>
                <div style={{
                  fontFamily: 'var(--font-head)',
                  fontSize: '1.25rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  color: 'var(--text)',
                }}>
                  Click to Start
                </div>
                <div style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.75rem',
                  color: 'var(--dim)',
                  marginTop: '8px',
                }}>
                  30 seconds · hit targets · track accuracy
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Key hints */}
      <div style={{
        fontFamily: 'var(--font-mono)',
        fontSize: '0.65rem',
        color: 'var(--faint)',
        display: 'flex',
        gap: '12px',
      }}>
        <span><span className="key-badge">R</span> reset</span>
        <span><span className="key-badge">Esc</span> cancel</span>
      </div>
    </div>
  );
}

function StatChip({ label, value, accent, danger }: {
  label: string; value: string; accent?: boolean; danger?: boolean;
}) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div className="stat-label">{label}</div>
      <div className="readout-sm readout" style={{
        color: accent ? 'var(--accent)' : danger ? 'var(--danger)' : 'var(--text)',
      }}>
        {value}
      </div>
    </div>
  );
}

function ResultStat({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div className="stat-label">{label}</div>
      <div className="readout-sm readout">{value}</div>
    </div>
  );
}
