import { useEffect, useRef } from 'react';

interface TrailPoint {
  x: number;
  y: number;
  time: number;
}

export function useCursorTrail() {
  const arenaRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const arena = arenaRef.current;
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!arena || !canvas || !context || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let points: TrailPoint[] = [];
    let frame = 0;
    let width = 0;
    let height = 0;

    const resize = () => {
      const rect = arena.getBoundingClientRect();
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.round(width * pixelRatio);
      canvas.height = Math.round(height * pixelRatio);
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    };

    const draw = (now: number) => {
      frame = 0;
      context.clearRect(0, 0, width, height);
      points = points.filter(point => now - point.time < 320);

      if (!points.length) return;

      const tip = points[points.length - 1];
      const fade = Math.max(0, 1 - (now - tip.time) / 320);
      const tipHue = (now / 4) % 360;
      context.save();
      context.lineWidth = 3;
      context.lineCap = 'round';
      context.lineJoin = 'round';
      context.shadowColor = `hsla(${tipHue}, 100%, 65%, ${0.75 * fade})`;
      context.shadowBlur = 12;

      if (points.length > 1) {
        const start = points[0];
        const gradient = context.createLinearGradient(start.x, start.y, tip.x, tip.y);
        [0, 42, 84, 126, 168, 210, 252, 294, 336].forEach((hue, index, hues) => {
          const alpha = index === 0 ? 0 : (index === hues.length - 1 ? 0.9 : 0.52) * fade;
          gradient.addColorStop(index / (hues.length - 1), `hsla(${hue}, 100%, 65%, ${alpha})`);
        });
        context.strokeStyle = gradient;
        context.beginPath();
        context.moveTo(start.x, start.y);
        for (let i = 1; i < points.length - 1; i++) {
          const midpointX = (points[i].x + points[i + 1].x) / 2;
          const midpointY = (points[i].y + points[i + 1].y) / 2;
          context.quadraticCurveTo(points[i].x, points[i].y, midpointX, midpointY);
        }
        context.lineTo(tip.x, tip.y);
        context.stroke();
      }

      context.beginPath();
      context.arc(tip.x, tip.y, 2.5, 0, Math.PI * 2);
      context.fillStyle = `hsla(${tipHue}, 100%, 70%, ${0.95 * fade})`;
      context.fill();
      context.restore();

      frame = window.requestAnimationFrame(draw);
    };

    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') return;
      const rect = arena.getBoundingClientRect();
      const now = performance.now();
      const next = { x: event.clientX - rect.left, y: event.clientY - rect.top, time: now };
      const previous = points[points.length - 1];
      if (previous && Math.hypot(next.x - previous.x, next.y - previous.y) < 0.5) return;
      points.push(next);
      points = points.filter(point => now - point.time < 320).slice(-48);
      if (!frame) frame = window.requestAnimationFrame(draw);
    };

    const resizeObserver = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(resize);
    resizeObserver?.observe(arena);
    arena.addEventListener('pointermove', onPointerMove);
    window.addEventListener('resize', resize);
    resize();

    return () => {
      resizeObserver?.disconnect();
      arena.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('resize', resize);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return { arenaRef, canvasRef };
}
