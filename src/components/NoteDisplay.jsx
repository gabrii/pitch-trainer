import { midiToLabel } from '../lib/music';

export default function NoteDisplay({ midi, size = 'normal', notation = 'scientific' }) {
  const label = midiToLabel(midi, notation);

  if (size === 'large') {
    return (
      <span className="text-6xl font-extrabold tracking-tight">{label}</span>
    );
  }

  return (
    <span className="font-bold">{label}</span>
  );
}
