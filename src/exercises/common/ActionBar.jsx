// buttons: [{ key, icon, label, onClick, disabled, variant }]
// variant: 'primary' | 'secondary' | 'warning' | 'danger' — maps to pill colors
import { Tooltip } from '../../components/Tooltip';

const VARIANT_CLS = {
  primary:   'bg-violet-500 text-white',
  secondary: 'bg-zinc-100 border border-zinc-200 text-zinc-700 hover:bg-zinc-200',
  warning:   'bg-amber-100 border border-amber-200 text-amber-700 hover:bg-amber-200',
  danger:    'bg-rose-100 border border-rose-200 text-rose-700 hover:bg-rose-200',
};

export default function ActionBar({ buttons }) {
  return (
    <div className="flex items-center justify-center gap-2 min-h-[36px] flex-wrap">
      {buttons.map(({ key, icon: Icon, label, onClick, disabled, variant = 'secondary', tooltip }) => {
        const btn = (
          <button
            key={key}
            onClick={onClick}
            disabled={disabled}
            className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full font-semibold text-sm transition-colors disabled:opacity-40 disabled:cursor-default ${VARIANT_CLS[variant]}`}
          >
            {Icon && <Icon size={14} />}
            {label}
          </button>
        );
        return tooltip
          ? <Tooltip key={key} content={tooltip}>{btn}</Tooltip>
          : <span key={key}>{btn}</span>;
      })}
    </div>
  );
}
