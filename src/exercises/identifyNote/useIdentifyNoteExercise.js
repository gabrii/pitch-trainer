import { useReducer, useCallback, useRef, useEffect, useLayoutEffect } from 'react';
import { pickRandomMidi } from '../../lib/random';
import { sleep } from '../../lib/asyncFlow';

const INITIAL = {
  phase: 'idle',
  targetMidi: null,
  lastPickMidi: null,
  triedMidis: [],
  attempts: 0,
  reveal: false,
};

function reducer(state, action) {
  switch (action.type) {
    case 'START':
      return { ...INITIAL, phase: 'playing_target', targetMidi: action.targetMidi };
    case 'AWAIT':
      return { ...state, phase: 'awaiting_input', lastPickMidi: null, reveal: false };
    case 'WRONG':
      return {
        ...state,
        phase: 'playing_user_pick',
        lastPickMidi: action.midi,
        attempts: state.attempts + 1,
        triedMidis: state.triedMidis.includes(action.midi) ? state.triedMidis : [...state.triedMidis, action.midi],
      };
    case 'REPLAY_TARGET':
      return { ...state, phase: 'playing_target_again' };
    case 'CORRECT':
      return { ...state, phase: 'correct_revealed', reveal: true, attempts: state.attempts + 1 };
    case 'NEXT_ROUND':
      return { ...INITIAL, phase: 'playing_target', targetMidi: action.targetMidi };
    case 'SKIP':
      return { ...state, phase: 'correct_revealed', reveal: true, lastPickMidi: null };
    case 'STOP':
      return { ...INITIAL };
    default:
      return state;
  }
}

/**
 * @param tonePlayer
 * @param {{ lowerMidi, upperMidi, octaveAware, toneDurationMs, autoAdvanceMs }} config
 */
export function useIdentifyNoteExercise(tonePlayer, config) {
  const [state, dispatch] = useReducer(reducer, INITIAL);

  const loop = useRef({ cancelled: false, target: null });
  const latestConfig = useRef(config);
  useLayoutEffect(() => { latestConfig.current = config; });

  const stop = useCallback(() => {
    loop.current.cancelled = true;
    tonePlayer.stop();
    dispatch({ type: 'STOP' });
  }, [tonePlayer]);

  const start = useCallback(async (firstTarget) => {
    loop.current.cancelled = false;
    loop.current.target = firstTarget ?? pickRandomMidi(config.lowerMidi, config.upperMidi);
    const L = loop.current;

    dispatch({ type: 'START', targetMidi: L.target });
    await tonePlayer.play(L.target, latestConfig.current.toneDurationMs);
    if (L.cancelled) return;
    dispatch({ type: 'AWAIT' });
  }, [tonePlayer, config.lowerMidi, config.upperMidi]);

  const submitPick = useCallback(async (midi) => {
    const L = loop.current;
    if (L.cancelled) return;

    const cfg = latestConfig.current;
    const isCorrect = cfg.octaveAware
      ? midi === L.target
      : (midi % 12) === (L.target % 12);

    if (isCorrect) {
      dispatch({ type: 'CORRECT', midi });
      await tonePlayer.play(midi, cfg.toneDurationMs);
      if (L.cancelled) return;
      await sleep(150);
      if (L.cancelled) return;
      await tonePlayer.playSuccess(L.target);
      if (L.cancelled) return;

      await sleep(cfg.autoAdvanceMs);
      if (L.cancelled) return;

      const next = pickRandomMidi(cfg.lowerMidi, cfg.upperMidi, L.target);
      L.target = next;
      dispatch({ type: 'NEXT_ROUND', targetMidi: next });
      await tonePlayer.play(next, cfg.toneDurationMs);
      if (L.cancelled) return;
      dispatch({ type: 'AWAIT' });
    } else {
      dispatch({ type: 'WRONG', midi });
      await tonePlayer.play(midi, cfg.toneDurationMs);
      if (L.cancelled) return;

      await sleep(200);
      if (L.cancelled) return;

      dispatch({ type: 'REPLAY_TARGET' });
      await tonePlayer.play(L.target, cfg.toneDurationMs);
      if (L.cancelled) return;
      dispatch({ type: 'AWAIT' });
    }
  }, [tonePlayer]);

  const replayTarget = useCallback(async () => {
    const L = loop.current;
    if (L.cancelled || L.target == null) return;
    const cfg = latestConfig.current;
    dispatch({ type: 'REPLAY_TARGET' });
    await tonePlayer.play(L.target, cfg.toneDurationMs);
    if (L.cancelled) return;
    dispatch({ type: 'AWAIT' });
  }, [tonePlayer]);

  const skip = useCallback(async () => {
    const L = loop.current;
    if (L.cancelled) return;
    const cfg = latestConfig.current;
    dispatch({ type: 'SKIP' });
    await tonePlayer.playSuccess(L.target);
    if (L.cancelled) return;

    await sleep(1500);
    if (L.cancelled) return;

    const next = pickRandomMidi(cfg.lowerMidi, cfg.upperMidi, L.target);
    L.target = next;
    dispatch({ type: 'NEXT_ROUND', targetMidi: next });
    await tonePlayer.play(next, cfg.toneDurationMs);
    if (L.cancelled) return;
    dispatch({ type: 'AWAIT' });
  }, [tonePlayer]);

  useEffect(() => {
    return () => { loop.current.cancelled = true; };
  }, []);

  return { state, start, submitPick, replayTarget, skip, stop };
}
