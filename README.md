# Pitch Trainer

**[Try it live →](https://gabrii.github.io/pitch-trainer/)**

A browser-based pitch matching tool. Select a target note, play a reference tone, then sing and get real-time feedback on how close you are. Think SingStar, but as a training tool.

## Quick start

```bash
npm install
npm run dev
```

Opens at http://localhost:5173/. Requires HTTPS or localhost for microphone access.

## Build for production

```bash
npm run build    # outputs to dist/
npm run preview  # serve the production build locally
```

## Stack

- **React 19** + **Vite 8**
- **Tailwind CSS v4** (no config file, uses `@tailwindcss/vite` plugin)
- **lucide-react** for icons
- **Web Audio API** for microphone input and tone playback

## Project structure

```
src/
├── App.jsx                        Main layout, controls, exercise wiring
├── main.jsx                       React root + SettingsProvider
├── contexts/
│   └── SettingsContext.jsx         Profiles, localStorage persistence, useSettings hook
├── components/
│   ├── Piano.jsx                  Octave container layout
│   ├── OctaveBox.jsx              12 keys per octave + border coloring
│   ├── PianoKey.jsx               Individual key (colors, labels, disabled state)
│   ├── FeedbackPanel.jsx          Offset feedback, note display, tuning meter + chart
│   ├── AccuracyChart.jsx          Canvas time-series of pitch accuracy
│   ├── NoteDisplay.jsx            Large note name display
│   ├── TargetSelector.jsx         Note range selector (From/To)
│   ├── ProfileSelector.jsx        Profile CRUD (create, rename, delete)
│   └── Modal.jsx                  Reusable modal dialog
├── hooks/
│   ├── useExercise.js             Phase state machine, hold progress, auto-advance
│   ├── usePitchDetector.js        Mic input, YIN+HPS fusion, display hysteresis
│   ├── useTonePlayer.js           Oscillator playback with fade envelope
│   └── useAudioContext.js         Singleton AudioContext
└── lib/
    ├── constants.js               Algorithm tuning parameters (FFT, thresholds)
    ├── settings-schema.js         Profile defaults, difficulty presets, derived values
    ├── music.js                   Freq↔MIDI conversion, cents math, note labels
    └── pitch-detection.js         YIN, HPS, detector fusion, FFT peak extraction
```

## How it works

### User flow

1. Mic is requested automatically on load.
2. Select a note range (From/To) and difficulty.
3. Click **Play** — a reference tone plays, then the app listens.
4. Sing the note — the chart shows real-time accuracy, the piano highlights your note.
5. Hold the correct pitch long enough and the exercise advances to the next note.

### Audio pipeline

1. **Microphone input** via `getUserMedia` (echo cancellation, noise suppression, auto gain all disabled).
2. **Signal chain**: MediaStreamSource → GainNode → highpass (50 Hz) → lowpass (2400 Hz) → AnalyserNode (FFT 8192).
3. **Tone playback**: Separate OscillatorNode → GainNode → destination with fade-in/out envelope.

### Pitch detection

Two algorithms run each frame and are fused:

- **YIN** (time-domain autocorrelation): Center-clips the signal, computes cumulative mean normalized difference, uses parabolic interpolation.
- **Harmonic Product Spectrum** (frequency-domain): Scores FFT bins by fundamental + 2nd harmonic (0.85×) + 3rd harmonic (0.6×).

**Fusion**: Both agree → weighted blend. Octave-related → pick closest to previous. Disagree → highest confidence wins.

### Settings & profiles

All settings persist in localStorage with named profile support. Each profile stores: note range, notation (Scientific/Solfege), difficulty, noise gate, mic gain, tone volume, hold duration, silence timeout, and tone duration.

Difficulty presets scale the accuracy thresholds:
- **Easy** (~10¢ green zone)
- **Medium** (~8¢ green zone)
- **Hard** (~5¢ green zone)

### Color coding

| Color  | Meaning |
|--------|---------|
| Cyan   | Target note |
| Yellow | Your detected note (wrong) |
| Green  | Correct match |
| Purple | Harmonic overtones |

## Requirements

- Modern browser with Web Audio API
- HTTPS or localhost (required for microphone)
- A microphone
