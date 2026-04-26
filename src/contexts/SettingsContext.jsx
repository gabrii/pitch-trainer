import { createContext, useState, useCallback, useMemo } from 'react';
import { DEFAULT_GLOBAL, DEFAULT_EXERCISE, DEFAULT_PROFILE } from '../lib/settings-schema';

const PROFILES_KEY  = 'pitch-trainer-profiles';
const ACTIVE_KEY    = 'pitch-trainer-active-profile';
const PROFILES_VERSION = 2;

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function migrateProfile(p) {
  if (p.global && p.exercises) return p; // already v2
  // v1: flat settings object
  const s = p.settings ?? {};
  return {
    id: p.id, name: p.name,
    global: {
      notation:    s.notation    ?? DEFAULT_GLOBAL.notation,
      audioMode:   s.audioMode   ?? DEFAULT_GLOBAL.audioMode,
      toneVolume:  s.toneVolume  ?? DEFAULT_GLOBAL.toneVolume,
      noiseGateDb: s.noiseGateDb ?? DEFAULT_GLOBAL.noiseGateDb,
      inputGain:   s.inputGain   ?? DEFAULT_GLOBAL.inputGain,
      autoStartMic: true,
    },
    exercises: {
      tuner: {},
      matchPitch: {
        lowerMidi:      s.lowerMidi      ?? DEFAULT_EXERCISE.matchPitch.lowerMidi,
        upperMidi:      s.upperMidi      ?? DEFAULT_EXERCISE.matchPitch.upperMidi,
        difficulty:     s.difficulty     ?? DEFAULT_EXERCISE.matchPitch.difficulty,
        holdDurationS:  s.holdDurationS  ?? DEFAULT_EXERCISE.matchPitch.holdDurationS,
        silenceTimeoutS: s.silenceTimeoutS ?? DEFAULT_EXERCISE.matchPitch.silenceTimeoutS,
        toneDurationS:  s.toneDurationS  ?? DEFAULT_EXERCISE.matchPitch.toneDurationS,
      },
      identifyNote: {
        ...DEFAULT_EXERCISE.identifyNote,
        lowerMidi: s.lowerMidi ?? DEFAULT_EXERCISE.identifyNote.lowerMidi,
        upperMidi: s.upperMidi ?? DEFAULT_EXERCISE.identifyNote.upperMidi,
      },
    },
  };
}

function loadProfiles() {
  try {
    const raw = localStorage.getItem(PROFILES_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const migrated = parsed.map(migrateProfile);
        // Persist migration immediately
        localStorage.setItem(PROFILES_KEY, JSON.stringify(migrated));
        return migrated;
      }
    }
  } catch {
    // localStorage unavailable or corrupt
  }
  return [{ id: 'default', name: 'Default', ...DEFAULT_PROFILE }];
}

function loadActiveId(profiles) {
  try {
    const id = localStorage.getItem(ACTIVE_KEY);
    if (id && profiles.some(p => p.id === id)) return id;
  } catch {
    // localStorage unavailable
  }
  return profiles[0].id;
}

function saveProfiles(profiles) {
  localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
}

function saveActiveId(id) {
  localStorage.setItem(ACTIVE_KEY, id);
}

// eslint-disable-next-line react-refresh/only-export-components
export const SettingsContext = createContext(null);

export function SettingsProvider({ children }) {
  const [profiles, setProfiles] = useState(loadProfiles);
  const [activeId, setActiveId] = useState(() => loadActiveId(profiles));

  const activeProfile = useMemo(
    () => profiles.find(p => p.id === activeId) || profiles[0],
    [profiles, activeId],
  );

  // Merged with defaults for forward-compat
  const global = useMemo(
    () => ({ ...DEFAULT_GLOBAL, ...activeProfile.global }),
    [activeProfile.global],
  );

  const exercises = useMemo(
    () => ({
      tuner:       { ...DEFAULT_EXERCISE.tuner,       ...(activeProfile.exercises?.tuner       ?? {}) },
      matchPitch:  { ...DEFAULT_EXERCISE.matchPitch,  ...(activeProfile.exercises?.matchPitch  ?? {}) },
      identifyNote:{ ...DEFAULT_EXERCISE.identifyNote,...(activeProfile.exercises?.identifyNote ?? {}) },
    }),
    [activeProfile.exercises],
  );

  const updateProfiles = useCallback((updater) => {
    setProfiles(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      saveProfiles(next);
      return next;
    });
  }, []);

  const setGlobal = useCallback((key, value) => {
    updateProfiles(prev =>
      prev.map(p =>
        p.id === activeId
          ? { ...p, global: { ...p.global, [key]: value } }
          : p,
      ),
    );
  }, [activeId, updateProfiles]);

  const setExercise = useCallback((exerciseId, key, value) => {
    updateProfiles(prev =>
      prev.map(p =>
        p.id === activeId
          ? { ...p, exercises: { ...p.exercises, [exerciseId]: { ...(p.exercises?.[exerciseId] ?? {}), [key]: value } } }
          : p,
      ),
    );
  }, [activeId, updateProfiles]);

  const switchProfile = useCallback((id) => {
    setActiveId(id);
    saveActiveId(id);
  }, []);

  const createProfile = useCallback(() => {
    const id = generateId();
    const newProfile = {
      id,
      name: 'New Profile',
      global: { ...global },
      exercises: JSON.parse(JSON.stringify(exercises)),
    };
    updateProfiles(prev => [...prev, newProfile]);
    switchProfile(id);
    return id;
  }, [global, exercises, updateProfiles, switchProfile]);

  const deleteProfile = useCallback((id) => {
    updateProfiles(prev => {
      const next = prev.filter(p => p.id !== id);
      if (next.length === 0) {
        next.push({ id: 'default', name: 'Default', ...DEFAULT_PROFILE });
      }
      if (id === activeId) {
        const newActive = next[0].id;
        setActiveId(newActive);
        saveActiveId(newActive);
      }
      return next;
    });
  }, [activeId, updateProfiles]);

  const renameProfile = useCallback((id, name) => {
    updateProfiles(prev =>
      prev.map(p => (p.id === id ? { ...p, name } : p)),
    );
  }, [updateProfiles]);

  const resetProfile = useCallback(() => {
    updateProfiles(prev =>
      prev.map(p =>
        p.id === activeId
          ? { ...p, global: { ...DEFAULT_GLOBAL }, exercises: JSON.parse(JSON.stringify(DEFAULT_EXERCISE)) }
          : p,
      ),
    );
  }, [activeId, updateProfiles]);

  const value = useMemo(() => ({
    global,
    exercises,
    setGlobal,
    setExercise,
    profiles,
    activeId,
    switchProfile,
    createProfile,
    deleteProfile,
    renameProfile,
    resetProfile,
  }), [global, exercises, setGlobal, setExercise, profiles, activeId, switchProfile, createProfile, deleteProfile, renameProfile, resetProfile]);

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

