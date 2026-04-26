import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import Slider from '../../components/Slider';
import { LabelWithTip } from '../../components/Tooltip';
import RangeSelector from '../common/RangeSelector.jsx';

export default function IdentifyNoteSettings({ runtime }) {
  const { exercise: settings, setExercise } = runtime.settings;
  const notation = runtime.settings.global.notation;
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-5 py-3 text-sm font-semibold text-zinc-600 hover:bg-zinc-50 rounded-2xl transition-colors"
      >
        Exercise settings
        <ChevronDown size={15} className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="px-5 pb-4 space-y-4 border-t border-zinc-100 pt-3">
          <RangeSelector
            lowerMidi={settings.lowerMidi}
            upperMidi={settings.upperMidi}
            onLowerChange={v => setExercise('lowerMidi', v)}
            onUpperChange={v => setExercise('upperMidi', v)}
            notation={notation}
          />
          <div className="flex items-center gap-3">
            <LabelWithTip tip="When off, only the pitch class matters (any octave). When on, you must click the exact octave.">
              Octave-aware
            </LabelWithTip>
            <button
              onClick={() => setExercise('octaveAware', !settings.octaveAware)}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${settings.octaveAware ? 'bg-violet-500' : 'bg-zinc-300'}`}
            >
              <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${settings.octaveAware ? 'translate-x-4' : 'translate-x-1'}`} />
            </button>
            <span className="text-xs text-zinc-400">{settings.octaveAware ? 'Exact octave required' : 'Any octave'}</span>
          </div>
          <Slider label="Tone" tip="How long the target note plays."
            value={settings.toneDurationS} onChange={v => setExercise('toneDurationS', v)}
            min={0.5} max={4} step={0.25} format={v => `${v}s`} />
        </div>
      )}
    </div>
  );
}
