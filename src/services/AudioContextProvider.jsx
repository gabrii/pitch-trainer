import { createContext, useContext, useRef, useCallback } from 'react';

const AudioContextCtx = createContext(null);

export function AudioContextProvider({ children }) {
  const ctxRef = useRef(null);

  const getContext = useCallback(() => {
    if (!ctxRef.current || ctxRef.current.state === 'closed') {
      ctxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (ctxRef.current.state === 'suspended') {
      ctxRef.current.resume();
    }
    return ctxRef.current;
  }, []);

  return (
    <AudioContextCtx.Provider value={{ getContext }}>
      {children}
    </AudioContextCtx.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAudioContextService() {
  const ctx = useContext(AudioContextCtx);
  if (!ctx) throw new Error('useAudioContextService must be inside AudioContextProvider');
  return ctx;
}
