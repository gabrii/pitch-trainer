export default function HoldProgressBar({ progress, phase }) {
  const isSuccess = phase === 'success';
  const pct = isSuccess ? 100 : Math.round(progress * 100);
  const showLabel = progress > 0 || isSuccess;
  const label = isSuccess ? 'Nailed it!' : progress < 1 ? 'Hold it…' : 'Match!';
  return (
    <div className="relative h-3 rounded-full bg-zinc-100 border border-zinc-200 overflow-hidden">
      <div
        className="h-full rounded-full transition-[width] duration-75 bg-green-400"
        style={{ width: `${pct}%` }}
      />
      {showLabel && (
        <span className={`absolute inset-0 flex items-center justify-center text-[9px] font-bold ${isSuccess ? 'text-green-900' : 'text-green-800 mix-blend-multiply'}`}>
          {label}
        </span>
      )}
    </div>
  );
}
