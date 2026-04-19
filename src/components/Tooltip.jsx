import { useState } from 'react';
import { HelpCircle } from 'lucide-react';
import {
  useFloating,
  useHover,
  useFocus,
  useInteractions,
  FloatingPortal,
  offset,
  flip,
  shift,
  autoUpdate,
} from '@floating-ui/react';

export function Tooltip({ content, children }) {
  const [open, setOpen] = useState(false);

  const { refs, floatingStyles, context } = useFloating({
    open,
    onOpenChange: setOpen,
    placement: 'top',
    whileElementsMounted: autoUpdate,
    middleware: [
      offset(6),
      flip({ fallbackPlacements: ['bottom', 'left', 'right'] }),
      shift({ padding: 8 }),
    ],
  });

  const hover = useHover(context, { delay: { open: 100, close: 0 } });
  const focus = useFocus(context);
  const { getReferenceProps, getFloatingProps } = useInteractions([hover, focus]);

  return (
    <>
      <span ref={refs.setReference} {...getReferenceProps()} className="inline-flex">
        {children}
      </span>
      {open && (
        <FloatingPortal>
          <div
            ref={refs.setFloating}
            style={floatingStyles}
            {...getFloatingProps()}
            className="pointer-events-none z-50 bg-zinc-800 text-white text-xs px-2.5 py-1.5 rounded-lg shadow-lg max-w-[220px] leading-snug"
          >
            {content}
          </div>
        </FloatingPortal>
      )}
    </>
  );
}

// Superscript (?) indicator — place inside a <Tooltip> to make the whole label the trigger
export function TipIcon() {
  return (
    <span className="relative -top-1.5 inline-flex text-zinc-400 shrink-0">
      <HelpCircle size={9} />
    </span>
  );
}

// Convenience: a full-width label (or span) that shows a tooltip on hover over the text+icon
export function LabelWithTip({ as: Tag = 'label', tip, className, children }) {
  const el = (
    <Tag className={className ?? 'text-sm text-zinc-500 w-20 shrink-0 flex items-center gap-0.5 cursor-default select-none'}>
      {children}
      {tip && <TipIcon />}
    </Tag>
  );
  return tip ? <Tooltip content={tip}>{el}</Tooltip> : el;
}
