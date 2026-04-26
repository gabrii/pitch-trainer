import { NavLink } from 'react-router-dom';
import { EXERCISES } from '../exercises/registry';
import { useGlobalSettings } from '../contexts/settingsHooks';
import { usePitchDetectorControl, usePitchDetectorState } from '../services/PitchDetectorProvider';
import ProfileSelector from '../components/ProfileSelector';
import SidebarSlider from '../components/SidebarSlider';
import SidebarToggleGroup from '../components/SidebarToggleGroup';
import LiveLevelMeter from '../components/LiveLevelMeter';
import GithubIcon from '../components/GithubIcon';
import { Mic, MicOff } from 'lucide-react';

function MicGlobalPill() {
  const detectorCtrl = usePitchDetectorControl();
  const isOn = detectorCtrl.status !== 'off';

  return (
    <div className="flex items-center gap-2">
      <div className={`flex-1 flex items-center gap-2 rounded-full border overflow-hidden text-xs font-semibold ${isOn ? 'border-emerald-200' : 'border-rose-200'}`}>
        <span className={`flex items-center gap-1.5 pl-3 pr-2 py-1.5 cursor-default ${isOn ? 'text-emerald-600' : 'text-rose-500'}`}>
          {isOn ? <Mic size={12} /> : <MicOff size={12} />}
          Mic {detectorCtrl.status === 'starting' ? '…' : isOn ? 'on' : 'off'}
        </span>
        <button
          onClick={() => {
            if (isOn) detectorCtrl.stop();
            else detectorCtrl.start().catch(() => {});
          }}
          className={`ml-auto px-2.5 py-1.5 transition-colors text-xs ${isOn ? 'bg-rose-100 text-rose-700 hover:bg-rose-200' : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'}`}
        >
          {isOn ? 'Off' : 'On'}
        </button>
      </div>
    </div>
  );
}

export default function Sidebar({ onClose }) {
  const { settings, set } = useGlobalSettings();
  const { state: detectorState } = usePitchDetectorState();

  return (
    <div className="flex flex-col h-full">
      {/* Brand */}
      <div className="px-4 pt-5 pb-3 flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-violet-500 text-white grid place-items-center font-bold text-sm select-none shrink-0">♪</div>
        <div>
          <div className="font-bold text-zinc-900 leading-tight">Pitch Trainer</div>
          <div className="text-[11px] text-zinc-500">Train your ear & voice</div>
        </div>
      </div>

      {/* Exercise nav */}
      <nav className="px-2 space-y-0.5">
        {EXERCISES.map(e => {
          const ExIcon = e.icon;
          return (
            <NavLink
              key={e.id}
              to={`/${e.slug}`}
              onClick={onClose}
              className={({ isActive }) =>
                `relative flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                  isActive
                    ? 'bg-violet-50 text-violet-700 font-semibold'
                    : 'text-zinc-600 hover:bg-zinc-50 font-medium'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <span className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full bg-violet-500" />
                  )}
                  <ExIcon size={16} className="shrink-0" />
                  <span>{e.name}</span>
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      <div className="mx-4 my-3 border-t border-zinc-200" />

      {/* Global settings */}
      <div className="px-4 space-y-3 flex-1 overflow-y-auto">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Global Settings</p>

        <ProfileSelector />

        <SidebarToggleGroup
          label="Notation"
          value={settings.notation}
          onChange={v => set('notation', v)}
          options={[['scientific', 'Scientific'], ['solfege', 'Solfège']]}
        />
        <SidebarToggleGroup
          label="Tone source"
          value={settings.audioMode}
          onChange={v => set('audioMode', v)}
          options={[['sine', 'Sine'], ['piano', 'Piano']]}
        />
        <SidebarSlider
          label="Volume"
          value={settings.toneVolume}
          onChange={v => set('toneVolume', v)}
          min={0.05} max={1} step={0.05}
          format={v => `${Math.round(v * 100)}%`}
        />
        <SidebarSlider
          label="Mic gain"
          value={settings.inputGain}
          onChange={v => set('inputGain', v)}
          min={0.5} max={5} step={0.1}
          format={v => `${v.toFixed(1)}×`}
        />
        <SidebarSlider
          label="Noise gate"
          value={settings.noiseGateDb}
          onChange={v => set('noiseGateDb', v)}
          min={-60} max={-10} step={1}
          format={v => `${v} dB`}
        />
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-medium text-zinc-500 w-12 shrink-0">Level</span>
          <LiveLevelMeter noiseGateDb={settings.noiseGateDb} inputLevel={detectorState.inputLevel} />
        </div>

        <MicGlobalPill />
      </div>

      <div className="mx-4 my-3 border-t border-zinc-200" />

      {/* Footer */}
      <div className="px-4 pb-4 flex items-center gap-3 text-xs text-zinc-500">
        <a
          href="https://github.com/gabrii/pitch-trainer"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 hover:text-zinc-800 transition-colors"
        >
          <GithubIcon size={13} />
          Source
        </a>
      </div>
    </div>
  );
}
