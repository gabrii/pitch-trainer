import { Mic2 } from 'lucide-react';
import MatchPitchComponent from './MatchPitchComponent';
import MatchPitchSettings from './MatchPitchSettings';

export const mermaid = `stateDiagram-v2
  [*] --> idle
  idle             --> playing_tone:     start(target)
  playing_tone     --> listening:        TONE_ENDED
  listening        --> success:          hold_progress >= 1
  listening        --> silence:          silence_timeout
  silence          --> replaying_user:   user_note != target && user_note != null
  silence          --> replaying_target: user_note == target || user_note == null
  replaying_user   --> replaying_target: TONE_ENDED
  replaying_target --> listening:        TONE_ENDED
  success          --> playing_tone:     auto-advance`;

export default {
  id: 'matchPitch',
  slug: 'match-pitch',
  name: 'Match Pitch',
  shortDesc: 'Hear a note. Sing it. Hold it.',
  longDesc: 'Play a random note in your range, then match it with your voice and sustain it.',
  icon: Mic2,
  accent: 'violet',
  needsMic: true,
  needsTone: true,
  stateMachineMermaid: mermaid,
  Component: MatchPitchComponent,
  SettingsPanel: MatchPitchSettings,
};
