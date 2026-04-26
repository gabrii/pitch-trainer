import { BASE_PHASE_STYLES } from '../../lib/phase-styles';

export default function PhasePill({ phase, stylesMap, hint }) {
  const styles = stylesMap ?? BASE_PHASE_STYLES;
  const ps = styles[phase] ?? null;

  if (!ps) {
    return (
      <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-zinc-50 border border-zinc-200 text-zinc-400 text-sm font-semibold">
        <span className="w-2 h-2 rounded-full bg-zinc-300" />
        Idle
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full ${ps.bg} border ${ps.border} ${ps.text} text-sm font-semibold`}>
      <span className={`w-2 h-2 rounded-full ${ps.dot} animate-pulse`} />
      {ps.label}
      {hint && <span className="font-normal ml-1">— {hint}</span>}
    </span>
  );
}
