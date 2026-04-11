import { useReducer, useCallback, useRef, useEffect } from 'react';
import { midiToFreq, centsOff } from '../lib/music';

/*
  Phases:
    idle             — waiting for user to press Play
    playing_tone     — reference tone is playing
    listening        — mic active, waiting for user to sing
    success          — user matched target, playing chime
    silence          — user stopped singing, about to replay
    replaying_user   — playing back the note the user sang
    replaying_target — playing the target again, then back to listening
*/

const INITIAL = {
  phase: 'idle',
  targetMidi: null,
  userMidi: null,
  holdProgress: 0,
  hint: null,
};

function reducer(state, action) {
  switch (action.type) {
    case 'START':
      return { ...INITIAL, phase: 'playing_tone', targetMidi: action.targetMidi };
    case 'TONE_ENDED':
      return { ...state, phase: 'listening', userMidi: null, holdProgress: 0, hint: null };
    case 'USER_PITCH':
      return { ...state, userMidi: action.midi, hint: null };
    case 'HOLD_PROGRESS':
      return { ...state, holdProgress: action.progress };
    case 'SUCCESS':
      return { ...state, phase: 'success', holdProgress: 1, hint: null };
    case 'SILENCE':
      return { ...state, phase: 'silence', holdProgress: 0, hint: action.hint || null };
    case 'REPLAY_USER':
      return { ...state, phase: 'replaying_user' };
    case 'REPLAY_TARGET':
      return { ...state, phase: 'replaying_target' };
    case 'REPLAY_DONE':
      return { ...state, phase: 'listening', userMidi: null, holdProgress: 0, hint: null };
    case 'STOP':
      return { ...INITIAL };
    default:
      return state;
  }
}

function pickRandom(lo, hi, exclude) {
  const range = hi - lo + 1;
  if (range <= 1) return lo;
  let next;
  do {
    next = lo + Math.floor(Math.random() * range);
  } while (next === exclude && range > 1);
  return next;
}

/**
 * config shape: { lowerMidi, upperMidi, centsGreen, holdDurationMs, silenceTimeoutMs, toneDurationMs }
 */
