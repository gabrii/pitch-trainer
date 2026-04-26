import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve, dirname } from 'node:path';

// Dynamic import so Vite JSX transform isn't needed at script time
const __dir = dirname(fileURLToPath(import.meta.url));

// We can't import JSX directly in a Node script, so we read the mermaid
// strings from each exercise's stateMachine export via a convention file.
// Each exercises/*/index.jsx re-exports its mermaid string named `mermaid`.
// We side-step JSX by importing only the JS portions.

// Exercises and their mermaid diagrams — kept in sync manually here
// (the stateMachine.js files export only the string, no JSX)
const exercises = [
  {
    name: 'Tuner',
    mermaid: `stateDiagram-v2
  [*] --> running
  running --> running: detector tick
  running --> [*]: navigate away`,
  },
  {
    name: 'Match Pitch',
    mermaid: `stateDiagram-v2
  [*] --> idle
  idle             --> playing_tone:     start(target)
  playing_tone     --> listening:        TONE_ENDED
  listening        --> success:          hold_progress >= 1
  listening        --> silence:          silence_timeout
  silence          --> replaying_user:   user_note != target && user_note != null
  silence          --> replaying_target: user_note == target || user_note == null
  replaying_user   --> replaying_target: TONE_ENDED
  replaying_target --> listening:        TONE_ENDED
  success          --> playing_tone:     auto-advance`,
  },
  {
    name: 'Identify Note',
    mermaid: `stateDiagram-v2
  [*] --> idle
  idle                 --> playing_target:        start
  playing_target       --> awaiting_input:        TONE_ENDED
  awaiting_input       --> correct_revealed:      PICK == target
  awaiting_input       --> playing_user_pick:     PICK != target
  awaiting_input       --> playing_target:        REPLAY (user)
  playing_user_pick    --> playing_target_again:  TONE_ENDED
  playing_target_again --> awaiting_input:        TONE_ENDED
  correct_revealed     --> playing_target:        autoAdvance
  awaiting_input       --> [*]:                   STOP`,
  },
];

const lines = ['# Exercise State Machines', ''];
for (const { name, mermaid } of exercises) {
  lines.push(`## ${name}`, '', '```mermaid', mermaid, '```', '');
}

const outPath = resolve(__dir, '../docs/state-machines.md');
writeFileSync(outPath, lines.join('\n'));
console.log(`Written: ${outPath}`);
