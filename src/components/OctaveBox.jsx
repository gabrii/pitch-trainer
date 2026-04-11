import { useMemo } from 'react';
import { IS_BLACK_KEY, NOTE_NAMES, SOLFEGE_NAMES } from '../lib/constants';
import PianoKey from './PianoKey';

export default function OctaveBox({ octave, targetMidi, detectedMidi, harmonics = [], lowerMidi, upperMidi, onKeyClick, notation = 'scientific' }) {
  const baseMidi = (octave + 1) * 12;
  const isTargetOctave = targetMidi != null && Math.floor(targetMidi / 12) - 1 === octave;
  const isDetectedOctave = detectedMidi != null && Math.floor(detectedMidi / 12) - 1 === octave;

  // Build a map of midi → intensity for this octave's keys
  const harmonicMap = useMemo(() => {
    const map = new Map();
    for (const h of harmonics) {
      if (h.midi >= baseMidi && h.midi < baseMidi + 12) {
        map.set(h.midi, h.intensity);
      }
    }
    return map;
  }, [harmonics, baseMidi]);

  let borderColor = 'border-slate-200';
  if (isTargetOctave && isDetectedOctave) borderColor = 'border-green-300';
  else if (isTargetOctave) borderColor = 'border-cyan-300';
  else if (isDetectedOctave) borderColor = 'border-yellow-300';

  return (
    <div className="flex flex-col items-center">
      <div className={`flex items-start border ${borderColor} rounded-lg p-1 bg-slate-100 transition-colors duration-150`}>
        {NOTE_NAMES.map((name, i) => {
          const midi = baseMidi + i;
          const label = notation === 'solfege' ? SOLFEGE_NAMES[i] : name;
          const inRange = lowerMidi != null && upperMidi != null ? midi >= lowerMidi && midi <= upperMidi : true;
          return (
            <PianoKey
              key={midi}
              isBlack={IS_BLACK_KEY[i]}
              isTarget={targetMidi === midi}
              isDetected={detectedMidi === midi}
              harmonicIntensity={harmonicMap.get(midi) ?? 0}
              inRange={inRange}
              label={label}
              onClick={() => onKeyClick?.(midi)}
            />
          );
        })}
      </div>
      <span className="text-xs text-slate-400 mt-1 font-semibold">
        {octave}
      </span>
    </div>
  );
}