export function useExercise(tonePlayer, config) {
  const [state, dispatch] = useReducer(reducer, INITIAL);

  // ── Latest values from React render, readable inside rAF / async callbacks ──
  const latest = useRef({ phase: 'idle', config });
  latest.current = { phase: state.phase, config };

  // ── Mutable loop state (never triggers renders) ──
  const loop = useRef({
    target: null,
    progress: 0,
    lastTick: null,
    pitchState: null,    // { midi, frequency } from detector
    lastUserMidi: null,
    cancelled: false,
  });

  // ── Cleanup handles ──
  const timers = useRef({ silence: null, holdRaf: null });

  const clearTimers = useCallback(() => {
    if (timers.current.silence) {
      clearTimeout(timers.current.silence);
      timers.current.silence = null;
    }
    if (timers.current.holdRaf) {
      cancelAnimationFrame(timers.current.holdRaf);
      timers.current.holdRaf = null;
    }
    loop.current.lastTick = null;
  }, []);

  const stop = useCallback(() => {
    loop.current.cancelled = true;
    clearTimers();
    tonePlayer.stop();
    loop.current.progress = 0;
    dispatch({ type: 'STOP' });
  }, [tonePlayer, clearTimers]);

  const startProgressLoop = useCallback(() => {
    if (timers.current.holdRaf) return;
    loop.current.lastTick = performance.now();

    const tick = () => {
      const L = loop.current;
      if (L.cancelled || latest.current.phase !== 'listening') {
        timers.current.holdRaf = null;
        return;
      }

      const cfg = latest.current.config;
      const now = performance.now();
      const dt = (now - (L.lastTick || now)) / cfg.holdDurationMs;
      L.lastTick = now;

      const ps = L.pitchState;
      if (ps && ps.midi != null && L.target != null) {
        const targetFreq = midiToFreq(L.target);
        const absCents = Math.abs(centsOff(ps.frequency, targetFreq));

        if (ps.midi === L.target && absCents <= cfg.centsGreen) {
          L.progress = Math.min(1, L.progress + dt);
        } else if (ps.midi === L.target) {
          L.progress = Math.max(0, L.progress - dt);
        } else {
          L.progress = 0;
        }
      } else {
        L.progress = Math.max(0, L.progress - dt);
      }

      dispatch({ type: 'HOLD_PROGRESS', progress: L.progress });

      if (L.progress >= 1) {
        timers.current.holdRaf = null;
        dispatch({ type: 'SUCCESS' });

        (async () => {
          await tonePlayer.playSuccess(midiToFreq(L.target));
          if (L.cancelled) return;

          await new Promise(r => setTimeout(r, 1000));
          if (L.cancelled) return;

          const c = latest.current.config;
          const next = pickRandom(c.lowerMidi, c.upperMidi, L.target);
          L.target = next;
          L.progress = 0;
          dispatch({ type: 'START', targetMidi: next });
          await tonePlayer.play(midiToFreq(next), c.toneDurationMs);
          if (L.cancelled) return;
          dispatch({ type: 'TONE_ENDED' });
        })();
        return;
      }

      timers.current.holdRaf = requestAnimationFrame(tick);
    };

    timers.current.holdRaf = requestAnimationFrame(tick);
  }, [tonePlayer]);

  const start = useCallback(async (targetMidi) => {
    const L = loop.current;
    L.cancelled = false;
    clearTimers();
    L.target = targetMidi;
    L.progress = 0;
    L.pitchState = null;
    dispatch({ type: 'START', targetMidi });

    await tonePlayer.play(midiToFreq(targetMidi), latest.current.config.toneDurationMs);
    if (L.cancelled) return;
    dispatch({ type: 'TONE_ENDED' });
  }, [tonePlayer, clearTimers]);

  const reportPitch = useCallback((midi, frequency) => {
    if (state.phase !== 'listening') return;

    const L = loop.current;
    L.pitchState = { midi, frequency };
    startProgressLoop();

    if (midi != null) {
      if (timers.current.silence) {
        clearTimeout(timers.current.silence);
        timers.current.silence = null;
      }

      dispatch({ type: 'USER_PITCH', midi });
      L.lastUserMidi = midi;

      timers.current.silence = setTimeout(async () => {
        if (L.cancelled) return;

        if (timers.current.holdRaf) {
          cancelAnimationFrame(timers.current.holdRaf);
          timers.current.holdRaf = null;
        }
        L.progress = 0;

        const userNote = L.lastUserMidi;
        const isCorrectNote = userNote === L.target;

        dispatch({
          type: 'SILENCE',
          hint: isCorrectNote ? 'Right note! Try to hold it longer.' : null,
        });

        await new Promise(r => setTimeout(r, 300));
        if (L.cancelled) return;

        const cfg = latest.current.config;

        if (userNote != null && !isCorrectNote) {
          dispatch({ type: 'REPLAY_USER' });
          await tonePlayer.play(midiToFreq(userNote), cfg.toneDurationMs);
          if (L.cancelled) return;

          await new Promise(r => setTimeout(r, 200));
          if (L.cancelled) return;
        }

        dispatch({ type: 'REPLAY_TARGET' });
        await tonePlayer.play(midiToFreq(L.target), cfg.toneDurationMs);
        if (L.cancelled) return;

        L.lastUserMidi = null;
        dispatch({ type: 'REPLAY_DONE' });
      }, latest.current.config.silenceTimeoutMs);
    }
  }, [state.phase, tonePlayer, startProgressLoop]);

  useEffect(() => {
    return () => {
      loop.current.cancelled = true;
      clearTimers();
    };
  }, [clearTimers]);

  return { state, start, stop, reportPitch };
}
