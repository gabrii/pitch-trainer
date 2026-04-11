import { SETTINGS } from './constants';
import { rms, centsOff, freqToMidi } from './music';

// ── Helpers ──

function parabolicInterpolation(array, index) {
  const left = index > 0 ? array[index - 1] : array[index];
  const center = array[index];
  const right = index + 1 < array.length ? array[index + 1] : array[index];
  const denominator = 2 * (2 * center - left - right);
  if (denominator === 0) return index;
  return index + (right - left) / denominator;
}

function centerClipBuffer(buffer) {
  const size = buffer.length;
  let mean = 0;
  let peak = 0;
  for (let i = 0; i < size; i++) {
    mean += buffer[i];
    peak = Math.max(peak, Math.abs(buffer[i]));
  }
  mean /= size;
  const clipLevel = peak * 0.22;
  const clipped = new Float32Array(size);
  for (let i = 0; i < size; i++) {
    let v = buffer[i] - mean;
    if (Math.abs(v) < clipLevel) v = 0;
    else v = v - Math.sign(v) * clipLevel;
    clipped[i] = v;
  }
  return clipped;
}

function findLocalMinima(yin, minTau, maxTau) {
  const minima = [];
  for (let tau = Math.max(2, minTau + 1); tau < Math.min(yin.length - 1, maxTau); tau++) {
    const value = yin[tau];
    if (!Number.isFinite(value)) continue;
    if (value < yin[tau - 1] && value <= yin[tau + 1]) minima.push({ tau, value });
  }
  return minima;
}

// ── YIN (time-domain autocorrelation) ──

export function yinPitchDetect(buffer, sampleRate, rmsThreshold = SETTINGS.voicedRmsThreshold) {
  const size = buffer.length;
  const halfSize = Math.floor(size / 2);
  const signalRms = rms(buffer);
  if (signalRms < rmsThreshold) return { freq: null, clarity: 0, rms: signalRms };

  const clipped = centerClipBuffer(buffer);
  const yin = new Float32Array(halfSize);
  yin[0] = 1;
  for (let tau = 1; tau < halfSize; tau++) {
    let sum = 0;
    for (let i = 0; i < halfSize; i++) {
      const delta = clipped[i] - clipped[i + tau];
      sum += delta * delta;
    }
    yin[tau] = sum;
  }

  let runningSum = 0;
  for (let tau = 1; tau < halfSize; tau++) {
    runningSum += yin[tau];
    yin[tau] = runningSum === 0 ? 1 : (yin[tau] * tau) / runningSum;
  }

  const minTau = Math.max(2, Math.floor(sampleRate / SETTINGS.detectionMaxFreq));
  const maxTau = Math.min(halfSize - 2, Math.ceil(sampleRate / SETTINGS.detectionMinFreq));
  let selected = null;
  for (let tau = Math.max(2, minTau + 1); tau < maxTau; tau++) {
    if (yin[tau] < SETTINGS.yinThreshold && yin[tau] <= yin[tau - 1] && yin[tau] < yin[tau + 1]) {
      selected = { tau, value: yin[tau] };
      break;
    }
  }
  if (!selected) {
    const minima = findLocalMinima(yin, minTau, maxTau);
    if (!minima.length) return { freq: null, clarity: 0, rms: signalRms };
    selected = minima.reduce((best, current) => current.value < best.value ? current : best, minima[0]);
  }

  const refinedTau = parabolicInterpolation(yin, selected.tau);
  const rawFreq = sampleRate / refinedTau;
  const clarity = Math.max(0, 1 - selected.value);
  if (!Number.isFinite(rawFreq) || rawFreq <= 0) return { freq: null, clarity, rms: signalRms };
  if (clarity < SETTINGS.yinClarityThreshold) return { freq: null, clarity, rms: signalRms };
  return { freq: rawFreq, clarity, rms: signalRms };
}

// ── Harmonic Product Spectrum (frequency-domain) ──

export function hpsPitchDetect(freqDb, sampleRate, fftSize) {
  const binHz = sampleRate / fftSize;
  const minBin = Math.max(2, Math.floor(SETTINGS.displayMinFreq / binHz));
  const maxBin = Math.min(Math.floor(freqDb.length / 3) - 1, Math.ceil(SETTINGS.detectionMaxFreq / binHz));
  if (maxBin <= minBin) return { freq: null, confidence: 0 };

  let bestBin = -1;
  let bestScore = -Infinity;
  let runnerUp = -Infinity;
  for (let bin = minBin; bin <= maxBin; bin++) {
    const a = freqDb[bin], b = freqDb[bin * 2], c = freqDb[bin * 3];
    if (!Number.isFinite(a) || !Number.isFinite(b) || !Number.isFinite(c)) continue;
    if (a < -110 || b < -110) continue;
    const score = a + 0.85 * b + 0.6 * c;
    if (score > bestScore) { runnerUp = bestScore; bestScore = score; bestBin = bin; }
    else if (score > runnerUp) runnerUp = score;
  }
  if (bestBin < 0) return { freq: null, confidence: 0 };
  const bestFreq = bestBin * binHz;
  const confidence = Math.max(0, Math.min(1, (bestScore - runnerUp) / 35));
  return { freq: bestFreq, confidence };
}

// ── Octave-jump correction ──

