import { useContext, useCallback, useMemo } from 'react';
import { SettingsContext } from './SettingsContext';
import { DEFAULT_EXERCISE, deriveExercise } from '../lib/settings-schema';

export function useSettingsContext() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettingsContext must be used within SettingsProvider');
  return ctx;
}

export function useGlobalSettings() {
  const { global, setGlobal } = useSettingsContext();
  return { settings: global, set: setGlobal };
}

export function useExerciseSettings(exerciseId) {
  const { exercises, setExercise } = useSettingsContext();
  const exerciseSettings = exercises[exerciseId] ?? DEFAULT_EXERCISE[exerciseId] ?? {};
  const derived = useMemo(() => deriveExercise(exerciseId, exerciseSettings), [exerciseId, exerciseSettings]);
  const set = useCallback((key, value) => setExercise(exerciseId, key, value), [exerciseId, setExercise]);
  return { settings: exerciseSettings, derived, set };
}

export function useProfileManager() {
  const { profiles, activeId, switchProfile, createProfile, deleteProfile, renameProfile, resetProfile } = useSettingsContext();
  return { profiles, activeId, switchProfile, createProfile, deleteProfile, renameProfile, resetProfile };
}

// Legacy adapter: components reading useSettings() get a flattened view of matchPitch + global settings
export function useSettings() {
  const { global, exercises, setGlobal, setExercise, profiles, activeId, switchProfile, createProfile, deleteProfile, renameProfile, resetProfile } = useSettingsContext();
  const matchPitch = exercises.matchPitch;

  const settings = useMemo(() => ({
    ...global,
    ...matchPitch,
  }), [global, matchPitch]);

  const derived = useMemo(() => deriveExercise('matchPitch', matchPitch), [matchPitch]);

  const set = useCallback((key, value) => {
    if (key in global) {
      setGlobal(key, value);
    } else {
      setExercise('matchPitch', key, value);
    }
  }, [global, setGlobal, setExercise]);

  return { settings, derived, set, profiles, activeId, switchProfile, createProfile, deleteProfile, renameProfile, resetProfile };
}
