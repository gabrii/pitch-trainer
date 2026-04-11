---
name: UI Polish & Color Coding
status: DOING
description: Ten UI improvements — disabled key styling, notation toggle, unified color scheme, vertical meter, color-coded messages, layout shift fixes, harmonic filtering, and audio settings reorganization.
---

# UI Polish & Color Coding

## Context
The pitch matching trainer works functionally but needs visual polish: clearer color semantics, better keyboard affordances, layout stability, and reorganized controls. These are 10 independent-ish UI changes grouped into one plan.

## Approach
4 phases ordered by dependency. Phase 1 lays data-flow foundations (notation state, color scheme). Phase 2 targets the piano rendering pipeline. Phase 3 tackles layout/display changes. Phase 4 is an independent algorithm tweak.

## Files to modify
- `src/App.jsx` — notation state, color scheme, messages, progress bar, audio settings layout, layout shift
- `src/components/PianoKey.jsx` — disabled styling, note labels, color scheme
- `src/components/OctaveBox.jsx` — pass range/notation props, color scheme
- `src/components/Piano.jsx` — overflow, pass props through
- `src/components/FeedbackPanel.jsx` — vertical meter, remove level meter, layout shift
- `src/components/NoteDisplay.jsx` — notation-aware display
- `src/components/TargetSelector.jsx` — notation-aware dropdowns
- `src/lib/music.js` — notation-aware label helpers
- `src/lib/pitch-detection.js` — harmonic quality filtering
- `src/lib/constants.js` — optional harmonic dropoff constant

## Tasks

### Phase 1: Foundational State & Data Flow

- [ ] **Change 3 — Notation toggle**: Add `notation` state (`'scientific'`|`'solfege'`) to App.jsx. Add toggle in settings. Add `midiToSingleLabel(midi, notation)` to music.js. Update NoteDisplay, TargetSelector, FeedbackPanel to accept and use `notation` prop. Show only the selected notation.
- [ ] **Change 5 — Color scheme**: Swap colors throughout: target=cyan (was emerald), detected=yellow (was amber), match=green (was cyan). Update PianoKey.jsx `colorClass()`, OctaveBox.jsx border colors, App.jsx progress bar colors.

### Phase 2: Piano Component Changes

- [ ] **Change 1 — Disabled keys outside range**: Thread `lowerMidi`/`upperMidi` through Piano→OctaveBox→PianoKey. Keys outside range get `border-dashed`; black keys also get `opacity-40`. Keep clickable (expands range).
- [ ] **Change 2 — Overflow visible**: Piano.jsx — change `overflow-x-auto` to `overflow-visible`. One-line fix.
- [ ] **Change 4 — Note labels on keys**: Pass `notation` and compute label per key in OctaveBox. Render label inside PianoKey at bottom-center. White keys → dark text. Black keys → light text. Active black key with light bg → dark text. Use `text-[9px]` to fit narrow keys; truncate solfege on black keys if needed.

### Phase 3: Layout & Display Changes

- [ ] **Change 6 — Vertical accuracy indicator**: Restructure FeedbackPanel tuning meter from horizontal to vertical (`w-5 h-40`). Flip gradient to `linear-gradient(0deg, ...)` (flat=bottom, sharp=top). Move needle to vertical positioning (`bottom: X%`). Keep center line, LED row, cents display.
- [ ] **Change 7 — Color-coded messages**: Create `phaseConfig` map with per-phase bg/border/text/dot colors: replaying_user=yellow, replaying_target=cyan, success=green. Merge hint text into the same pill bubble. Remove separate hint `<p>`.
- [ ] **Change 8 — Layout shift prevention**: Always render phase indicator area with `min-h-[40px]`. Always render progress bar container (use `visibility: hidden` when inactive). Add `min-h` to feedback panel offset div and note display area. Always show message bubble.
- [ ] **Change 10 — Audio settings reorganization**: Split into Input (level meter, noise gate, mic gain) and Output (tone volume) sections. Move level meter from FeedbackPanel to App.jsx audio settings. Level bar = gray when below noise gate threshold, green when above. Compute gate threshold as percentage: `((noiseGateDb - meterFloorDb) / (meterCeilDb - meterFloorDb)) * 100`.

### Phase 4: Algorithm

- [ ] **Change 9 — Harmonic filtering**: In `extractFftPeaks()`, after sorting by strength, filter to keep only peaks within `dropoffDb` (e.g. 15 dB) of the best peak's dB, then cap at maxPeaks. Add `harmonicPeakDropoffDb` to SETTINGS.

## Risks & Notes
- **Tailwind v4 dynamic classes**: All color classes must appear as full literal strings (no interpolation). The `phaseConfig` object approach satisfies this.
- **Black key width**: Only `w-6` (24px). Solfege names like "Sol#" may overflow — use `text-[8px]`/`text-[9px]` with overflow-hidden.
- **Vertical meter height**: `h-40` (160px) or `h-48` (192px) — needs visual testing.
- **Layout shift min-h values**: Need measuring in browser; may require fine-tuning.
- **Level meter relocation**: `inputLevel` is already accessible in App.jsx via `detector.state.inputLevel`.

## Verification
- Run the app (`npm run dev`) and visually verify each change
- Test with mic active: confirm color coding (yellow=your note, cyan=target, green=match) on piano keys, octave borders, and messages
- Test notation toggle switches all note displays between Scientific and Solfege
- Test disabled keys appear dashed/faded outside selected range
- Resize window to confirm no layout shifts when elements appear/disappear
- Test harmonic filtering: fewer purple keys should light up, only strong harmonics remain
- Test audio settings: level meter gray below gate, green above; controls grouped logically
