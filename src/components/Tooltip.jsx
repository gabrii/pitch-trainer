import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { HelpCircle } from 'lucide-react';

export function Tooltip({ content, children }) {
  const [rect, setRect] = useState(null);
  const ref = useRef(null);

  // Hide tooltip if the anchor is removed from the DOM while hovered
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
            left: Math.min(rect.left + rect.width / 2, window.innerWidth - 120),
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
      <span className="inline-flex text-zinc-400 hover:text-zinc-500 transition-colors cursor-help">
        <HelpCircle size={12} />
      </span>
    </Tooltip>
  );
}
