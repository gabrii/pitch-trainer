import { useRef, useCallback, useEffect } from 'react';
import { SETTINGS } from '../lib/constants';
import { midiToFreq } from '../lib/music';
import { loadSample, hasSample } from '../lib/sampleLoader';

const FADE_IN = 0.06;
const FADE_OUT = 0.12;
const SAMPLE_DURATION_MS = 4000;

export function useTonePlayer(getContext, audioMode = 'sine') {
  const activeRef = useRef(null); // { node, gain, timeout } for current playback
  const volumeRef = useRef(SETTINGS.toneGain);

  const stop = useCallback(() => {
    const a = activeRef.current;
    if (!a) return;
    activeRef.current = null;

    if (a.timeout) clearTimeout(a.timeout);

    try {
      const ctx = getContext();
      if (a.gain) {
        a.gain.gain.cancelScheduledValues(ctx.currentTime);
        a.gain.gain.setValueAtTime(a.gain.gain.value, ctx.currentTime);
        a.gain.gain.linearRampToValueAtTime(0, ctx.currentTime + FADE_OUT);
      }
      a.node.stop(ctx.currentTime + FADE_OUT + 0.01);
    } catch (_) {}
  }, [getContext]);

  // Play via oscillator (sine wave)
  const playSine = useCallback((midi, durationMs = SETTINGS.toneDurationMs) => {
    stop();
    const ctx = getContext();
    const frequency = midiToFreq(midi);

    const osc = ctx.createOscillator();
    osc.type = SETTINGS.toneType;
    osc.frequency.setValueAtTime(frequency, ctx.currentTime);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(volumeRef.current, ctx.currentTime + FADE_IN);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();

    const fadeOutStart = Math.max(0, durationMs / 1000 - FADE_OUT);
    gain.gain.setValueAtTime(volumeRef.current, ctx.currentTime + fadeOutStart);
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + fadeOutStart + FADE_OUT);
    osc.stop(ctx.currentTime + fadeOutStart + FADE_OUT + 0.01);

    return new Promise((resolve) => {
      const totalMs = (fadeOutStart + FADE_OUT) * 1000 + 20;
      const timeout = setTimeout(() => {
        if (activeRef.current?.timeout === timeout) activeRef.current = null;
        resolve();
      }, totalMs);
      activeRef.current = { node: osc, gain, timeout };
    });
  }, [getContext, stop]);

  // Play via decoded AudioBuffer sample
  const playSample = useCallback(async (midi, durationMs = SETTINGS.toneDurationMs) => {
    stop();
    const ctx = getContext();

    let buffer;
    try {
      buffer = await loadSample(midi, ctx);
    } catch (_) {
      return playSine(midi, durationMs);
    }

    // Re-check: stop() may have been called while we were loading
    stop();

    const source = ctx.createBufferSource();
    source.buffer = buffer;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(volumeRef.current, ctx.currentTime);

    source.connect(gain);
    gain.connect(ctx.destination);
    source.start();

    // Fade out over FADE_OUT seconds starting at durationMs
    const fadeOutStart = durationMs / 1000;
    gain.gain.setValueAtTime(volumeRef.current, ctx.currentTime + fadeOutStart);
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + fadeOutStart + FADE_OUT);
    source.stop(ctx.currentTime + fadeOutStart + FADE_OUT + 0.01);

    return new Promise((resolve) => {
      const totalMs = (fadeOutStart + FADE_OUT) * 1000 + 20;
      const timeout = setTimeout(() => {
        if (activeRef.current?.timeout === timeout) activeRef.current = null;
        resolve();
      }, totalMs);
      activeRef.current = { node: source, gain, timeout };
      source.onended = () => {
        if (activeRef.current?.timeout === timeout) {
          clearTimeout(timeout);
          activeRef.current = null;
          resolve();
        }
      };
    });
  }, [getContext, stop, playSine]);

  /** Play a MIDI note. In 'piano' mode uses samples; in 'sine' mode uses oscillator. */
  const play = useCallback((midi, durationMs = SETTINGS.toneDurationMs) => {
    if (audioMode === 'piano' && hasSample(midi)) {
      return playSample(midi, durationMs);
    }
    return playSine(midi, durationMs);
  }, [audioMode, playSample, playSine]);

  // Success chime always uses oscillators (chord with microtonal intervals)
  const playSuccess = useCallback((midi) => {
    stop();
    const ctx = getContext();
    const t = ctx.currentTime;
    const vol = volumeRef.current * 0.7;
    const baseFrequency = midiToFreq(midi) * 2; // one octave up for brightness

    function chimeNote(freq, start, sustain, release) {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t + start);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, t + start);
      g.gain.linearRampToValueAtTime(vol, t + start + 0.015);
      g.gain.setValueAtTime(vol, t + start + sustain);
      g.gain.linearRampToValueAtTime(0, t + start + sustain + release);
      osc.connect(g);
      g.connect(ctx.destination);
      osc.start(t + start);
      osc.stop(t + start + sustain + release + 0.01);
    }

    chimeNote(baseFrequency, 0, 0.10, 0.12);
    chimeNote(baseFrequency * 1.2599, 0.09, 0.10, 0.15);
    chimeNote(baseFrequency * 1.4983, 0.18, 0.14, 0.25);

    return new Promise(resolve => setTimeout(resolve, 600));
  }, [getContext, stop]);

  const setVolume = useCallback((v) => { volumeRef.current = v; }, []);

  useEffect(() => stop, [stop]);

  return { play, stop, playSuccess, setVolume };
}
