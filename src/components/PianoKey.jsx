const WHITE_BASE = 'relative h-20 w-9 rounded-b-md cursor-pointer transition-all duration-100';
const BLACK_BASE = 'relative h-13 w-6 -ml-3 -mr-3 z-10 rounded-b-md cursor-pointer transition-all duration-100';

function colorClass(isBlack, isTarget, isDetected) {
  if (isTarget && isDetected) {
    return isBlack ? 'bg-green-400 border-green-500' : 'bg-green-300 border-green-400';
  }
  if (isTarget) {
    return isBlack ? 'bg-cyan-500 border-cyan-600' : 'bg-cyan-300 border-cyan-400';
  }
  if (isDetected) {
    return isBlack ? 'bg-yellow-400 border-yellow-500' : 'bg-yellow-200 border-yellow-300';
  }
  return null;
}

function labelColor(isBlack, isTarget, isDetected, harmonicIntensity, inRange) {
  if (!inRange) return isBlack ? 'text-slate-200 opacity-50' : 'text-slate-300 opacity-50';
  if (isBlack && (isTarget || isDetected)) return 'text-slate-800';
  if (isBlack) return harmonicIntensity > 0.3 ? 'text-slate-200' : 'text-slate-300';
  return 'text-slate-500';
}

export default function PianoKey({ isBlack, isTarget, isDetected, harmonicIntensity = 0, inRange = true, label, onClick }) {
  const base = isBlack ? BLACK_BASE : WHITE_BASE;
  const borderStyle = !inRange ? 'border border-dashed' : 'border';

  let colorCls = '';
  let bgStyle;

  const highlight = colorClass(isBlack, isTarget, isDetected);
  if (highlight) {
    colorCls = highlight;
  } else if (harmonicIntensity > 0) {
    const alpha = Math.round(harmonicIntensity * 0.45 * 255).toString(16).padStart(2, '0');
    bgStyle = {
      backgroundColor: isBlack
        ? `rgba(139, 92, 246, ${Math.min(1, 0.3 + harmonicIntensity * 0.7)})`
        : `#a78bfa${alpha}`,
    };
    colorCls = isBlack ? 'border-violet-700' : 'border-violet-300';
  } else {
    const disabled = !inRange;
    colorCls = isBlack
      ? (disabled ? 'bg-slate-400 border-slate-300' : 'bg-slate-800 border-slate-900')
      : (disabled ? 'bg-slate-100 border-slate-300' : 'bg-white border-slate-300');
  }

  return (
    <button className={`${base} ${borderStyle} ${colorCls}`} style={bgStyle} onClick={onClick}>
      {label && (
        <span className={`absolute bottom-0.5 left-1/2 -translate-x-1/2 text-[8px] font-bold select-none pointer-events-none leading-none ${labelColor(isBlack, isTarget, isDetected, harmonicIntensity, inRange)}`}>
          {label}
        </span>
      )}
    </button>
  );
}
