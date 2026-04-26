import Piano from './Piano';

export default { title: 'Piano' };

const base = { lowerMidi: 48, upperMidi: 72, notation: 'scientific' };

export const Empty         = () => <Piano mode="passive" {...base} />;
export const WithTarget    = () => <Piano mode="rangePicker" {...base} targetMidi={60} />;
export const WithDetected  = () => <Piano mode="passive" {...base} detectedMidi={62} />;
export const TargetAndDetected = () => <Piano mode="rangePicker" {...base} targetMidi={60} detectedMidi={60} />;
export const Solfege       = () => <Piano mode="passive" {...base} notation="solfege" detectedMidi={60} />;
export const WithHarmonics = () => (
  <Piano mode="passive" {...base} detectedMidi={60}
    harmonics={[{midi:60,intensity:1},{midi:72,intensity:0.6},{midi:67,intensity:0.4}]} />
);
export const NarrowRange   = () => <Piano mode="rangePicker" lowerMidi={60} upperMidi={62} notation="scientific" />;
export const AnswerModeHighlights = () => (
  <Piano
    mode="answer"
    {...base}
    highlight={midi => {
      if (midi === 60) return 'green';
      if (midi === 62) return 'red';
      if (midi === 64 || midi === 65) return 'rose-light';
      return null;
    }}
  />
);