export function correctOctaveJump(freq, referenceFreq) {
  if (!freq || !referenceFreq || !Number.isFinite(referenceFreq)) return freq;
  const candidates = [freq, freq / 2, freq / 3, freq * 2].filter(
    v => v >= SETTINGS.displayMinFreq && v <= SETTINGS.displayMaxFreq
  );
  let best = freq;
  let bestDistance = Math.abs(Math.log2(freq / referenceFreq));
  for (const candidate of candidates) {
    const distance = Math.abs(Math.log2(candidate / referenceFreq));
    if (distance < bestDistance - 0.18) {
      best = candidate;
      bestDistance = distance;
    }
  }
  return best;
}

// ── Detector fusion ──

function octaveRelatedCents(freqA, freqB) {
  const ratios = [1, 2, 0.5, 3, 1 / 3];
  let best = Infinity;
  for (const ratio of ratios) {
    const cents = Math.abs(centsOff(freqA * ratio, freqB));
    if (cents < best) best = cents;
  }
  return best;
}

export function fuseDetectors(yinResult, hpsResult, previousFreq) {
  const yinValid = Number.isFinite(yinResult.freq);
  const hpsValid = Number.isFinite(hpsResult.freq) && hpsResult.confidence >= SETTINGS.hpsConfidenceThreshold;
  const candidates = [];
  if (yinValid) candidates.push({ freq: yinResult.freq, score: yinResult.clarity, source: 'yin' });
  if (hpsValid) candidates.push({ freq: hpsResult.freq, score: hpsResult.confidence, source: 'hps' });
  if (!candidates.length) return { frequency: null, confidence: 0, source: 'none' };

  let chosen = candidates[0];
  if (candidates.length === 2) {
    const [a, b] = candidates;
    const directCents = Math.abs(centsOff(a.freq, b.freq));
    const octaveCents = octaveRelatedCents(a.freq, b.freq);
    if (directCents <= 55) {
      const total = a.score + b.score;
      const blended = (a.freq * a.score + b.freq * b.score) / total;
      return { frequency: blended, confidence: Math.min(1, total / 1.8), source: 'blend' };
    }
    if (octaveCents <= SETTINGS.octaveGuardCents) {
      if (previousFreq && Number.isFinite(previousFreq)) {
        const adjustedA = correctOctaveJump(a.freq, previousFreq);
        const adjustedB = correctOctaveJump(b.freq, previousFreq);
        const distA = Math.abs(centsOff(adjustedA, previousFreq));
        const distB = Math.abs(centsOff(adjustedB, previousFreq));
        chosen = distA <= distB ? { ...a, freq: adjustedA } : { ...b, freq: adjustedB };
      } else {
        chosen = a.freq <= b.freq ? a : b;
      }
    } else if (previousFreq && Number.isFinite(previousFreq)) {
      const adjusted = candidates.map(c => ({ ...c, freq: correctOctaveJump(c.freq, previousFreq) }));
      adjusted.sort((x, y) => Math.abs(centsOff(x.freq, previousFreq)) - Math.abs(centsOff(y.freq, previousFreq)));
      chosen = adjusted[0];
    } else {
      candidates.sort((x, y) => y.score - x.score);
      chosen = candidates[0];
    }
  }
  const frequency = previousFreq ? correctOctaveJump(chosen.freq, previousFreq) : chosen.freq;
  return { frequency, confidence: Math.min(1, chosen.score), source: chosen.source };
}

// ── FFT peak extraction (for harmonic visualization) ──

export function extractFftPeaks(freqDb, sampleRate, fftSize, maxPeaks = 12) {
  const binHz = sampleRate / fftSize;
  const minBin = Math.max(2, Math.floor(SETTINGS.displayMinFreq / binHz));
  const maxBin = Math.min(freqDb.length - 2, Math.ceil(SETTINGS.displayMaxFreq / binHz));
  if (maxBin <= minBin) return [];

  // Find the noise floor (median of all bins in range)
  const binsInRange = [];
  for (let i = minBin; i <= maxBin; i++) {
    if (Number.isFinite(freqDb[i])) binsInRange.push(freqDb[i]);
  }
  binsInRange.sort((a, b) => a - b);
  const noiseFloor = binsInRange[Math.floor(binsInRange.length * 0.5)] || -100;
  const threshold = noiseFloor + 20; // peaks must be 20dB above noise floor

  // Find local maxima above threshold
  const peaks = [];
  for (let bin = minBin + 1; bin < maxBin; bin++) {
    const val = freqDb[bin];
    if (!Number.isFinite(val) || val < threshold) continue;
    if (val > freqDb[bin - 1] && val >= freqDb[bin + 1]) {
      const freq = bin * binHz;
      const midi = Math.round(freqToMidi(freq));
      // Normalize strength: 0..1 relative to strongest
      peaks.push({ midi, db: val, freq });
    }
  }

  if (!peaks.length) return [];

  // Sort by strength, filter to quality threshold, then cap at N
  peaks.sort((a, b) => b.db - a.db);
  const bestDb = peaks[0].db;
  const dropoffDb = SETTINGS.harmonicPeakDropoffDb;
  const qualityFiltered = peaks.filter(p => p.db >= bestDb - dropoffDb);
  const topPeaks = qualityFiltered.slice(0, maxPeaks);
  const maxDb = topPeaks[0].db;
  const minDb = threshold;
  const range = maxDb - minDb || 1;

  // Deduplicate by MIDI (keep strongest per note) and normalize intensity
  const byMidi = new Map();
  for (const p of topPeaks) {
    const existing = byMidi.get(p.midi);
    if (!existing || p.db > existing.db) {
      byMidi.set(p.midi, { midi: p.midi, intensity: Math.max(0.15, (p.db - minDb) / range) });
    }
  }

  return [...byMidi.values()];
}
