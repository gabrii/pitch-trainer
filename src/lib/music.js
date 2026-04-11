import { NOTE_NAMES, SOLFEGE_NAMES } from './constants';

export function freqToMidi(freq) {
  return 69 + 12 * Math.log2(freq / 440);
}

export function midiToFreq(midi) {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

export function midiToNoteName(midi) {
  const rounded = Math.round(midi);
  const noteIndex = ((rounded % 12) + 12) % 12;
  return {
    note: NOTE_NAMES[noteIndex],
    solfege: SOLFEGE_NAMES[noteIndex],
    octave: Math.floor(rounded / 12) - 1,
    midi: rounded,
    noteIndex,
  };
}

export function midiToLabel(midi, notation = 'scientific') {
  if (midi == null) return '--';
  const { note, solfege, octave } = midiToNoteName(midi);
  const name = notation === 'solfege' ? solfege : note;
  return `${name}${octave}`;
}

export function midiToSingleLabel(midi, notation = 'scientific') {
  if (midi == null) return '--';
  const { note, solfege } = midiToNoteName(midi);
  return notation === 'solfege' ? solfege : note;
}

export function midiToDualLabel(midi) {
  if (midi == null) return { english: '--', solfege: '--' };
  const { note, solfege, octave } = midiToNoteName(midi);
  return {
    english: `${note}${octave}`,
    solfege: `${solfege}${octave}`,
  };
}

export function noteNameToMidi(noteName, octave) {
  const index = NOTE_NAMES.indexOf(noteName);
  if (index < 0) return null;
  return (octave + 1) * 12 + index;
}

export function centsOff(freq, targetFreq) {
  return 1200 * Math.log2(freq / targetFreq);
}

export function median(values) {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

export function rms(values) {
  let sum = 0;
  for (let i = 0; i < values.length; i++) sum += values[i] * values[i];
  return Math.sqrt(sum / values.length);
}

export function describeOffset(detectedFreq, targetFreq) {
  const totalCents = centsOff(detectedFreq, targetFreq);
  const absCents = Math.abs(totalCents);
  const semitones = totalCents / 100;
  const absSemitones = Math.abs(semitones);
  const direction = totalCents > 0 ? 'above' : 'below';

  let text = '';
  let level = 'far'; // close | medium | far

  if (absCents <= 5) {
    text = 'Perfect!';
    level = 'close';
  } else if (absCents <= 15) {
    text = `Almost! ${totalCents > 0 ? '+' : ''}${totalCents.toFixed(0)} cents`;
    level = 'close';
  } else if (absCents <= 50) {
    text = `Close — ${totalCents > 0 ? '+' : ''}${totalCents.toFixed(0)} cents ${direction}`;
    level = 'medium';
  } else if (absSemitones < 2) {
    text = `${absCents.toFixed(0)} cents ${direction}`;
    level = 'medium';
  } else if (absSemitones < 12) {
    const whole = Math.round(absSemitones);
    text = `${whole} semitone${whole !== 1 ? 's' : ''} ${direction}`;
    level = 'far';
  } else {
    const octaves = Math.floor(absSemitones / 12);
    const rem = Math.round(absSemitones % 12);
    if (rem === 0) {
      text = `${octaves} octave${octaves !== 1 ? 's' : ''} ${direction}`;
    } else {
      text = `${octaves} oct + ${rem} semi ${direction}`;
    }
    level = 'far';
  }

  return { text, level, totalCents };
}
