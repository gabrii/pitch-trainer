import { Menu } from 'lucide-react';

export default function MobileTopBar({ onMenuClick }) {
  return (
    <header className="lg:hidden sticky top-0 z-20 flex items-center gap-3 px-3 h-12 border-b border-zinc-200 bg-white/90 backdrop-blur">
      <button
        onClick={onMenuClick}
        className="p-2 -ml-2 rounded-lg hover:bg-zinc-100 transition-colors"
        aria-label="Open menu"
      >
        <Menu size={20} />
      </button>
      <div className="flex items-center gap-2">
        <span className="w-6 h-6 rounded bg-violet-500 text-white grid place-items-center text-xs font-bold select-none">♪</span>
        <span className="font-bold text-zinc-900 text-sm">Pitch Trainer</span>
      </div>
    </header>
  );
}
