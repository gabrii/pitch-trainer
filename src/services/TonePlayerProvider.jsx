import { createContext, useContext, useEffect } from 'react';
import { useTonePlayer } from './tonePlayer';
import { useAudioContextService } from './AudioContextProvider';
import { useGlobalSettings } from '../contexts/settingsHooks';

const TonePlayerCtx = createContext(null);

export function TonePlayerProvider({ children }) {
  const { getContext } = useAudioContextService();
  const player = useTonePlayer(getContext);
  const { settings } = useGlobalSettings();

  useEffect(() => { player.setAudioMode(settings.audioMode); }, [settings.audioMode, player.setAudioMode]);
  useEffect(() => { player.setVolume(settings.toneVolume); }, [settings.toneVolume, player.setVolume]);

  return (
    <TonePlayerCtx.Provider value={player}>
      {children}
    </TonePlayerCtx.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useTonePlayerService() {
  const ctx = useContext(TonePlayerCtx);
  if (!ctx) throw new Error('useTonePlayerService must be inside TonePlayerProvider');
  return ctx;
}
