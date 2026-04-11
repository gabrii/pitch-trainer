export const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export const SOLFEGE_NAMES = ['Do', 'Do#', 'Re', 'Re#', 'Mi', 'Fa', 'Fa#', 'Sol', 'Sol#', 'La', 'La#', 'Si'];

// Which keys in an octave are black (sharps/flats)
export const IS_BLACK_KEY = [false, true, false, true, false, false, true, false, true, false, true, false];

export const SETTINGS = {
  // FFT / audio
  fftSize: 8192,
  analysisGain: 1.0,
  voicedRmsThreshold: 0.004,

  // YIN tuning
  yinThreshold: 0.12,
  yinClarityThreshold: 0.58,

  // HPS tuning
  hpsConfidenceThreshold: 0.16,

  // Timing
  analysisInterval: 40,
  uiUpdateInterval: 100,

  // Frequency range (C2 – C7)
  displayMinFreq: 55,
  displayMaxFreq: 2200,
  detectionMinFreq: 55,
  detectionMaxFreq: 2200,

  // Display stability
  smoothingAlpha: 0.78,
  displayStickCents: 55,
  displaySwitchMs: 320,
  minDisplayHoldMs: 250,
  recentPitchWindow: 7,

  // Detector fusion
  octaveGuardCents: 38,
  minConfidence: 0.28,

  // Input meter (dB scale: maps -60dB..0dB to 0..100%)
  meterFloorDb: -60,
  meterCeilDb: -6,

  // Harmonic visualization
  harmonicPeakDropoffDb: 15, // only show peaks within this many dB of the strongest

  // Tone playback
  toneDurationMs: 1000,
  toneGain: 0.35,
  toneType: 'sine',

  // Exercise flow
  silenceTimeoutMs: 2000,
  successHoldMs: 3000,
};

// Piano display range
export const PIANO_MIN_OCTAVE = 2;
export const PIANO_MAX_OCTAVE = 6;
