import { useMemo } from 'react';
import { PIANO_MIN_OCTAVE, PIANO_MAX_OCTAVE } from '../lib/constants';
import OctaveBox from './OctaveBox';

/**
 * mode:
 *  'passive'    – no clicks; highlights detectedMidi only (Tuner)
 *  'rangePicker'– click extends range or starts round (Match Pitch) [default]
 *  'answer'     – click fires onKeyClick as submitPick (Identify Note)
 *
 * highlight(midi) → 'green'|'red'|'cyan'|'rose-light'|null — optional per-key override
 */
export default function Piano({ mode = 'rangePicker', targetMidi, detectedMidi, harmonics = [], lowerMidi, upperMidi, onKeyClick, notation = 'scientific', highlight }) {
  const octaves = useMemo(() => {
    const lowOctave  = Math.max(PIANO_MIN_OCTAVE, Math.floor(lowerMidi / 12) - 1 - 1);
    const highOctave = Math.min(PIANO_MAX_OCTAVE, Math.floor(upperMidi / 12) - 1 + 1);
    const result = [];
    for (let o = lowOctave; o <= highOctave; o++) result.push(o);
    return result;
  }, [lowerMidi, upperMidi]);

  const handleKeyClick = mode === 'passive' ? null : onKeyClick;

  return (
    <div className="flex flex-col items-center sm:flex-row gap-2 py-2 px-1 sm:justify-center">
      {octaves.map(o => (
        <OctaveBox
          key={o}
          octave={o}
          targetMidi={targetMidi}
          detectedMidi={detectedMidi}
          harmonics={harmonics}
          lowerMidi={lowerMidi}
          upperMidi={upperMidi}
          onKeyClick={handleKeyClick}
          notation={notation}
          highlight={highlight}
        />
      ))}
    </div>
  );
}
