import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { HelpCircle } from 'lucide-react';

export function Tooltip({ content, children }) {
  const [rect, setRect] = useState(null);
  const ref = useRef(null);

  // Hide if anchor is removed from DOM while hovered
  useEffect(() => () => setRect(null), []);

  return (
    <>
      <span
        ref={ref}
        onMouseEnter={() => setRect(ref.current?.getBoundingClientRect() ?? null)}
        onMouseLeave={() => setRect(null)}
        className="inline-flex"
      >
        {children}
      </span>
      {rect && createPortal(
        <div
          className="pointer-events-none fixed z-50 bg-zinc-800 text-white text-xs px-2.5 py-1.5 rounded-lg shadow-lg max-w-[220px] leading-snug"
          style={{
            // Clamp center point so tooltip stays within viewport on both sides
            left: Math.max(110, Math.min(rect.left + rect.width / 2, window.innerWidth - 110)),
            top: rect.top - 8,
            transform: 'translate(-50%, -100%)',
          }}
        >
          {content}
        </div>,
        document.body
      )}
    </>
  );
}

export function Tip({ content }) {
  return (
    <Tooltip content={content}>
      <span className="relative -top-1.5 inline-flex text-zinc-400 hover:text-zinc-500 transition-colors cursor-help">
        <HelpCircle size={9} />
      </span>
    </Tooltip>
  );
}

// Visual-only indicator used inside a parent Tooltip (no nested tooltip)
export function TipIcon() {
  return (
    <span className="relative -top-1.5 inline-flex text-zinc-400 shrink-0">
      <HelpCircle size={9} />
    </span>
  );
}
