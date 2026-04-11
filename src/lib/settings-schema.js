export const DEFAULT_SETTINGS = {
  notation: 'scientific',
  lowerMidi: 40,  // E2
  upperMidi: 50,  // D3
  noiseGateDb: -35,
  inputGain: 1.0,
  toneVolume: 0.35,
  difficulty: 'hard',
  holdDurationS: 3,
  silenceTimeoutS: 2,
  toneDurationS: 1,
};

export const DIFFICULTY_PRESETS = {
  easy:   { centsGreen: 30, visualGood: 10, visualWarn: 30 },
  medium: { centsGreen: 22, visualGood: 8,  visualWarn: 22 },
  hard:   { centsGreen: 15, visualGood: 5,  visualWarn: 15 },
};

export const DIFFICULTY_LABELS = {
  easy:   'Easy (~10¢)',
  medium: 'Medium (~8¢)',
  hard:   'Hard (~5¢)',
};

export function derivedFromSettings(settings) {
  const diff = DIFFICULTY_PRESETS[settings.difficulty] || DIFFICULTY_PRESETS.hard;
  return {
    ...diff,
    holdDurationMs: settings.holdDurationS * 1000,
    silenceTimeoutMs: settings.silenceTimeoutS * 1000,
    toneDurationMs: settings.toneDurationS * 1000,
  };
}
