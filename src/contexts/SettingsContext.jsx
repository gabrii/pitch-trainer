import { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { DEFAULT_SETTINGS, derivedFromSettings } from '../lib/settings-schema';

const PROFILES_KEY = 'pitch-trainer-profiles';
const ACTIVE_KEY = 'pitch-trainer-active-profile';

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function loadProfiles() {
  try {
    const raw = localStorage.getItem(PROFILES_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return [{ id: 'default', name: 'Default', settings: { ...DEFAULT_SETTINGS } }];
}

function loadActiveId(profiles) {
  try {
    const id = localStorage.getItem(ACTIVE_KEY);
    if (id && profiles.some(p => p.id === id)) return id;
  } catch {}
  return profiles[0].id;
}

function saveProfiles(profiles) {
  localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
}

function saveActiveId(id) {
  localStorage.setItem(ACTIVE_KEY, id);
}

const SettingsContext = createContext(null);

export function SettingsProvider({ children }) {
  const [profiles, setProfiles] = useState(loadProfiles);
  const [activeId, setActiveId] = useState(() => loadActiveId(profiles));

  const activeProfile = useMemo(
    () => profiles.find(p => p.id === activeId) || profiles[0],
    [profiles, activeId],
  );

  // Merge defaults for any missing keys (forward compatibility)
  const settings = useMemo(
    () => ({ ...DEFAULT_SETTINGS, ...activeProfile.settings }),
    [activeProfile.settings],
  );

  const derived = useMemo(() => derivedFromSettings(settings), [settings]);

  const updateProfiles = useCallback((updater) => {
    setProfiles(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      saveProfiles(next);
      return next;
    });
  }, []);

  const set = useCallback((key, value) => {
    updateProfiles(prev =>
      prev.map(p =>
        p.id === activeId
          ? { ...p, settings: { ...p.settings, [key]: value } }
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
      settings: { ...settings }, // copy current
    };
    updateProfiles(prev => [...prev, newProfile]);
    switchProfile(id);
    return id;
  }, [settings, updateProfiles, switchProfile]);

  const deleteProfile = useCallback((id) => {
    updateProfiles(prev => {
      const next = prev.filter(p => p.id !== id);
      if (next.length === 0) {
        next.push({ id: 'default', name: 'Default', settings: { ...DEFAULT_SETTINGS } });
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

  const value = useMemo(() => ({
    settings,
    derived,
    set,
    profiles,
    activeId,
    switchProfile,
    createProfile,
    deleteProfile,
    renameProfile,
  }), [settings, derived, set, profiles, activeId, switchProfile, createProfile, deleteProfile, renameProfile]);

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
}
