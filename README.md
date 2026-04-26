# Pitch Trainer

**[Try it live →](https://gabrii.github.io/pitch-trainer/)**

A browser-based ear-training playground with three exercises:

- **Tuner** — Real-time pitch readout showing how far you are from the nearest semitone. Useful for instrumentalists as well as singers.
- **Match Pitch** — A reference tone plays; sing it back and hold the pitch until the green bar fills.
- **Identify Note** — A note plays; click the matching key on the piano. Wrong picks replay your guess then the target so you can compare.

## Quick start

```bash
npm install
npm run dev
```

Opens at http://localhost:5173/. Requires HTTPS or localhost for microphone access.

## All scripts

```bash
npm run dev          # dev server with hot reload
npm run build        # production build → dist/
npm run preview      # serve dist/ locally
npm run ladle        # component gallery (Ladle)
npm run ladle:build  # build the Ladle gallery
npm run docs         # regenerate docs/state-machines.md
npm run deploy       # deploy dist/ to GitHub Pages
```

## Stack

- **React 19** + **Vite 8**
- **Tailwind CSS v4** (`@tailwindcss/vite` — no config file)
- **react-router-dom v7** with `HashRouter` (GitHub Pages compatible)
- **lucide-react** for icons
- **Ladle** for component stories
- **Web Audio API** for mic input and tone playback

## Architecture

The app is a multi-exercise playground. Adding a 4th exercise = one new folder under `src/exercises/` + one line in `src/exercises/registry.js`.

```
src/
  App.jsx                      # routing shell: <Layout> + <Routes> from registry
  main.jsx                     # provider stack + HashRouter

  layouts/
    Layout.jsx                 # sidebar + mobile drawer + <Outlet>
    Sidebar.jsx                # brand, nav, global settings, mic toggle
    MobileTopBar.jsx           # burger menu (< lg breakpoint)
    ExerciseShell.jsx          # consistent header + settings + body frame

  services/                    # singleton providers (survive route changes)
    AudioContextProvider.jsx
    TonePlayerProvider.jsx     # bridges global settings → setAudioMode/setVolume
    PitchDetectorProvider.jsx  # split into control + state contexts (perf)

  contexts/
    SettingsContext.jsx        # localStorage persistence, profile CRUD
    settingsHooks.js           # useGlobalSettings, useExerciseSettings, useSettings

  exercises/
    registry.js                # EXERCISES array — imports all descriptors
    types.js                   # JSDoc: ExerciseDescriptor, ExerciseRuntime
    common/
      PhasePill.jsx            # colored status pill
      ActionBar.jsx            # Play/Next/Stop/Replay/Skip buttons
      RangeSelector.jsx        # note range dropdowns
    tuner/                     # Tuner exercise
    matchPitch/                # Match Pitch exercise
    identifyNote/              # Identify Note exercise

  components/                  # shared / primitive UI
    Piano.jsx                  # mode='passive'|'rangePicker'|'answer' + highlight()
    AccuracyChart.jsx          # context-free canvas chart (cents + thresholds as props)
    CentsNeedle.jsx            # horizontal needle gauge
    ...

  lib/
    random.js                  # pickRandomMidi(lo, hi, exclude)
    asyncFlow.js               # sleep(ms)
    phase-styles.js            # BASE_PHASE_STYLES map
    settings-schema.js         # DEFAULT_GLOBAL, DEFAULT_EXERCISE, deriveExercise
    ...
```

## Exercise state machines

Diagrams are in [`docs/state-machines.md`](docs/state-machines.md) (regenerated with `npm run docs`).

## Settings & profiles

Settings are split into **global** (notation, audio mode, volume, mic gain, noise gate) — always visible in the sidebar — and **per-exercise** (range, difficulty, hold/silence/tone durations) — shown above each exercise.

All settings persist in localStorage (`pitch-trainer-profiles`) with named profile support. V1 profiles are automatically migrated to the v2 shape on load.

## Audio pipeline

1. **Microphone** → MediaStreamSource → Gain → highpass 50 Hz → lowpass 2400 Hz → AnalyserNode (FFT 8192).
2. **Pitch detection**: YIN (time-domain) + HPS (frequency-domain) fused per frame. Octave-safe, display-hysteresis smoothed.
3. **Tone playback**: OscillatorNode (sine) or decoded piano sample, with fade-in/out envelopes. Success chime = three microtonal chord notes.

## Component gallery

```bash
npm run ladle
```

Opens a Ladle gallery at `http://localhost:61000/` with stories for Piano, AccuracyChart, CentsNeedle, PhasePill, Slider, PianoKey, NoteDisplay, and more. Co-located `*.stories.jsx` files next to each component.

## Requirements

- Modern browser with Web Audio API
- HTTPS or localhost (required for microphone)
- A microphone (Tuner and Match Pitch only)
