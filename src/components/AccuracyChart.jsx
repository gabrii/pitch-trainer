import { useRef, useEffect, useCallback } from 'react';
import { useSettings } from '../contexts/SettingsContext';

const CAP = 50; // ±50 cents range

// Band colors (matching the vertical meter gradient)
const BAND_COLORS = {
  good: 'rgba(134, 239, 172, 0.44)',  // green
  warn: 'rgba(252, 211, 77, 0.34)',   // amber
  bad: 'rgba(248, 151, 154, 0.34)',   // red
};

const LINE_COLORS = {
  good: '#34d399',  // emerald-400
  warn: '#fbbf24',  // amber-400
  bad: '#f87171',   // red-400
};

const MAX_POINTS = 200;
const NULL_SENTINEL = -999;

export default function AccuracyChart({ centsFromTarget, hasDetection, height = 160, roundedRight = true }) {
  const { derived } = useSettings();
  // Latest thresholds readable inside the rAF draw loop without restarting it
  const thresholdsRef = useRef({ good: derived.visualGood, warn: derived.visualWarn });
  thresholdsRef.current = { good: derived.visualGood, warn: derived.visualWarn };

  const canvasRef = useRef(null);
  const pointsRef = useRef([]);
  const rafRef = useRef(null);

  // Push new data point
  useEffect(() => {
    const pts = pointsRef.current;
    pts.push(hasDetection ? Math.max(-CAP, Math.min(CAP, centsFromTarget)) : NULL_SENTINEL);
    if (pts.length > MAX_POINTS) pts.shift();
  }, [centsFromTarget, hasDetection]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;

    if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.scale(dpr, dpr);
    }

    ctx.clearRect(0, 0, w, h);

    // Draw horizontal band backgrounds (derived from difficulty thresholds)
    const { good: tGood, warn: tWarn } = thresholdsRef.current;
    const gP = (tGood / CAP) * 0.5;
    const wP = (tWarn / CAP) * 0.5;
    const bandRanges = [
      { from: 0, to: 0.5 - wP, color: BAND_COLORS.bad },
      { from: 0.5 - wP, to: 0.5 - gP, color: BAND_COLORS.warn },
      { from: 0.5 - gP, to: 0.5 + gP, color: BAND_COLORS.good },
      { from: 0.5 + gP, to: 0.5 + wP, color: BAND_COLORS.warn },
      { from: 0.5 + wP, to: 1, color: BAND_COLORS.bad },
    ];
    for (const band of bandRanges) {
      ctx.fillStyle = band.color;
      ctx.fillRect(0, band.from * h, w, (band.to - band.from) * h);
    }

    // Center line
    ctx.strokeStyle = 'rgba(51, 65, 85, 0.3)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(0, h / 2);
    ctx.lineTo(w, h / 2);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw data line
    const pts = pointsRef.current;
    if (pts.length < 2) {
      rafRef.current = requestAnimationFrame(draw);
      return;
    }

    const step = w / (MAX_POINTS - 1);
    const offsetX = (MAX_POINTS - pts.length) * step;

    // Draw line segments colored by band
    ctx.lineWidth = 2;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    let inSegment = false;
    let prevX = 0, prevY = 0, prevVal = 0;

    const { good: GOOD, warn: WARN } = thresholdsRef.current;
    function colorForCents(c) {
      const a = Math.abs(c);
      return a <= GOOD ? LINE_COLORS.good : a <= WARN ? LINE_COLORS.warn : LINE_COLORS.bad;
    }

    for (let i = 0; i < pts.length; i++) {
      const val = pts[i];
      if (val === NULL_SENTINEL) {
        inSegment = false;
        continue;
      }

      const x = offsetX + i * step;
      // Map cents to y: +CAP at top (y=0), -CAP at bottom (y=h)
      const y = ((CAP - val) / (CAP * 2)) * h;

      if (inSegment) {
        // Use the worse (further from center) of the two endpoints
        const worse = Math.abs(val) >= Math.abs(prevVal) ? val : prevVal;
        ctx.strokeStyle = colorForCents(worse);
        ctx.beginPath();
        ctx.moveTo(prevX, prevY);
        ctx.lineTo(x, y);
        ctx.stroke();
      }

      prevX = x;
      prevY = y;
      prevVal = val;
      inSegment = true;
    }

    // Draw current value dot
    if (pts.length > 0) {
      const lastVal = pts[pts.length - 1];
      if (lastVal !== NULL_SENTINEL) {
        const lx = offsetX + (pts.length - 1) * step;
        const ly = ((CAP - lastVal) / (CAP * 2)) * h;
        ctx.fillStyle = colorForCents(lastVal);
        ctx.beginPath();
        ctx.arc(lx, ly, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    rafRef.current = requestAnimationFrame(draw);
  }, []);

  useEffect(() => {
    rafRef.current = requestAnimationFrame(draw);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [draw]);

  return (
    <canvas
      ref={canvasRef}
      className={`w-full border border-slate-200 ${roundedRight ? 'rounded-lg' : 'rounded-l-lg border-r-0'}`}
      style={{ height }}
    />
  );
}
