import { useState } from 'react';
import Slider from './Slider';
import SidebarSlider from './SidebarSlider';

export default { title: 'Slider' };

export const Horizontal = () => {
  const [v, setV] = useState(0.5);
  return (
    <div className="p-8 max-w-xs">
      <Slider label="Volume" value={v} onChange={setV} min={0} max={1} step={0.05} format={v => `${Math.round(v * 100)}%`} />
    </div>
  );
};

export const SidebarVariant = () => {
  const [v, setV] = useState(-40);
  return (
    <div className="p-4 w-56">
      <SidebarSlider label="Noise gate" value={v} onChange={setV} min={-60} max={-10} step={1} format={v => `${v} dB`} />
    </div>
  );
};
