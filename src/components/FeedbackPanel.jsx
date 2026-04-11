import { midiToFreq, midiToLabel, centsOff, describeOffset } from '../lib/music';
import { useSettings } from '../contexts/SettingsContext';
import NoteDisplay from './NoteDisplay';
import AccuracyChart from './AccuracyChart';

const VISUAL_CAP = 50;

function bandClass(absCents, visualGood, visualWarn) {
  if (absCents <= visualGood) return 'good';
  if (absCents <= visualWarn) return 'warn';
  return 'bad';
}

function needlePercent(cents) {
  const limited = Math.max(-VISUAL_CAP, Math.min(VISUAL_CAP, cents));
  return ((limited + VISUAL_CAP) / (VISUAL_CAP * 2)) * 100;
}

const LEVEL_BG = {
  close: 'bg-emerald-50 border-emerald-200',
  medium: 'bg-amber-50 border-amber-200',
  far: 'bg-red-50 border-red-200',
};

const NEEDLE_BG = {
  good: 'bg-emerald-400 shadow-emerald-300/60',
  warn: 'bg-amber-400 shadow-amber-300/60',
  bad: 'bg-red-400 shadow-red-300/60',
};

const METER_HEIGHT = 160;

export default function FeedbackPanel({ detectedFreq, detectedMidi, targetMidi, confidence, status }) {
  const { settings, derived } = useSettings();
  const { visualGood, visualWarn } = derived;
  const notation = settings.notation;

  const targetFreq = targetMidi != null ? midiToFreq(targetMidi) : null;
  const hasDetection = detectedFreq != null && detectedMidi != null && status === 'listening';

  let offset = null;
  if (hasDetection && targetFreq) {
    offset = describeOffset(detectedFreq, targetFreq);
  }

  let centsFromNearest = 0;
  let band = 'bad';
  if (hasDetection) {
    const nearestFreq = midiToFreq(detectedMidi);
    centsFromNearest = centsOff(detectedFreq, nearestFreq);
    band = bandClass(Math.abs(centsFromNearest), visualGood, visualWarn);
  }

  let centsFromTarget = 0;
  if (hasDetection && targetFreq) {
    centsFromTarget = centsOff(detectedFreq, targetFreq);
  }

  const statusMessages = {
    off: 'Turn on the mic to begin',
    starting: 'Requesting mic access…',
    low_signal: 'Sing louder or move closer',
    uncertain: 'Pitch unclear — sustain a clean note',
    paused: 'Listening paused while tone plays…',
    listening: null,
  };

  return (
    <div className="space-y-4">
      {/* Main offset feedback */}
      <div className={`rounded-xl border p-5 text-center transition-colors duration-200 min-h-[84px] flex items-center justify-center ${offset ? LEVEL_BG[offset.level] : 'bg-zinc-50 border-zinc-200'}`}>
        {offset ? (
          <p className="text-2xl font-bold">{offset.text}</p>
        ) : (
          <p className="text-lg text-zinc-400">{statusMessages[status] || 'Sing a note…'}</p>
        )}
      </div>

      {/* Detected note + chart + vertical meter */}
      <div className="flex items-stretch gap-4">
        <div className="shrink-0">
          <div className="min-h-[72px] flex items-center">
            {hasDetection ? (
              <NoteDisplay midi={detectedMidi} size="large" notation={notation} />
            ) : (
              <span className="text-6xl font-extrabold text-zinc-200">--</span>
            )}
          </div>
          <div className="text-sm text-zinc-400 space-y-1.5 mt-2 min-w-32">
            <div>{hasDetection ? `${detectedFreq.toFixed(2)} Hz` : '0.00 Hz'}</div>
            <div>Confidence: {confidence != null ? `${Math.round(confidence * 100)}%` : '--'}</div>
          </div>
        </div>

        {/* Scale labels */}
        <div className="flex flex-col justify-between text-xs text-zinc-400 py-0.5 shrink-0">
          <span>+50</span>
          <span>0</span>
          <span>-50</span>
        </div>

        {/* Chart + indicator fused */}
        <div className="flex-1 min-w-0 flex">
          <div className="flex-1 min-w-0">
            <AccuracyChart
              centsFromTarget={centsFromTarget}
              hasDetection={hasDetection}
              height={METER_HEIGHT}
              roundedRight={false}
            />
          </div>
          {/* Thin indicator bar, fused to chart's right edge */}
          <div className="relative w-3 shrink-0 overflow-hidden"
               style={{
                 height: METER_HEIGHT,
                 background: (() => {
                   const gP = (visualGood / VISUAL_CAP) * 50;
                   const wP = (visualWarn / VISUAL_CAP) * 50;
                   return `linear-gradient(0deg, rgba(248,151,154,0.34) 0% ${50-wP}%, rgba(252,211,77,0.34) ${50-wP}% ${50-gP}%, rgba(134,239,172,0.44) ${50-gP}% ${50+gP}%, rgba(252,211,77,0.34) ${50+gP}% ${50+wP}%, rgba(248,151,154,0.34) ${50+wP}% 100%)`;
                 })(),
                 borderTop: '1px solid rgb(226,232,240)',
                 borderRight: '1px solid rgb(226,232,240)',
                 borderBottom: '1px solid rgb(226,232,240)',
                 borderRadius: '0 8px 8px 0',
               }}>
            {/* Ball needle */}
            <div
              className={`absolute left-1/2 w-3 h-3 rounded-full -tranzinc-x-1/2 tranzinc-y-1/2 shadow-md z-20 transition-all duration-150 ${hasDetection ? NEEDLE_BG[band] : 'bg-white border border-zinc-200'}`}
              style={{ bottom: `${hasDetection ? needlePercent(centsFromNearest) : 50}%` }}
            />
          </div>
        </div>
      </div>

      <p className="text-sm font-semibold min-h-[20px]">
        {hasDetection && (
          <span className={band === 'good' ? 'text-emerald-600' : band === 'warn' ? 'text-amber-600' : 'text-red-500'}>
            {centsFromNearest >= 0 ? '+' : ''}{centsFromNearest.toFixed(1)} cents from {midiToLabel(detectedMidi, notation)}
          </span>
        )}
      </p>
    </div>
  );
}
