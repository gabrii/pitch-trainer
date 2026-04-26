const CAP = 50;

const TICKS = [-50, -25, -10, 0, 10, 25, 50];

function colorForCents(absCents, visualGood, visualWarn) {
  if (absCents <= visualGood) return 'bg-emerald-400';
  if (absCents <= visualWarn) return 'bg-amber-400';
  return 'bg-red-400';
}

export default function CentsNeedle({ cents, visualGood = 5, visualWarn = 15, max = CAP }) {
  const hasValue = cents != null;
  const clamped = hasValue ? Math.max(-max, Math.min(max, cents)) : 0;
  const pct = ((clamped + max) / (max * 2)) * 100;
  const absCents = hasValue ? Math.abs(cents) : null;

  const gP = (visualGood / max) * 50;
  const wP = (visualWarn / max) * 50;
  const gradient = `linear-gradient(to right,
    rgba(248,151,154,0.45) 0% ${50 - wP}%,
    rgba(252,211,77,0.4)   ${50 - wP}% ${50 - gP}%,
    rgba(134,239,172,0.55) ${50 - gP}% ${50 + gP}%,
    rgba(252,211,77,0.4)   ${50 + gP}% ${50 + wP}%,
    rgba(248,151,154,0.45) ${50 + wP}% 100%)`;

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-[10px] text-zinc-400 px-0.5">
        {TICKS.map(t => (
          <span key={t} className={Math.abs(t) === 0 ? 'font-semibold text-zinc-500' : ''}>{t}</span>
        ))}
      </div>
      <div
        className="relative h-4 rounded-full border border-zinc-200 overflow-visible"
        style={{ background: gradient }}
      >
        {hasValue && (
          <div
            className={`absolute top-1/2 w-4 h-4 rounded-full -translate-x-1/2 -translate-y-1/2 shadow-md transition-[left] duration-100 ${colorForCents(absCents, visualGood, visualWarn)}`}
            style={{ left: `${pct}%` }}
          />
        )}
      </div>
      {hasValue && (
        <p className="text-center text-xs font-semibold text-zinc-500">
          {cents >= 0 ? '+' : ''}{cents.toFixed(1)} ¢
        </p>
      )}
    </div>
  );
}
