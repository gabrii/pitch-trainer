import AccuracyChart from './AccuracyChart';

export default { title: 'AccuracyChart' };

const base = { visualGood: 5, visualWarn: 15, height: 160 };

export const Empty        = () => <AccuracyChart {...base} cents={0} hasDetection={false} />;
export const OnTarget     = () => <AccuracyChart {...base} cents={2} hasDetection={true} />;
export const Flat5        = () => <AccuracyChart {...base} cents={-8} hasDetection={true} />;
export const Sharp20      = () => <AccuracyChart {...base} cents={20} hasDetection={true} />;
export const VeryFar      = () => <AccuracyChart {...base} cents={-45} hasDetection={true} />;
export const TunerMode    = () => <AccuracyChart visualGood={10} visualWarn={30} height={120} cents={-12} hasDetection={true} />;
