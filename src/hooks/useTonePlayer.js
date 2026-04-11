import { useRef, useCallback } from 'react';
import { SETTINGS } from '../lib/constants';

const FADE_IN = 0.06;  // 60ms attack
const FADE_OUT = 0.12;  // 120ms release

export function useTonePlayer(getContext) {
  const oscRef = useRef(null);
  const gainRef = useRef(null);
  const timeoutRef = useRef(null);
  const volumeRef = useRef(SETTINGS.toneGain);

  const stop = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (oscRef.current) {
      try {
        const ctx = getContext();
        if (gainRef.current) {
          gainRef.current.gain.cancelScheduledValues(ctx.currentTime);
          gainRef.current.gain.setValueAtTime(gainRef.current.gain.value, ctx.currentTime);
          gainRef.current.gain.linearRampToValueAtTime(0, ctx.currentTime + FADE_OUT);
        }
        oscRef.current.stop(ctx.currentTime + FADE_OUT + 0.01);
      } catch (_) {}
      oscRef.current = null;
      gainRef.current = null;
    }
  }, [getContext]);

  const play = useCallback((frequency, durationMs = SETTINGS.toneDurationMs) => {
    stop();
    const ctx = getContext();
    const osc = ctx.createOscillator();
    osc.type = SETTINGS.toneType;
    osc.frequency.setValueAtTime(frequency, ctx.currentTime);

    const gain = ctx.createGain();
    // Smooth fade-in envelope
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(volumeRef.current, ctx.currentTime + FADE_IN);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();

    oscRef.current = osc;
    gainRef.current = gain;

    // Schedule fade-out before the end of the tone duration
    const fadeOutStart = Math.max(0, durationMs / 1000 - FADE_OUT);
    gain.gain.setValueAtTime(volumeRef.current, ctx.currentTime + fadeOutStart);
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + fadeOutStart + FADE_OUT);
    osc.stop(ctx.currentTime + fadeOutStart + FADE_OUT + 0.01);

    return new Promise((resolve) => {
      const totalMs = (fadeOutStart + FADE_OUT) * 1000 + 20;
      timeoutRef.current = setTimeout(() => {
        oscRef.current = null;
        gainRef.current = null;
        timeoutRef.current = null;
        resolve();
      }, totalMs);
    });
  }, [getContext, stop]);

  // Success chime: quick major triad arpeggio (root → major 3rd → octave)
  const playSuccess = useCallback((baseFrequency) => {
    stop();
    const ctx = getContext();
    const t = ctx.currentTime;
    const vol = volumeRef.current * 0.7;

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

    // Three ascending notes — bright major feel
    const hi = baseFrequency * 2; // one octave up so it sounds bright
    chimeNote(hi, 0, 0.10, 0.12);                // root (octave up)
    chimeNote(hi * 1.2599, 0.09, 0.10, 0.15);    // major third above that
    chimeNote(hi * 1.4983, 0.18, 0.14, 0.25);    // perfect fifth above that (major triad top)

    return new Promise(resolve => {
      setTimeout(resolve, 600);
    });
  }, [getContext, stop]);

  const setVolume = useCallback((v) => { volumeRef.current = v; }, []);

  return { play, stop, playSuccess, setVolume };
}
