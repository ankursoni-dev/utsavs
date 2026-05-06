import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

/**
 * Small uppercase label. Used above section titles, on form fields, and as
 * metadata in cards.
 */
export function Eyebrow({
  className,
  children,
  ...rest
}: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        'inline-block text-[11px] font-medium uppercase tracking-[0.12em] text-text-muted',
        className,
      )}
      {...rest}
    >
      {children}
    </span>
  );
}
