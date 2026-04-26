import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { DIFFICULTY_LABELS, DIFFICULTY_PRESETS } from '../../lib/settings-schema';
import { SETTINGS } from '../../lib/constants';
import RangeSelector from '../common/RangeSelector.jsx';
import Slider from '../../components/Slider';
import ToggleGroup from '../../components/ToggleGroup';
import { LabelWithTip } from '../../components/Tooltip';

export default function MatchPitchSettings({ runtime }) {
  const { exercise: settings, setExercise } = runtime.settings;
  const [open, setOpen] = useState(false);
  const notation = runtime.settings.global.notation;

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
        <div className="px-5 pb-4 space-y-4 border-t border-zinc-100">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3">
            <RangeSelector
              lowerMidi={settings.lowerMidi}
              upperMidi={settings.upperMidi}
              onLowerChange={v => setExercise('lowerMidi', v)}
              onUpperChange={v => setExercise('upperMidi', v)}
              notation={notation}
            />
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <LabelWithTip tip="Controls how precisely you must match the pitch. Easy ±30¢ · Medium ±22¢ · Hard ±15¢">
                  Difficulty
                </LabelWithTip>
                <select
                  value={settings.difficulty}
                  onChange={e => setExercise('difficulty', e.target.value)}
                  className="appearance-none border border-zinc-200 rounded-lg px-2.5 py-1.5 font-semibold bg-white text-sm cursor-pointer"
                >
                  {Object.entries(DIFFICULTY_LABELS).map(([key, text]) => (
                    <option key={key} value={key}>{text}</option>
                  ))}
                </select>
                <span className="text-xs text-zinc-400">±{DIFFICULTY_PRESETS[settings.difficulty]?.visualGood} cents</span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Slider label="Silence" tip="After this much silence the app assumes you stopped and replays the target."
              value={settings.silenceTimeoutS} onChange={v => setExercise('silenceTimeoutS', v)}
              min={1} max={5} step={0.5} format={v => `${v}s`} />
            <Slider label="Tone" tip="How long the reference tone plays before the listening phase begins."
              value={settings.toneDurationS} onChange={v => setExercise('toneDurationS', v)}
              min={0.5} max={4} step={0.25} format={v => `${v}s`} />
            <Slider label="Hold" tip="How long you must sustain the correct pitch to pass."
              value={settings.holdDurationS} onChange={v => setExercise('holdDurationS', v)}
              min={1} max={6} step={0.5} format={v => `${v}s`} />
          </div>
        </div>
      )}
    </div>
  );
}
