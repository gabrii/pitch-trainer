import { LabelWithTip } from './Tooltip';

export default function ToggleGroup({ label, tip, value, onChange, options }) {
  return (
    <div className="flex items-center gap-3">
      {label && <LabelWithTip tip={tip}>{label}</LabelWithTip>}
      <div className="flex rounded-lg border border-zinc-200 overflow-hidden text-sm font-semibold">
        {options.map(([key, text]) => (
          <button
            key={key}
            onClick={() => onChange(key)}
            className={`px-2.5 py-1.5 transition-colors ${value === key ? 'bg-violet-500 text-white' : 'bg-white text-zinc-500 hover:bg-zinc-50'}`}
          >{text}</button>
        ))}
      </div>
    </div>
  );
}
