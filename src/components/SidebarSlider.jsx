export default function SidebarSlider({ label, value, onChange, min, max, step, format }) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-zinc-500">{label}</span>
        <span className="text-xs text-zinc-400">{format(value)}</span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(+e.target.value)}
        className="w-full"
        style={{ background: `linear-gradient(to right, #8b5cf6 ${pct}%, #e4e4e7 ${pct}%)` }}
      />
    </div>
  );
}
