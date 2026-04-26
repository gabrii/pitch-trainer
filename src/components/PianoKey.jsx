const WHITE_BASE = 'relative h-20 w-9 rounded-b-md cursor-pointer transition-all duration-100';
const BLACK_BASE = 'relative h-13 w-6 -ml-3 -mr-3 z-10 rounded-b-md cursor-pointer transition-all duration-100';

// highlightOverride: 'green'|'red'|'cyan'|'rose-light'|'yellow'|null
function colorClass(isBlack, isTarget, isDetected, highlightOverride) {
  // Explicit override takes precedence
  if (highlightOverride === 'green')      return isBlack ? 'bg-green-400 border-green-500'  : 'bg-green-300 border-green-400';
  if (highlightOverride === 'red')        return isBlack ? 'bg-red-400 border-red-500'       : 'bg-red-300 border-red-400';
  if (highlightOverride === 'cyan')       return isBlack ? 'bg-cyan-500 border-cyan-600'     : 'bg-cyan-300 border-cyan-400';
  if (highlightOverride === 'yellow')     return isBlack ? 'bg-yellow-400 border-yellow-500' : 'bg-yellow-200 border-yellow-300';
  if (highlightOverride === 'rose-light') return isBlack ? 'bg-rose-300 border-rose-400'     : 'bg-rose-200 border-rose-300';

  // Default mode logic
  if (isTarget && isDetected) return isBlack ? 'bg-green-400 border-green-500'  : 'bg-green-300 border-green-400';
  if (isTarget)               return isBlack ? 'bg-cyan-500 border-cyan-600'    : 'bg-cyan-300 border-cyan-400';
  if (isDetected)             return isBlack ? 'bg-yellow-400 border-yellow-500': 'bg-yellow-200 border-yellow-300';
  return null;
}

function labelColor(isBlack, isTarget, isDetected, harmonicIntensity, inRange, highlightOverride) {
  if (!inRange) return isBlack ? 'text-zinc-200 opacity-50' : 'text-zinc-300 opacity-50';
  if (highlightOverride) return isBlack ? 'text-zinc-800' : 'text-zinc-600';
  if (isBlack && (isTarget || isDetected)) return 'text-zinc-800';
  if (isBlack) return harmonicIntensity > 0.3 ? 'text-zinc-200' : 'text-zinc-300';
  return 'text-zinc-500';
}

export default function PianoKey({ isBlack, isTarget, isDetected, harmonicIntensity = 0, inRange = true, label, onClick, highlightOverride }) {
  const base = isBlack ? BLACK_BASE : WHITE_BASE;
  const borderStyle = !inRange ? 'border border-dashed' : 'border';

  let colorCls = '';
  let bgStyle;

  const overriddenColor = colorClass(isBlack, isTarget, isDetected, highlightOverride);
  if (overriddenColor) {
    colorCls = overriddenColor;
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
      ? (disabled ? 'bg-zinc-400 border-zinc-300' : 'bg-zinc-800 border-zinc-900')
      : (disabled ? 'bg-zinc-100 border-zinc-300' : 'bg-white border-zinc-300');
  }

  return (
    <button className={`${base} ${borderStyle} ${colorCls}`} style={bgStyle} onClick={onClick}>
      {label && (
        <span className={`absolute bottom-0.5 left-1/2 -translate-x-1/2 text-[8px] font-bold select-none pointer-events-none leading-none ${labelColor(isBlack, isTarget, isDetected, harmonicIntensity, inRange, highlightOverride)}`}>
          {label}
        </span>
      )}
    </button>
  );
}
