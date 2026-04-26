import { useMemo } from 'react';
import { usePitchDetectorState } from '../../services/PitchDetectorProvider';
import { midiToFreq, centsOff } from '../../lib/music';
import { PIANO_MIN_OCTAVE, PIANO_MAX_OCTAVE } from '../../lib/constants';
import Piano from '../../components/Piano';
import AccuracyChart from '../../components/AccuracyChart';
import CentsNeedle from '../../components/CentsNeedle';
import NoteDisplay from '../../components/NoteDisplay';

const VISUAL_GOOD = 10;
const VISUAL_WARN = 30;

const PIANO_MIN_MIDI = (PIANO_MIN_OCTAVE + 1) * 12;
const PIANO_MAX_MIDI = (PIANO_MAX_OCTAVE + 1) * 12 + 11;

export default function TunerComponent({ runtime }) {
  const { state } = usePitchDetectorState();
  const notation = runtime.settings.global.notation;

  const cents = useMemo(() => {
    if (state.midi == null || state.frequency == null) return null;
    return centsOff(state.frequency, midiToFreq(state.midi));
  }, [state.midi, state.frequency]);

  const hasDetection = state.midi != null && state.status === 'listening';

  const bandCls = useMemo(() => {
    if (!hasDetection || cents == null) return 'text-zinc-300';
    const abs = Math.abs(cents);
    if (abs <= VISUAL_GOOD) return 'text-emerald-500';
    if (abs <= VISUAL_WARN) return 'text-amber-500';
    return 'text-red-500';
  }, [hasDetection, cents]);

  return (
    <div className="space-y-5">
      {/* Big note display */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-8 text-center shadow-sm space-y-2">
        {hasDetection ? (
          <>
            <div className="text-8xl font-extrabold tracking-tight leading-none">
              <NoteDisplay midi={state.midi} notation={notation} size="large" />
            </div>
            <div className={`text-3xl font-bold ${bandCls}`}>
              {cents != null ? `${cents >= 0 ? '+' : ''}${cents.toFixed(1)} ¢` : ''}
            </div>
            <div className="text-sm text-zinc-400">
              {state.frequency?.toFixed(2)} Hz · {Math.round((state.confidence ?? 0) * 100)}% confidence
            </div>
          </>
        ) : (
          <>
            <div className="text-8xl font-extrabold text-zinc-200 leading-none">--</div>
            <div className="text-zinc-400 text-sm mt-2">
              {state.status === 'off' || state.status === 'starting'
                ? 'Turn on the mic to start tuning'
                : state.status === 'low_signal'
                ? 'Sing louder or move closer'
                : 'Sing or play a note…'}
            </div>
          </>
        )}
      </div>

      {/* Horizontal cents needle */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
        <CentsNeedle cents={hasDetection ? cents : null} visualGood={VISUAL_GOOD} visualWarn={VISUAL_WARN} />
      </div>

      {/* Piano — passive display */}
      <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
        <div className="min-w-fit flex justify-center">
          <Piano
            mode="passive"
            detectedMidi={state.midi}
            harmonics={state.harmonics}
            lowerMidi={PIANO_MIN_MIDI}
            upperMidi={PIANO_MAX_MIDI}
            notation={notation}
          />
        </div>
      </div>

      {/* History chart */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm space-y-2">
        <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">Cents off nearest semitone</p>
        <AccuracyChart
          cents={cents ?? 0}
          hasDetection={hasDetection}
          visualGood={VISUAL_GOOD}
          visualWarn={VISUAL_WARN}
          height={120}
        />
      </div>
    </div>
  );
}
