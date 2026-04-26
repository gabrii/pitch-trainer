export default function SidebarToggleGroup({ label, value, onChange, options }) {
  return (
    <div className="space-y-1">
      <span className="text-xs font-medium text-zinc-500">{label}</span>
      <div className="flex rounded-lg border border-zinc-200 overflow-hidden text-xs font-semibold">
        {options.map(([key, text]) => (
          <button
            key={key}
            onClick={() => onChange(key)}
            className={`flex-1 px-2 py-1.5 transition-colors ${value === key ? 'bg-violet-500 text-white' : 'bg-white text-zinc-500 hover:bg-zinc-50'}`}
          >{text}</button>
        ))}
      </div>
    </div>
  );
}
