import PianoKey from './PianoKey';

export default { title: 'PianoKey' };

const w = { isBlack: false, label: 'C', inRange: true };
const b = { isBlack: true,  label: 'C#', inRange: true };

export const WhiteDefault    = () => <PianoKey {...w} />;
export const WhiteTarget     = () => <PianoKey {...w} isTarget />;
export const WhiteDetected   = () => <PianoKey {...w} isDetected />;
export const WhiteBoth       = () => <PianoKey {...w} isTarget isDetected />;
export const WhiteOutOfRange = () => <PianoKey {...w} inRange={false} />;
export const WhiteGreenHL    = () => <PianoKey {...w} highlightOverride="green" />;
export const WhiteRedHL      = () => <PianoKey {...w} highlightOverride="red" />;
export const WhiteRoseHL     = () => <PianoKey {...w} highlightOverride="rose-light" />;
export const BlackDefault    = () => <PianoKey {...b} />;
export const BlackTarget     = () => <PianoKey {...b} isTarget />;
export const BlackHarmonic   = () => <PianoKey {...b} harmonicIntensity={0.7} />;
