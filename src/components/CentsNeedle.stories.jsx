import CentsNeedle from './CentsNeedle';

export default { title: 'CentsNeedle' };

export const Null     = () => <div className="p-8"><CentsNeedle cents={null} /></div>;
export const Good     = () => <div className="p-8"><CentsNeedle cents={3} /></div>;
export const Warn     = () => <div className="p-8"><CentsNeedle cents={-18} /></div>;
export const Bad      = () => <div className="p-8"><CentsNeedle cents={40} /></div>;
export const Exact    = () => <div className="p-8"><CentsNeedle cents={0} /></div>;
export const TunerThresholds = () => <div className="p-8"><CentsNeedle cents={-12} visualGood={10} visualWarn={30} /></div>;
