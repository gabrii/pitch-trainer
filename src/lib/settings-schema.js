export const DEFAULT_GLOBAL = {
  notation:     'scientific',
  audioMode:    'piano',
  toneVolume:   0.9,
  noiseGateDb:  -40,
  inputGain:    1.0,
  autoStartMic: true,
};

export const DEFAULT_EXERCISE = {
  tuner: {},
  matchPitch: {
    lowerMidi: 40, upperMidi: 50,
    difficulty: 'hard',
    holdDurationS: 3, silenceTimeoutS: 2, toneDurationS: 1,
  },
  identifyNote: {
    lowerMidi: 48, upperMidi: 72,
    octaveAware: false,
    toneDurationS: 1,
    autoAdvanceMs: 800,
  },
};

export const DEFAULT_PROFILE = {
  global:    { ...DEFAULT_GLOBAL },
  exercises: JSON.parse(JSON.stringify(DEFAULT_EXERCISE)),
};

export const DIFFICULTY_PRESETS = {
  easy:   { centsGreen: 30, visualGood: 10, visualWarn: 30 },
  medium: { centsGreen: 22, visualGood: 8,  visualWarn: 22 },
  hard:   { centsGreen: 15, visualGood: 5,  visualWarn: 15 },
};

export const DIFFICULTY_LABELS = {
  easy:   'Easy',
  medium: 'Medium',
  hard:   'Hard',
};

export function deriveExercise(exerciseId, exerciseSettings) {
  const diff = DIFFICULTY_PRESETS[exerciseSettings?.difficulty] ?? DIFFICULTY_PRESETS.hard;
  const out = { ...diff };
  if (exerciseSettings?.holdDurationS   != null) out.holdDurationMs   = exerciseSettings.holdDurationS   * 1000;
  if (exerciseSettings?.silenceTimeoutS != null) out.silenceTimeoutMs = exerciseSettings.silenceTimeoutS * 1000;
  if (exerciseSettings?.toneDurationS   != null) out.toneDurationMs   = exerciseSettings.toneDurationS   * 1000;
  return out;
}

// Legacy: kept for any code that still calls derivedFromSettings during migration
export function derivedFromSettings(settings) {
  return deriveExercise('matchPitch', settings);
}
