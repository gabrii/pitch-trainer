import { useEffect, useRef } from 'react';

export default function Modal({ open, onClose, title, children }) {
  const backdropRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      ref={backdropRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
      onClick={(e) => { if (e.target === backdropRef.current) onClose(); }}
    >
      <div className="bg-white rounded-2xl shadow-xl border border-zinc-200 p-5 w-80 space-y-4">
        {title && <h3 className="text-lg font-bold">{title}</h3>}
        {children}
      </div>
    </div>
  );
}
