export const BASE_PHASE_STYLES = {
  idle: null,
  playing_tone:    { label: 'Playing target tone…',       bg: 'bg-cyan-50',   border: 'border-cyan-200',   text: 'text-cyan-700',   dot: 'bg-cyan-400' },
  listening:       { label: 'Listening — sing!',          bg: 'bg-blue-50',   border: 'border-blue-200',   text: 'text-blue-700',   dot: 'bg-blue-400' },
  success:         { label: 'Nailed it!',                 bg: 'bg-green-50',  border: 'border-green-200',  text: 'text-green-700',  dot: 'bg-green-400' },
  silence:         { label: 'Silence detected…',         bg: 'bg-zinc-50',   border: 'border-zinc-200',   text: 'text-zinc-600',   dot: 'bg-zinc-400' },
  replaying_user:  { label: 'Playing your note…',         bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-700', dot: 'bg-yellow-400' },
  replaying_target:{ label: 'Playing target note…',      bg: 'bg-cyan-50',   border: 'border-cyan-200',   text: 'text-cyan-700',   dot: 'bg-cyan-400' },
  // Tuner
  tuning:          { label: 'Listening…',                 bg: 'bg-cyan-50',   border: 'border-cyan-200',   text: 'text-cyan-700',   dot: 'bg-cyan-400' },
  // Identify Note
  awaiting_input:       { label: 'Your turn — click the key!', bg: 'bg-violet-50', border: 'border-violet-200', text: 'text-violet-700', dot: 'bg-violet-400' },
  playing_user_pick:    { label: 'Playing your pick…',         bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-700', dot: 'bg-yellow-400' },
  playing_target_again: { label: 'Playing target note…',       bg: 'bg-cyan-50',   border: 'border-cyan-200',   text: 'text-cyan-700',   dot: 'bg-cyan-400' },
  correct_revealed:     { label: 'Correct!',                    bg: 'bg-green-50',  border: 'border-green-200',  text: 'text-green-700',  dot: 'bg-green-400' },
};
