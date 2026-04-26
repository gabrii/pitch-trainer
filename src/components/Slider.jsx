import { LabelWithTip } from './Tooltip';

export default function Slider({ label, tip, value, onChange, min, max, step, format }) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className="flex items-center gap-3">
      <LabelWithTip tip={tip}>{label}</LabelWithTip>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(+e.target.value)}
        className="flex-1"
        style={{ background: `linear-gradient(to right, #8b5cf6 ${pct}%, #e4e4e7 ${pct}%)` }}
      />
      <span className="text-xs text-zinc-400 w-10 text-right">{format(value)}</span>
    </div>
  );
}
