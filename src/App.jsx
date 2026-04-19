import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { SETTINGS } from './lib/constants';
import { DIFFICULTY_LABELS, DIFFICULTY_PRESETS } from './lib/settings-schema';
import { useSettings } from './contexts/SettingsContext';
import { useAudioContext } from './hooks/useAudioContext';
import { usePitchDetector } from './hooks/usePitchDetector';
import { useTonePlayer } from './hooks/useTonePlayer';
import { useExercise } from './hooks/useExercise';
import Piano from './components/Piano';
import TargetSelector from './components/TargetSelector';
import FeedbackPanel from './components/FeedbackPanel';
import ProfileSelector from './components/ProfileSelector';
import { Tooltip, TipIcon } from './components/Tooltip';
import { Play, SkipForward, Square, Mic, MicOff, ChevronDown } from 'lucide-react';

const PHASE_STYLES = {
  idle: null,
  playing_tone: { label: 'Playing target tone…', bg: 'bg-cyan-50', border: 'border-cyan-200', text: 'text-cyan-700', dot: 'bg-cyan-400' },
  listening: { label: 'Listening — sing!', bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', dot: 'bg-blue-400' },
  success: { label: 'Nailed it!', bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', dot: 'bg-green-400' },
  silence: { label: 'Silence detected — replaying…', bg: 'bg-zinc-50', border: 'border-zinc-200', text: 'text-zinc-600', dot: 'bg-zinc-400' },
  replaying_user: { label: 'Playing your note…', bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-700', dot: 'bg-yellow-400' },
  replaying_target: { label: 'Playing target note…', bg: 'bg-cyan-50', border: 'border-cyan-200', text: 'text-cyan-700', dot: 'bg-cyan-400' },
};

function Slider({ label, tip, value, onChange, min, max, step, format }) {
  const pct = ((value - min) / (max - min)) * 100;
  const labelEl = (
    <label className="text-sm text-zinc-500 w-20 shrink-0 flex items-center gap-0.5 cursor-default select-none">
      {label}
      {tip && <TipIcon />}
    </label>
  );
  return (
    <div className="flex items-center gap-3">
      {tip ? <Tooltip content={tip}>{labelEl}</Tooltip> : labelEl}
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(+e.target.value)} className="flex-1"
        style={{ background: `linear-gradient(to right, #8b5cf6 ${pct}%, #e4e4e7 ${pct}%)` }} />
      <span className="text-xs text-zinc-400 w-10 text-right">{format(value)}</span>
    </div>
  );
}

function ToggleGroup({ label, tip, value, onChange, options }) {
  const labelEl = (
    <label className="text-sm text-zinc-500 w-20 shrink-0 flex items-center gap-0.5 cursor-default select-none">
      {label}
      {tip && <TipIcon />}
    </label>
  );
  return (
    <div className="flex items-center gap-3">
      {tip ? <Tooltip content={tip}>{labelEl}</Tooltip> : labelEl}
      <div className="flex rounded-lg border border-zinc-200 overflow-hidden text-sm font-semibold">
        {options.map(([key, text]) => (
          <button
            key={key}
            onClick={() => onChange(key)}
            className={`px-2.5 py-1.5 transition-colors ${value === key ? 'bg-violet-500 text-white' : 'bg-white text-zinc-500 hover:bg-zinc-50'}`}
          >{text}</button>
        ))}
      </div>
    </div>
  );
}

export default function App() {
  const { settings, derived, set } = useSettings();
  const { getContext } = useAudioContext();
  const detector = usePitchDetector(getContext);
  const tonePlayer = useTonePlayer(getContext, settings.audioMode);

  const [micStarted, setMicStarted] = useState(false);
  const [micError, setMicError] = useState(null);
  const [advancedOpen, setAdvancedOpen] = useState(false);

  useEffect(() => { detector.setNoiseGateDb(settings.noiseGateDb); }, [settings.noiseGateDb, detector.setNoiseGateDb]);
  useEffect(() => { detector.setInputGain(settings.inputGain); }, [settings.inputGain, detector.setInputGain]);
  useEffect(() => { tonePlayer.setVolume(settings.toneVolume); }, [settings.toneVolume, tonePlayer.setVolume]);

  const exerciseConfig = useMemo(() => ({
    lowerMidi: settings.lowerMidi,
    upperMidi: settings.upperMidi,
    centsGreen: derived.centsGreen,
    holdDurationMs: derived.holdDurationMs,
    silenceTimeoutMs: derived.silenceTimeoutMs,
    toneDurationMs: derived.toneDurationMs,
  }), [settings.lowerMidi, settings.upperMidi, derived.centsGreen, derived.holdDurationMs, derived.silenceTimeoutMs, derived.toneDurationMs]);

  const exercise = useExercise(tonePlayer, exerciseConfig);
  const { phase, targetMidi: exerciseTarget, holdProgress, hint } = exercise.state;

  const tonePlaying = phase === 'playing_tone' || phase === 'replaying_user' || phase === 'replaying_target' || phase === 'success';
  useEffect(() => { detector.setPaused(tonePlaying); }, [tonePlaying, detector.setPaused]);

  useEffect(() => {
    exercise.reportPitch(detector.state.midi, detector.state.frequency);
  }, [detector.state.midi, detector.state.frequency, exercise.reportPitch]);

  const handleStartMic = useCallback(async () => {
    try {
      setMicError(null);
      await detector.start();
      setMicStarted(true);
    } catch (err) {
      setMicError(err.message);
    }
  }, [detector]);

  const handleStopMic = useCallback(() => {
    exercise.stop();
    detector.stop();
    setMicStarted(false);
  }, [detector, exercise]);

  const micAttempted = useRef(false);
  useEffect(() => {
    if (!micAttempted.current) {
      micAttempted.current = true;
      handleStartMic();
    }
  }, [handleStartMic]);

  const handlePlay = useCallback(() => {
    const lo = settings.lowerMidi, hi = settings.upperMidi;
    exercise.start(lo + Math.floor(Math.random() * (hi - lo + 1)));
  }, [settings.lowerMidi, settings.upperMidi, exercise]);

  const handleKeyClick = useCallback((midi) => {
    if (midi < settings.lowerMidi) set('lowerMidi', midi);
    if (midi > settings.upperMidi) set('upperMidi', midi);
    if (micStarted) exercise.start(midi);
  }, [micStarted, exercise, settings.lowerMidi, settings.upperMidi, set]);

  const handleLowerChange = useCallback((midi) => {
    set('lowerMidi', midi);
    if (midi > settings.upperMidi) set('upperMidi', midi);
  }, [set, settings.upperMidi]);

  const handleUpperChange = useCallback((midi) => {
    set('upperMidi', Math.max(midi, settings.lowerMidi));
  }, [set, settings.lowerMidi]);

  const isRunning = phase !== 'idle';
  const pianoTarget = exerciseTarget ?? settings.lowerMidi;
  const displayedMidi = detector.state.midi ?? exercise.state.userMidi;
  const ps = PHASE_STYLES[phase];

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-5">
      <header>
        <h1 className="text-3xl font-extrabold tracking-tight">Pitch Trainer</h1>
        <p className="text-zinc-500 text-sm">Pick a note, hear it, match it with your voice.</p>
      </header>

      {micError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {micError}
        </div>
      )}

      {/* Configuration */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-5 space-y-4 shadow-sm">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold">Configuration</h2>
            <ProfileSelector />
          </div>
          <div className="flex gap-2">
            <div className={`inline-flex items-center rounded-full border overflow-hidden text-sm font-semibold ${micStarted ? 'border-emerald-200' : 'border-rose-200'}`}>
              <Tooltip content={micStarted ? 'Microphone is active and detecting pitch.' : 'Microphone is off.'}>
                <span className={`flex items-center gap-1.5 pl-3 pr-2 py-1.5 cursor-default ${micStarted ? 'text-emerald-600' : 'text-rose-500'}`}>
                  {micStarted ? <Mic size={13} /> : <MicOff size={13} />}
                  Mic
                </span>
              </Tooltip>
              <Tooltip content="Turn on the microphone to detect your pitch.">
                <button
                  onClick={handleStartMic}
                  disabled={micStarted}
                  className={`px-2.5 py-1.5 transition-colors ${micStarted ? 'bg-emerald-500 text-white cursor-default' : 'bg-white text-zinc-500 hover:bg-zinc-50'}`}
                >
                  On
                </button>
              </Tooltip>
              <Tooltip content="Turn off the microphone and stop the exercise.">
                <button
                  onClick={handleStopMic}
                  disabled={!micStarted}
                  className={`px-2.5 py-1.5 transition-colors ${!micStarted ? 'bg-rose-500 text-white cursor-default' : 'bg-white text-zinc-500 hover:bg-zinc-50'}`}
                >
                  Off
                </button>
              </Tooltip>
            </div>
          </div>
        </div>

        {/* Row 1: Range + Notation/Difficulty */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <TargetSelector
            lowerMidi={settings.lowerMidi}
            upperMidi={settings.upperMidi}
            onLowerChange={handleLowerChange}
            onUpperChange={handleUpperChange}
            notation={settings.notation}
          />
          <div className="space-y-2">
            <ToggleGroup
              label="Notation"
              tip="How note names are displayed. Scientific uses letter names (C4, D♯3). Solfège uses syllables (Do, Re, Mi…)."
              value={settings.notation}
              onChange={v => set('notation', v)}
              options={[['scientific', 'Scientific'], ['solfege', 'Solfege']]}
            />
            <div className="flex items-center gap-3">
              <Tooltip content="Controls how precisely you must match the pitch. Easy ±30¢ · Medium ±22¢ · Hard ±15¢">
                <label className="text-sm text-zinc-500 w-20 shrink-0 flex items-center gap-0.5 cursor-default select-none">
                  Difficulty
                  <TipIcon />
                </label>
              </Tooltip>
              <select
                value={settings.difficulty}
                onChange={e => set('difficulty', e.target.value)}
                className="appearance-none border border-zinc-200 rounded-lg px-2.5 py-1.5 font-semibold bg-white text-sm cursor-pointer"
              >
                {Object.entries(DIFFICULTY_LABELS).map(([key, text]) => (
                  <option key={key} value={key}>{text}</option>
                ))}
              </select>
              <span className="text-xs text-zinc-400">±{DIFFICULTY_PRESETS[settings.difficulty]?.visualGood} cents</span>
            </div>
          </div>
        </div>

        {/* Collapsible advanced settings */}
        <div className="rounded-xl border border-zinc-200 bg-zinc-50">
          <button
            onClick={() => setAdvancedOpen(v => !v)}
            className="w-full flex items-center justify-between px-4 py-2 text-sm font-semibold text-zinc-500 select-none"
          >
            Advanced Settings
            <ChevronDown size={15} className={`transition-transform duration-200 ${advancedOpen ? 'rotate-180' : ''}`} />
          </button>
          {advancedOpen && (
            <div className="px-4 pb-3 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">Input</h3>
                  <div className="flex items-center gap-3">
                    <Tooltip content="Live microphone input level. Turns green when signal is above the noise gate threshold.">
                      <label className="text-sm text-zinc-500 w-20 shrink-0 flex items-center gap-0.5 cursor-default select-none">
                        Level
                        <TipIcon />
                      </label>
                    </Tooltip>
                    <div className="flex-1 h-2.5 rounded-full bg-zinc-100 border border-zinc-200 overflow-hidden">
                      {(() => {
                        const gatePercent = ((settings.noiseGateDb - SETTINGS.meterFloorDb) / (SETTINGS.meterCeilDb - SETTINGS.meterFloorDb)) * 100;
                        const level = Math.min(100, detector.state.inputLevel ?? 0);
                        return (
                          <div
                            className={`h-full rounded-full transition-all duration-100 ${level >= gatePercent ? 'bg-emerald-400' : 'bg-zinc-300'}`}
                            style={{ width: `${level}%` }}
                          />
                        );
                      })()}
                    </div>
                    <span className="w-10 shrink-0" />
                  </div>
                  <Slider label="Noise gate" tip="Sounds quieter than this threshold are ignored. Raise it if background noise causes false detections."
                    value={settings.noiseGateDb} onChange={v => set('noiseGateDb', v)}
                    min={-60} max={-10} step={1} format={v => `${v} dB`} />
                  <Slider label="Mic gain" tip="Amplifies the microphone signal before processing. Increase if your voice is consistently hard to detect."
                    value={settings.inputGain} onChange={v => set('inputGain', v)}
                    min={0.5} max={5} step={0.1} format={v => `${v.toFixed(1)}x`} />
                  <Slider label="Silence" tip="After this much silence the app assumes you stopped singing and replays the target note."
                    value={settings.silenceTimeoutS} onChange={v => set('silenceTimeoutS', v)}
                    min={1} max={5} step={0.5} format={v => `${v}s`} />
                </div>

                <div className="space-y-2">
                  <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">Output</h3>
                  <ToggleGroup label="Tone source" tip="Sine plays a pure synthetic wave. Piano plays a real recorded piano note loaded on demand."
                    value={settings.audioMode} onChange={v => set('audioMode', v)}
                    options={[['sine', 'Sine'], ['piano', 'Piano']]} />
                  <Slider label="Volume" tip="Playback volume of the reference tone."
                    value={settings.toneVolume} onChange={v => set('toneVolume', v)}
                    min={0.05} max={1} step={0.05} format={v => `${Math.round(v * 100)}%`} />
                  <Slider label="Tone" tip="How long the reference tone plays before the listening phase begins. In Piano mode capped at 4 s (sample length)."
                    value={settings.toneDurationS} onChange={v => set('toneDurationS', v)}
                    min={0.5} max={4} step={0.25} format={v => `${v}s`} />
                  <Slider label="Hold" tip="How long you must sustain the correct pitch to pass and move to the next note."
                    value={settings.holdDurationS} onChange={v => set('holdDurationS', v)}
                    min={1} max={6} step={0.5} format={v => `${v}s`} />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Phase indicator + controls */}
      <div className="flex items-center justify-center gap-2 min-h-[36px] flex-wrap">
        {ps ? (
          <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full ${ps.bg} border ${ps.border} ${ps.text} text-sm font-semibold`}>
            <span className={`w-2 h-2 rounded-full ${ps.dot} animate-pulse`} />
            {ps.label}
            {hint && <span className="font-normal ml-1">— {hint}</span>}
          </span>
        ) : (
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-zinc-50 border border-zinc-200 text-zinc-400 text-sm font-semibold">
            <span className="w-2 h-2 rounded-full bg-zinc-300" />
            Idle
          </span>
        )}
        {micStarted && !isRunning && (
          <Tooltip content="Play a random note from your range, then try to match it with your voice.">
            <button onClick={handlePlay} className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-violet-500 text-white font-semibold text-sm">
              <Play size={14} />
              Play
            </button>
          </Tooltip>
        )}
        {isRunning && (
          <>
            <Tooltip content="Skip this note and move on to a new random one.">
              <button onClick={handlePlay} className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-amber-100 border border-amber-200 text-amber-700 font-semibold text-sm">
                <SkipForward size={14} />
                Next
              </button>
            </Tooltip>
            <Tooltip content="Stop the exercise and return to idle.">
              <button onClick={exercise.stop} className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-zinc-100 border border-zinc-200 text-zinc-700 font-semibold text-sm">
                <Square size={14} />
                Stop
              </button>
            </Tooltip>
          </>
        )}
      </div>

      {/* Piano */}
      <Piano
        targetMidi={pianoTarget}
        detectedMidi={displayedMidi}
        harmonics={detector.state.harmonics}
        lowerMidi={settings.lowerMidi}
        upperMidi={settings.upperMidi}
        onKeyClick={handleKeyClick}
        notation={settings.notation}
      />

      {/* Hold progress bar */}
      <div className="relative h-3 rounded-full bg-zinc-100 border border-zinc-200 overflow-hidden">
        <div
          className="h-full rounded-full transition-[width] duration-75 bg-green-400"
          style={{ width: `${phase === 'success' ? 100 : Math.round(holdProgress * 100)}%` }}
        />
        {(holdProgress > 0 || phase === 'success') && (
          <span className={`absolute inset-0 flex items-center justify-center text-[9px] font-bold ${phase === 'success' ? 'text-green-900' : 'text-green-800 mix-blend-multiply'}`}>
            {phase === 'success' ? 'Nailed it!' : holdProgress < 1 ? 'Hold it…' : 'Match!'}
          </span>
        )}
      </div>

      {/* Feedback */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
        <FeedbackPanel
          detectedFreq={detector.state.frequency}
          detectedMidi={displayedMidi}
          targetMidi={pianoTarget}
          confidence={detector.state.confidence}
          status={detector.state.status}
        />
      </div>
    </div>
  );
}
