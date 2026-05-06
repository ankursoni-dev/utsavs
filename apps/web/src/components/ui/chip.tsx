import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

/**
 * Status strings the chip understands. Anything else falls back to "neutral".
 */
export type ChipStatus =
  // RSVP
  | 'confirmed'
  | 'pending'
  | 'declined'
  | 'maybe'
  | 'vip'
  // Health (ops dashboards)
  | 'healthy'
  | 'caution'
  | 'critical'
  | 'neutral'
  // Generic semantic
  | 'success'
  | 'warning'
  | 'danger'
  | 'info';

export interface ChipProps extends HTMLAttributes<HTMLSpanElement> {
  status?: ChipStatus;
  /** Compact dense variant. */
  dense?: boolean;
}

const STATUS_STYLES: Record<ChipStatus, string> = {
  confirmed: 'bg-[var(--color-success-bg)] text-[var(--color-success)]',
  pending: 'bg-[var(--color-warning-bg)] text-[var(--color-warning)]',
  declined: 'bg-[var(--color-danger-bg)] text-[var(--color-danger)]',
  maybe: 'bg-[var(--color-info-bg)] text-[var(--color-info)]',
  vip: 'bg-[var(--color-champagne-lt)] text-[var(--color-maroon)]',
  healthy: 'bg-[var(--color-success-bg)] text-[var(--color-healthy)]',
  caution: 'bg-[var(--color-warning-bg)] text-[var(--color-caution)]',
  critical: 'bg-[var(--color-danger-bg)] text-[var(--color-critical)]',
  neutral: 'bg-[var(--color-hover)] text-[var(--color-text-muted)]',
  success: 'bg-[var(--color-success-bg)] text-[var(--color-success)]',
  warning: 'bg-[var(--color-warning-bg)] text-[var(--color-warning)]',
  danger: 'bg-[var(--color-danger-bg)] text-[var(--color-danger)]',
  info: 'bg-[var(--color-info-bg)] text-[var(--color-info)]',
};

export function Chip({
  status = 'neutral',
  dense = false,
  className,
  children,
  ...rest
}: ChipProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-medium',
        'tracking-wide',
        dense ? 'h-5 px-2 text-[10px]' : 'h-6 px-2.5 text-xs',
        STATUS_STYLES[status],
        className,
      )}
      {...rest}
    >
      {children}
    </span>
  );
}
