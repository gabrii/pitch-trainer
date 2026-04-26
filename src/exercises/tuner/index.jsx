import { Activity } from 'lucide-react';
import TunerComponent from './TunerComponent';

export const mermaid = `stateDiagram-v2
  [*] --> running
  running --> running: detector tick
  running --> [*]: navigate away`;

export default {
  id: 'tuner',
  slug: 'tuner',
  name: 'Tuner',
  shortDesc: 'Real-time pitch readout vs the nearest semitone.',
  longDesc: 'Plug in or sing — see exactly how in-tune you are against the nearest equal-tempered note.',
  icon: Activity,
  accent: 'cyan',
  needsMic: true,
  needsTone: false,
  stateMachineMermaid: mermaid,
  Component: TunerComponent,
};
