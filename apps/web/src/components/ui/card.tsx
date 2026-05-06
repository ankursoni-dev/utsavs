import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** Optional accent bar color (CSS color or token like `var(--color-emerald)`). */
  accent?: string;
  /** Lift on hover. */
  hover?: boolean;
}

/**
 * Editorial card — white surface, 12px radius, soft shadow, optional accent bar.
 * The base layout primitive for organizer + host dashboards.
 */
export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  { accent, hover = false, className, children, ...rest },
  ref,
) {
  return (
    <div
      ref={ref}
      className={cn(
        'relative bg-surface border border-border rounded-[var(--radius-lg)]',
        'shadow-[var(--shadow-sm)]',
        hover &&
          'transition-[box-shadow,transform] duration-[var(--duration-med)] ease-[var(--ease-smooth)] hover:shadow-[var(--shadow-md)] hover:-translate-y-0.5',
        accent && 'overflow-hidden',
        className,
      )}
      {...rest}
    >
      {accent && (
        <span
          aria-hidden
          className="absolute inset-x-0 top-0 h-[3px]"
          style={{ backgroundColor: accent }}
        />
      )}
      {children}
    </div>
  );
});

export function CardBody({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('p-6', className)} {...rest} />;
}

export function CardHeader({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('px-6 pt-6 pb-4 border-b border-border', className)}
      {...rest}
    />
  );
}

export function CardFooter({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('px-6 py-4 border-t border-border bg-bg-alt', className)}
      {...rest}
    />
  );
}
