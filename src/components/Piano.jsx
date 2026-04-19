import { useMemo } from 'react';
import { PIANO_MIN_OCTAVE, PIANO_MAX_OCTAVE } from '../lib/constants';
import OctaveBox from './OctaveBox';

export default function Piano({ targetMidi, detectedMidi, harmonics = [], lowerMidi, upperMidi, onKeyClick, notation = 'scientific' }) {
  const octaves = useMemo(() => {
    // Show octaves within ±1 of the range bounds
    const lowOctave = Math.max(PIANO_MIN_OCTAVE, Math.floor(lowerMidi / 12) - 1 - 1);
    const highOctave = Math.min(PIANO_MAX_OCTAVE, Math.floor(upperMidi / 12) - 1 + 1);
    const result = [];
    for (let o = lowOctave; o <= highOctave; o++) result.push(o);
    return result;
  }, [lowerMidi, upperMidi]);

  return (
    <div className="flex flex-wrap gap-2 py-2 px-1 justify-center">
      {octaves.map(o => (
        <OctaveBox
          key={o}
          octave={o}
          targetMidi={targetMidi}
          detectedMidi={detectedMidi}
          harmonics={harmonics}
          lowerMidi={lowerMidi}
          upperMidi={upperMidi}
          onKeyClick={onKeyClick}
          notation={notation}
        />
      ))}
    </div>
  );
}
