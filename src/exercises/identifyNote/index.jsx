import { Ear } from 'lucide-react';
import IdentifyNoteComponent from './IdentifyNoteComponent';
import IdentifyNoteSettings from './IdentifyNoteSettings';

export const mermaid = `stateDiagram-v2
  [*] --> idle
  idle                 --> playing_target:        start
  playing_target       --> awaiting_input:        TONE_ENDED
  awaiting_input       --> correct_revealed:      PICK == target
  awaiting_input       --> playing_user_pick:     PICK != target
  awaiting_input       --> playing_target:        REPLAY (user)
  playing_user_pick    --> playing_target_again:  TONE_ENDED
  playing_target_again --> awaiting_input:        TONE_ENDED
  correct_revealed     --> playing_target:        autoAdvance
  awaiting_input       --> [*]:                   STOP`;

export default {
  id: 'identifyNote',
  slug: 'identify-note',
  name: 'Identify Note',
  shortDesc: 'Hear it, click it.',
  longDesc: 'A random note plays. Click the matching key. Wrong picks replay your guess and the target so you can compare.',
  icon: Ear,
  accent: 'amber',
  needsMic: false,
  needsTone: true,
  stateMachineMermaid: mermaid,
  Component: IdentifyNoteComponent,
  SettingsPanel: IdentifyNoteSettings,
};
