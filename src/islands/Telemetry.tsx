import { useEffect, useRef } from 'react';
import type { ClickStats, TestState } from './engine/useClickTest';
import { calcConsistency, calcBestBurst } from './engine/useClickTest';

interface TelemetryProps {
  stats: ClickStats;
  state: TestState;
  duration: number;
  history: Array<{ cps: number; count: number; date: string }>;
}

export default function Telemetry({ stats, state, duration, history }: TelemetryProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Draw live click graph
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    const buckets = stats.buckets;
    if (!buckets.length) return;

    const totalBuckets = (duration * 1000) / 100; // total 100ms buckets
    const barW = W / totalBuckets;
    const maxVal = Math.max(...buckets, 1);

    // Grid lines
    ctx.strokeStyle = '#2A2A2F';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = Math.round((H / 4) * i);
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(W, y);
      ctx.stroke();
    }

    // Bars
    buckets.forEach((val, i) => {
      if (!val) return;
      const barH = (val / maxVal) * (H - 4);
      const x = Math.floor(i * barW);
      ctx.fillStyle = '#FFB000';
      ctx.fillRect(x, H - barH, Math.max(barW - 1, 1), barH);
    });
  }, [stats.buckets, duration]);

  const consistency = calcConsistency(stats.intervals);
  const bestBurst   = calcBestBurst(stats.buckets);
  const consistencyScore = consistency > 0 
    ? Math.max(0, Math.round(100 - consistency / 5))
    : (state === 'running' || state === 'done' ? 100 : 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', height: '100%' }}>
      {/* Section label */}
      <div className="section-label">TELEMETRY</div>

      {/* Primary stats */}
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <StatRow label="CPS"        value={stats.cps.toFixed(2)}    accent />
        <StatRow label="PEAK CPS"   value={stats.peakCps.toFixed(2)} />
        <StatRow label="TOTAL CLICKS" value={String(stats.count)} />
        <StatRow
          label="TIME LEFT"
          value={state === 'done' ? '0.0' : (stats.timeLeft / 1000).toFixed(1) + 's'}
        />
        {state === 'done' && (
          <>
            <StatRow label="CONSISTENCY" value={`${consistencyScore}%`} />
            <StatRow label="BEST 1s BURST" value={String(bestBurst)} />
          </>
        )}
      </div>

      {/* Live canvas graph */}
      <div>
        <div className="section-label" style={{ marginBottom: '6px' }}>CLICK RATE</div>
        <div style={{
          background: 'var(--panel-2)',
          border: '1px solid var(--line)',
          padding: '4px',
        }}>
          <canvas
            ref={canvasRef}
            width={280}
            height={80}
            aria-label="Live click rate graph"
            style={{ display: 'block', width: '100%', imageRendering: 'pixelated' }}
          />
        </div>
      </div>

      {/* Run history */}
      {history.length > 0 && (
        <div>
          <div className="section-label" style={{ marginBottom: '6px' }}>LAST {history.length} RUNS</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {history.map((run, i) => (
              <div key={i} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '4px 6px',
                background: 'var(--panel-2)',
                borderLeft: i === 0 ? '2px solid var(--accent)' : '2px solid transparent',
              }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--faint)' }}>
                  #{history.length - i}
                </span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', fontVariantNumeric: 'tabular-nums', color: 'var(--text)' }}>
                  {run.cps.toFixed(2)}
                </span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--faint)' }}>
                  {run.count} clicks
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StatRow({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="stat-row">
      <span className="stat-label">{label}</span>
      <span className="stat-value" style={accent ? { color: 'var(--accent)' } : undefined}>
        {value}
      </span>
    </div>
  );
}
