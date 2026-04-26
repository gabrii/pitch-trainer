import { useState, useRef, useCallback, useEffect, useLayoutEffect } from 'react';
import { SETTINGS } from '../lib/constants';
import { freqToMidi, midiToFreq, median, rms, centsOff } from '../lib/music';
import { yinPitchDetect, hpsPitchDetect, fuseDetectors, extractFftPeaks } from '../lib/pitch-detection';

const INITIAL_STATE = {
  frequency: null,
  midi: null,
  confidence: 0,
  inputLevel: 0,
  active: false,
  status: 'off',
  harmonics: [],
};

export function usePitchDetector(getContext) {
  const [state, setState] = useState(INITIAL_STATE);

  // ── Web Audio nodes ──
  const audio = useRef({
    analyser: null, source: null, gain: null, hp: null, lp: null,
    stream: null, timeData: null, freqData: null,
  });

  // ── Display stability tracking ──
  const tracking = useRef({
    smoothedFreq: null,
    recentPitches: [],
    displayedMidi: null,
    candidateMidi: null,
    candidateSince: 0,
  });

  // ── Throttle timestamps ──
  const timing = useRef({ lastAnalysis: 0, lastUiUpdate: 0 });

  // ── Mutable config (set via imperative methods, read in rAF loop) ──
  const config = useRef({
    paused: false,
    noiseGateRms: SETTINGS.voicedRmsThreshold,
    inputGain: SETTINGS.analysisGain,
  });

  const rafRef = useRef(null);

  const cleanup = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;

    const a = audio.current;
    [a.source, a.gain, a.hp, a.lp, a.analyser].forEach(node => {
      if (node) try { node.disconnect(); } catch { /* ignore */ }
    });
    if (a.stream) a.stream.getTracks().forEach(t => t.stop());
    audio.current = { analyser: null, source: null, gain: null, hp: null, lp: null, stream: null, timeData: null, freqData: null };

    tracking.current = { smoothedFreq: null, recentPitches: [], displayedMidi: null, candidateMidi: null, candidateSince: 0 };
    timing.current = { lastAnalysis: 0, lastUiUpdate: 0 };

    setState(INITIAL_STATE);
  }, []);

  useEffect(() => cleanup, [cleanup]);

  const getStableDisplayMidi = useCallback((freq, now) => {
    const t = tracking.current;
    const nearestMidi = Math.round(freqToMidi(freq));

    if (t.displayedMidi == null) {
      t.displayedMidi = nearestMidi;
      t.candidateMidi = null;
      t.candidateSince = 0;
      return t.displayedMidi;
    }

    const centsToDisplayed = centsOff(freq, midiToFreq(t.displayedMidi));
    if (Math.abs(centsToDisplayed) <= SETTINGS.displayStickCents) {
      t.candidateMidi = null;
      t.candidateSince = 0;
      return t.displayedMidi;
    }

    if (t.candidateMidi !== nearestMidi) {
      t.candidateMidi = nearestMidi;
      t.candidateSince = now;
      return t.displayedMidi;
    }

    if (now - t.candidateSince >= SETTINGS.displaySwitchMs) {
      t.displayedMidi = t.candidateMidi;
      t.candidateMidi = null;
      t.candidateSince = 0;
    }
    return t.displayedMidi;
  }, []);

  const analyzeRef = useRef(null);
  const analyze = useCallback(() => {
    const a = audio.current;
    if (!a.analyser || !a.timeData || !a.freqData) return;

    const ctx = getContext();
    const now = performance.now();
    if (now - timing.current.lastAnalysis < SETTINGS.analysisInterval) {
      rafRef.current = requestAnimationFrame(analyzeRef.current);
      return;
    }
    timing.current.lastAnalysis = now;

    a.analyser.getFloatTimeDomainData(a.timeData);
    a.analyser.getFloatFrequencyData(a.freqData);

    const level = rms(a.timeData);
    const db = level > 0 ? 20 * Math.log10(level) : SETTINGS.meterFloorDb;
    const inputLevel = Math.min(100, Math.max(0,
      Math.round(((db - SETTINGS.meterFloorDb) / (SETTINGS.meterCeilDb - SETTINGS.meterFloorDb)) * 100)
    ));

    const throttled = now - timing.current.lastUiUpdate < SETTINGS.uiUpdateInterval;

    if (config.current.paused) {
      if (!throttled) {
        setState(prev => ({ ...prev, frequency: null, midi: null, inputLevel, status: 'paused', harmonics: [] }));
        timing.current.lastUiUpdate = now;
      }
      rafRef.current = requestAnimationFrame(analyzeRef.current);
      return;
    }

    if (level < config.current.noiseGateRms) {
      if (!throttled) {
        setState(prev => ({ ...prev, frequency: null, midi: null, confidence: 0, inputLevel, active: true, status: 'low_signal', harmonics: [] }));
        timing.current.lastUiUpdate = now;
      }
      rafRef.current = requestAnimationFrame(analyzeRef.current);
      return;
    }

    const yin = yinPitchDetect(a.timeData, ctx.sampleRate, config.current.noiseGateRms);
    const hps = hpsPitchDetect(a.freqData, ctx.sampleRate, a.analyser.fftSize);
    const t = tracking.current;

    const fused = fuseDetectors(yin, hps, t.smoothedFreq || median(t.recentPitches));
    const inRange = Number.isFinite(fused.frequency) &&
      fused.frequency >= SETTINGS.displayMinFreq &&
      fused.frequency <= SETTINGS.displayMaxFreq;

    if (!Number.isFinite(fused.frequency) || fused.confidence < SETTINGS.minConfidence || !inRange) {
      if (!throttled) {
        setState(prev => ({ ...prev, frequency: null, midi: null, confidence: fused.confidence, inputLevel, active: true, status: 'uncertain', harmonics: [] }));
        timing.current.lastUiUpdate = now;
      }
      rafRef.current = requestAnimationFrame(analyzeRef.current);
      return;
    }

    t.recentPitches.push(fused.frequency);
    if (t.recentPitches.length > SETTINGS.recentPitchWindow) t.recentPitches.shift();
    const medianPitch = median(t.recentPitches) || fused.frequency;
    t.smoothedFreq = t.smoothedFreq == null
      ? medianPitch
      : SETTINGS.smoothingAlpha * t.smoothedFreq + (1 - SETTINGS.smoothingAlpha) * medianPitch;

    if (!throttled) {
      const stableMidi = getStableDisplayMidi(t.smoothedFreq, now);
      const harmonics = extractFftPeaks(a.freqData, ctx.sampleRate, a.analyser.fftSize);
      setState({
        frequency: t.smoothedFreq,
        midi: stableMidi,
        confidence: fused.confidence,
        inputLevel,
        active: true,
        status: 'listening',
        harmonics,
      });
      timing.current.lastUiUpdate = now;
    }

    rafRef.current = requestAnimationFrame(analyzeRef.current);
  }, [getContext, getStableDisplayMidi]);
  useLayoutEffect(() => { analyzeRef.current = analyze; });

  const start = useCallback(async () => {
    cleanup();

    if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) {
      setState(prev => ({ ...prev, status: 'off' }));
      throw new Error('Microphone requires HTTPS or localhost');
    }

    setState(prev => ({ ...prev, status: 'starting' }));

    const ctx = getContext();
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: { channelCount: 1, echoCancellation: false, noiseSuppression: false, autoGainControl: false },
    });

    const a = audio.current;
    a.stream = stream;
    a.source = ctx.createMediaStreamSource(stream);
    a.gain = ctx.createGain();
    a.gain.gain.value = config.current.inputGain;
    a.hp = ctx.createBiquadFilter();
    a.hp.type = 'highpass';
    a.hp.frequency.value = 50;
    a.hp.Q.value = 0.7;
    a.lp = ctx.createBiquadFilter();
    a.lp.type = 'lowpass';
    a.lp.frequency.value = 2400;
    a.lp.Q.value = 0.7;
    a.analyser = ctx.createAnalyser();
    a.analyser.fftSize = SETTINGS.fftSize;
    a.analyser.smoothingTimeConstant = 0;
    a.timeData = new Float32Array(a.analyser.fftSize);
    a.freqData = new Float32Array(a.analyser.frequencyBinCount);

    a.source.connect(a.gain);
    a.gain.connect(a.hp);
    a.hp.connect(a.lp);
    a.lp.connect(a.analyser);

    setState(prev => ({ ...prev, active: true, status: 'listening' }));
    rafRef.current = requestAnimationFrame(analyzeRef.current);
  }, [getContext, cleanup]);

  const setPaused = useCallback((val) => { config.current.paused = val; }, []);

  const setNoiseGateDb = useCallback((db) => {
    config.current.noiseGateRms = Math.pow(10, db / 20);
  }, []);

  const setInputGain = useCallback((gain) => {
    config.current.inputGain = gain;
    if (audio.current.gain) audio.current.gain.gain.value = gain;
  }, []);

  return { state, start, stop: cleanup, setPaused, setNoiseGateDb, setInputGain };
}
