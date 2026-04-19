import { NOTE_NAMES, SOLFEGE_NAMES, PIANO_MIN_OCTAVE, PIANO_MAX_OCTAVE } from '../lib/constants';
import { noteNameToMidi, midiToFreq, midiToNoteName } from '../lib/music';
import { Tooltip, TipIcon } from './Tooltip';

const octaves = [];
for (let o = PIANO_MIN_OCTAVE; o <= PIANO_MAX_OCTAVE; o++) octaves.push(o);

export default function TargetSelector({ lowerMidi, upperMidi, onLowerChange, onUpperChange, notation = 'scientific' }) {
  const lower = midiToNoteName(lowerMidi);
  const upper = midiToNoteName(upperMidi);
  const lowerFreq = midiToFreq(lowerMidi);
  const upperFreq = midiToFreq(upperMidi);
  const isSingle = lowerMidi === upperMidi;

  function handleNoteChange(which, noteName) {
    const current = which === 'lower' ? lower : upper;
    const midi = noteNameToMidi(noteName, current.octave);
    if (which === 'lower') {
      onLowerChange(midi);
      if (midi > upperMidi) onUpperChange(midi);
    } else {
      onUpperChange(Math.max(midi, lowerMidi));
    }
  }

  function handleOctaveChange(which, octave) {
    const current = which === 'lower' ? lower : upper;
    const midi = noteNameToMidi(current.note, octave);
    if (which === 'lower') {
      onLowerChange(midi);
      if (midi > upperMidi) onUpperChange(midi);
    } else {
      onUpperChange(Math.max(midi, lowerMidi));
    }
  }

  const firstSelect = 'appearance-none border border-zinc-200 rounded-l-lg px-1.5 py-1.5 font-semibold bg-white text-sm cursor-pointer border-r-0 text-center';
  const lastSelect = 'appearance-none border border-zinc-200 rounded-r-lg px-1.5 py-1.5 font-semibold bg-white text-sm cursor-pointer w-9 text-center';

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3 flex-wrap">
        <Tooltip content="Lowest note that can appear in exercises. You can also click a piano key to set the range.">
          <span className="text-sm text-zinc-500 w-10 flex items-center gap-1 cursor-default select-none">
            From
            <TipIcon />
          </span>
        </Tooltip>
        <div className="inline-flex">
          <select className={firstSelect} value={lower.note} onChange={e => handleNoteChange('lower', e.target.value)}>
            {NOTE_NAMES.map((n, i) => <option key={n} value={n}>{notation === 'solfege' ? SOLFEGE_NAMES[i] : n}</option>)}
          </select>
          <select className={lastSelect} value={lower.octave} onChange={e => handleOctaveChange('lower', +e.target.value)}>
            {octaves.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>
        <span className="text-xs text-zinc-400">{lowerFreq.toFixed(1)} Hz</span>

        <Tooltip content="Highest note that can appear in exercises. Set From and To to the same note for single-note practice.">
          <span className="text-sm text-zinc-500 w-6 text-center flex items-center gap-1 cursor-default select-none">
            to
            <TipIcon />
          </span>
        </Tooltip>
        <div className="inline-flex">
          <select className={firstSelect} value={upper.note} onChange={e => handleNoteChange('upper', e.target.value)}>
            {NOTE_NAMES.map((n, i) => <option key={n} value={n}>{notation === 'solfege' ? SOLFEGE_NAMES[i] : n}</option>)}
          </select>
          <select className={lastSelect} value={upper.octave} onChange={e => handleOctaveChange('upper', +e.target.value)}>
            {octaves.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>
        <span className="text-xs text-zinc-400">{upperFreq.toFixed(1)} Hz</span>
      </div>

      {isSingle && (
        <p className="text-xs text-zinc-400">Single note mode — change "To" to define a range.</p>
      )}
    </div>
  );
}
