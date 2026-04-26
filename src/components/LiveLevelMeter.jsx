import { SETTINGS } from '../lib/constants';

export default function LiveLevelMeter({ noiseGateDb, inputLevel }) {
  const gatePercent = ((noiseGateDb - SETTINGS.meterFloorDb) / (SETTINGS.meterCeilDb - SETTINGS.meterFloorDb)) * 100;
  const level = Math.min(100, inputLevel ?? 0);
  return (
    <div className="flex-1 h-2.5 rounded-full bg-zinc-100 border border-zinc-200 overflow-hidden">
      <div
        className={`h-full rounded-full transition-all duration-100 ${level >= gatePercent ? 'bg-emerald-400' : 'bg-zinc-300'}`}
        style={{ width: `${level}%` }}
      />
    </div>
  );
}
