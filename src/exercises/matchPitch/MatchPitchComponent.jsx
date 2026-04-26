import { useCallback, useEffect, useMemo } from 'react';
import { Play, SkipForward, Square } from 'lucide-react';
import { useMatchPitchExercise } from './useMatchPitchExercise';
import { usePitchDetectorControl, usePitchDetectorState } from '../../services/PitchDetectorProvider';
import Piano from '../../components/Piano';
import HoldProgressBar from '../../components/HoldProgressBar';
import PhasePill from '../common/PhasePill';
import { BASE_PHASE_STYLES } from '../../lib/phase-styles';
import MatchPitchFeedback from './MatchPitchFeedback';
import { pickRandomMidi } from '../../lib/random';
import { Tooltip } from '../../components/Tooltip';

export default function MatchPitchComponent({ runtime }) {
  const { tonePlayer, settings: { exercise, derived, setExercise, global } } = runtime;
  const detectorCtrl = usePitchDetectorControl();
  const { state: detectorState } = usePitchDetectorState();

  // Derive mic state from detector — sidebar is the single control point
  const micActive = detectorCtrl.status !== 'off' && detectorCtrl.status !== 'starting';

  const exerciseConfig = useMemo(() => ({
    lowerMidi: exercise.lowerMidi,
    upperMidi: exercise.upperMidi,
    centsGreen: derived.centsGreen,
    holdDurationMs: derived.holdDurationMs,
    silenceTimeoutMs: derived.silenceTimeoutMs,
    toneDurationMs: derived.toneDurationMs,
  }), [exercise.lowerMidi, exercise.upperMidi, derived.centsGreen, derived.holdDurationMs, derived.silenceTimeoutMs, derived.toneDurationMs]);

  const ex = useMatchPitchExercise(tonePlayer, exerciseConfig);
  const { phase, targetMidi: exerciseTarget, holdProgress, hint } = ex.state;

  const tonePlaying = phase === 'playing_tone' || phase === 'replaying_user' || phase === 'replaying_target' || phase === 'success';
  useEffect(() => { detectorCtrl.setPaused(tonePlaying); }, [tonePlaying, detectorCtrl.setPaused]);

  useEffect(() => {
    ex.reportPitch(detectorState.midi, detectorState.frequency);
  }, [detectorState.midi, detectorState.frequency, ex.reportPitch]);

  const handlePlay = useCallback(() => {
    ex.start(pickRandomMidi(exercise.lowerMidi, exercise.upperMidi));
  }, [exercise.lowerMidi, exercise.upperMidi, ex]);

  const handleKeyClick = useCallback((midi) => {
    if (midi < exercise.lowerMidi) setExercise('lowerMidi', midi);
    if (midi > exercise.upperMidi) setExercise('upperMidi', midi);
    if (micActive) ex.start(midi);
  }, [micActive, ex, exercise.lowerMidi, exercise.upperMidi, setExercise]);

  const isRunning = phase !== 'idle';
  const pianoTarget = exerciseTarget ?? exercise.lowerMidi;
  const displayedMidi = detectorState.midi ?? ex.state.userMidi;
  const notation = global.notation;

  return (
    <div className="space-y-4">
      {/* Status row */}
      <div className="flex items-center gap-2 flex-wrap">
        <PhasePill phase={phase} stylesMap={BASE_PHASE_STYLES} hint={hint} />
        {micActive && !isRunning && (
          <Tooltip content="Play a random note from your range, then try to match it with your voice.">
            <button onClick={handlePlay} className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-violet-500 text-white font-semibold text-sm">
              <Play size={14} />
              Play
            </button>
          </Tooltip>
        )}
        {!micActive && !isRunning && (
          <span className="text-sm text-zinc-400">Turn on the mic (sidebar) to start.</span>
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
              <button onClick={ex.stop} className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-zinc-100 border border-zinc-200 text-zinc-700 font-semibold text-sm">
                <Square size={14} />
                Stop
              </button>
            </Tooltip>
          </>
        )}
      </div>

      {/* Piano */}
      <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
        <div className="min-w-fit flex justify-center">
          <Piano
            mode="rangePicker"
            targetMidi={pianoTarget}
            detectedMidi={displayedMidi}
            harmonics={detectorState.harmonics}
            lowerMidi={exercise.lowerMidi}
            upperMidi={exercise.upperMidi}
            onKeyClick={handleKeyClick}
            notation={notation}
          />
        </div>
      </div>

      {/* Hold progress */}
      <HoldProgressBar progress={holdProgress} phase={phase} />

      {/* Feedback */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
        <MatchPitchFeedback
          detectedFreq={detectorState.frequency}
          detectedMidi={displayedMidi}
          targetMidi={pianoTarget}
          confidence={detectorState.confidence}
          status={detectorState.status}
          visualGood={derived.visualGood}
          visualWarn={derived.visualWarn}
          notation={notation}
        />
      </div>
    </div>
  );
}
