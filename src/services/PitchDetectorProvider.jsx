import { createContext, useContext, useEffect } from 'react';
import { usePitchDetector } from './pitchDetector';
import { useAudioContextService } from './AudioContextProvider';
import { useGlobalSettings } from '../contexts/settingsHooks';

// Split into two contexts so rapid state updates don't re-render stable consumers (sidebar, etc.)
const PitchDetectorControlCtx = createContext(null);
const PitchDetectorStateCtx = createContext(null);

export function PitchDetectorProvider({ children }) {
  const { getContext } = useAudioContextService();
  const detector = usePitchDetector(getContext);
  const { settings } = useGlobalSettings();

  // Bridge global settings → detector imperatively
  useEffect(() => { detector.setNoiseGateDb(settings.noiseGateDb); }, [settings.noiseGateDb, detector.setNoiseGateDb]);
  useEffect(() => { detector.setInputGain(settings.inputGain); }, [settings.inputGain, detector.setInputGain]);

  const control = {
    start: detector.start,
    stop: detector.stop,
    setPaused: detector.setPaused,
    setNoiseGateDb: detector.setNoiseGateDb,
    setInputGain: detector.setInputGain,
    status: detector.state.status,
    error: null,
  };

  return (
    <PitchDetectorControlCtx.Provider value={control}>
      <PitchDetectorStateCtx.Provider value={{ state: detector.state }}>
        {children}
      </PitchDetectorStateCtx.Provider>
    </PitchDetectorControlCtx.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function usePitchDetectorControl() {
  const ctx = useContext(PitchDetectorControlCtx);
  if (!ctx) throw new Error('usePitchDetectorControl must be inside PitchDetectorProvider');
  return ctx;
}

// eslint-disable-next-line react-refresh/only-export-components
export function usePitchDetectorState() {
  const ctx = useContext(PitchDetectorStateCtx);
  if (!ctx) throw new Error('usePitchDetectorState must be inside PitchDetectorProvider');
  return ctx;
}
