import { useCallback, useMemo } from 'react';
import { Play, RotateCcw, SkipForward, Square } from 'lucide-react';
import { useIdentifyNoteExercise } from './useIdentifyNoteExercise';
import { useTonePlayerService } from '../../services/TonePlayerProvider';
import Piano from '../../components/Piano';
import PhasePill from '../common/PhasePill';
import { BASE_PHASE_STYLES } from '../../lib/phase-styles';
import { Tooltip } from '../../components/Tooltip';
import { midiToLabel } from '../../lib/music';
import { pickRandomMidi } from '../../lib/random';

const IDLE_PROMPTS = {
  idle:               'Press Play to begin',
  playing_target:     'Listen carefully…',
  awaiting_input:     'Click the note you hear',
  playing_user_pick:  'Try again — listen carefully',
  playing_target_again:'Try again — listen carefully',
  correct_revealed:   '',
};

export default function IdentifyNoteComponent({ runtime }) {
  const { settings: { exercise, derived, global } } = runtime;
  const tonePlayer = useTonePlayerService();
  const notation = global.notation;

  const config = useMemo(() => ({
    lowerMidi:     exercise.lowerMidi,
    upperMidi:     exercise.upperMidi,
    octaveAware:   exercise.octaveAware,
    toneDurationMs: derived.toneDurationMs ?? 1000,
    autoAdvanceMs: exercise.autoAdvanceMs,
  }), [exercise, derived]);

  const ex = useIdentifyNoteExercise(tonePlayer, config);
  const { phase, targetMidi, lastPickMidi, triedMidis, reveal } = ex.state;

  const isRunning = phase !== 'idle';
  const isInputPhase = phase === 'awaiting_input';

  const handleKeyClick = useCallback((midi) => {
    if (!isInputPhase) return;
    ex.submitPick(midi);
  }, [isInputPhase, ex]);

  const handlePlay = useCallback(() => {
    ex.start(pickRandomMidi(exercise.lowerMidi, exercise.upperMidi));
  }, [ex, exercise.lowerMidi, exercise.upperMidi]);

  // Highlight callback for piano keys
  const highlight = useCallback((midi) => {
    // Show correct key only when revealed
    if (reveal && targetMidi != null) {
      const isCorrect = exercise.octaveAware
        ? midi === targetMidi
        : (midi % 12) === (targetMidi % 12);
      if (isCorrect) return 'green';
    }
    // Show last (wrong) pick in red during replay phases
    if (lastPickMidi != null && (phase === 'playing_user_pick' || phase === 'playing_target_again')) {
      if (midi === lastPickMidi) return 'red';
    }
    // Dim previously tried notes (wrong attempts this round)
    if (triedMidis.includes(midi) && phase === 'awaiting_input') return 'rose-light';
    return null;
  }, [reveal, targetMidi, lastPickMidi, triedMidis, phase, exercise.octaveAware]);

  const prompt = IDLE_PROMPTS[phase] ?? '';
  const showTriesDots = ex.state.attempts > 0 && phase !== 'idle' && phase !== 'playing_target';

  return (
    <div className="space-y-4">
      {/* Prompt */}
      {prompt && (
        <div className="text-center">
          <p className={`text-base font-semibold ${phase === 'awaiting_input' ? 'text-violet-700' : phase === 'playing_user_pick' || phase === 'playing_target_again' ? 'text-amber-700' : 'text-zinc-500'}`}>
            {prompt}
          </p>
        </div>
      )}

      {/* Reveal message */}
      {reveal && targetMidi != null && (
        <div className="text-center space-y-1">
          <p className="text-2xl font-extrabold text-green-700">
            {midiToLabel(targetMidi, notation)}
          </p>
          <p className="text-sm text-green-600">
            {phase === 'correct_revealed' ? '✓ Correct!' : 'Skipped'}
          </p>
        </div>
      )}

      {/* Status row */}
      <div className="flex items-center gap-2 flex-wrap justify-center">
        <PhasePill phase={phase} stylesMap={BASE_PHASE_STYLES} />
      </div>

      {/* Tries dots */}
      {showTriesDots && (
        <div className="flex items-center gap-2 justify-center text-xs text-zinc-500">
          <span>Tries:</span>
          <span className="flex gap-1">
            {ex.state.attempts <= 5 ? (
              Array.from({ length: ex.state.attempts }).map((_, i) => (
                <span key={i} className="w-2 h-2 rounded-full bg-rose-400" />
              ))
            ) : (
              <span className="font-semibold text-rose-500">{ex.state.attempts}</span>
            )}
          </span>
        </div>
      )}

      {/* Piano */}
      <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
        <div className="min-w-fit flex justify-center">
          <Piano
            mode="answer"
            lowerMidi={exercise.lowerMidi}
            upperMidi={exercise.upperMidi}
            onKeyClick={handleKeyClick}
            notation={notation}
            highlight={highlight}
          />
        </div>
      </div>

      {/* Action bar */}
      <div className="flex items-center justify-center gap-2 flex-wrap">
        {!isRunning && (
          <Tooltip content="Play a random note and try to identify it.">
            <button onClick={handlePlay} className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-violet-500 text-white font-semibold text-sm">
              <Play size={14} />
              Play
            </button>
          </Tooltip>
        )}
        {isRunning && (
          <>
            {(phase === 'awaiting_input' || phase === 'playing_target') && (
              <Tooltip content="Replay the target note.">
                <button
                  onClick={ex.replayTarget}
                  disabled={phase === 'playing_target'}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-cyan-100 border border-cyan-200 text-cyan-700 font-semibold text-sm disabled:opacity-40"
                >
                  <RotateCcw size={14} />
                  Replay
                </button>
              </Tooltip>
            )}
            {(phase === 'awaiting_input' || phase === 'playing_target') && (
              <Tooltip content="Reveal the answer and move on.">
                <button
                  onClick={ex.skip}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-amber-100 border border-amber-200 text-amber-700 font-semibold text-sm"
                >
                  <SkipForward size={14} />
                  Skip
                </button>
              </Tooltip>
            )}
            <Tooltip content="Stop the exercise.">
              <button onClick={ex.stop} className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-zinc-100 border border-zinc-200 text-zinc-700 font-semibold text-sm">
                <Square size={14} />
                Stop
              </button>
            </Tooltip>
          </>
        )}
      </div>
    </div>
  );
}
