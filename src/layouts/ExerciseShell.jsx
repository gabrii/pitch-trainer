import { useMemo, useEffect } from 'react';
import { useGlobalSettings, useExerciseSettings } from '../contexts/settingsHooks';
import { useTonePlayerService } from '../services/TonePlayerProvider';
import { usePitchDetectorControl, usePitchDetectorState } from '../services/PitchDetectorProvider';

export default function ExerciseShell({ descriptor }) {
  const tonePlayer = useTonePlayerService();
  const detectorCtrl = usePitchDetectorControl();
  const detectorStateCtx = usePitchDetectorState();
  const globalSettings = useGlobalSettings();
  const exerciseSettings = useExerciseSettings(descriptor.id);

  // Mic lifecycle: auto-start on entry for mic exercises; pause (don't stop) for non-mic ones.
  useEffect(() => {
    if (descriptor.needsMic) {
      // Auto-start if mic is off and global setting allows it
      if (detectorCtrl.status === 'off' && globalSettings.settings.autoStartMic) {
        detectorCtrl.start().catch(() => {});
      }
      detectorCtrl.setPaused(false);
    } else {
      // Pause without stopping — keeps OS mic indicator alive for quick re-entry
      detectorCtrl.setPaused(true);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [descriptor.id]);

  const mic = useMemo(() => ({
    status: detectorCtrl.status,
    error: detectorCtrl.error,
    start: detectorCtrl.start,
    stop: detectorCtrl.stop,
  }), [detectorCtrl.status, detectorCtrl.error, detectorCtrl.start, detectorCtrl.stop]);

  const runtime = useMemo(() => ({
    tonePlayer,
    detectorCtrl: descriptor.needsMic ? detectorCtrl : null,
    detectorState: descriptor.needsMic ? detectorStateCtx : null,
    mic,
    settings: {
      global:      globalSettings.settings,
      exercise:    exerciseSettings.settings,
      derived:     exerciseSettings.derived,
      setGlobal:   globalSettings.set,
      setExercise: exerciseSettings.set,
    },
  }), [tonePlayer, detectorCtrl, detectorStateCtx, mic, descriptor.needsMic, globalSettings, exerciseSettings]);

  const { Component, SettingsPanel } = descriptor;

  return (
    <div className="mx-auto max-w-5xl px-4 py-5 sm:px-6 sm:py-6 space-y-5">
      {/* Exercise header */}
      <header className="flex items-start gap-3">
        <div className={`w-10 h-10 rounded-xl grid place-items-center shrink-0 ${accentCls(descriptor.accent)}`}>
          <descriptor.icon size={20} />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">{descriptor.name}</h1>
          <p className="text-zinc-500 text-sm">{descriptor.longDesc}</p>
        </div>
      </header>

      {/* Per-exercise settings (optional) */}
      {SettingsPanel && <SettingsPanel runtime={runtime} />}

      {/* Exercise body */}
      <Component runtime={runtime} />
    </div>
  );
}

function accentCls(accent) {
  switch (accent) {
    case 'cyan':   return 'bg-cyan-100 text-cyan-600';
    case 'amber':  return 'bg-amber-100 text-amber-600';
    default:       return 'bg-violet-100 text-violet-600';
  }
}
