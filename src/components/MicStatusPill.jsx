import { Mic, MicOff } from 'lucide-react';
import { Tooltip } from './Tooltip';

export default function MicStatusPill({ active, onStart, onStop }) {
  const border = active ? 'border-emerald-200' : 'border-rose-200';
  const labelCls = active ? 'text-emerald-600' : 'text-rose-500';
  const onBtnCls = active ? 'bg-emerald-500 text-white cursor-default' : 'bg-white text-zinc-500 hover:bg-zinc-50';
  const offBtnCls = !active ? 'bg-rose-500 text-white cursor-default' : 'bg-white text-zinc-500 hover:bg-zinc-50';

  return (
    <div className={`inline-flex items-center rounded-full border overflow-hidden text-sm font-semibold ${border}`}>
      <Tooltip content={active ? 'Microphone is active and detecting pitch.' : 'Microphone is off.'}>
        <span className={`flex items-center gap-1.5 pl-3 pr-2 py-1.5 cursor-default ${labelCls}`}>
          {active ? <Mic size={13} /> : <MicOff size={13} />}
          Mic
        </span>
      </Tooltip>
      <button onClick={onStart} disabled={active} className={`px-2.5 py-1.5 transition-colors ${onBtnCls}`}>On</button>
      <button onClick={onStop} disabled={!active} className={`px-2.5 py-1.5 transition-colors ${offBtnCls}`}>Off</button>
    </div>
  );
}
