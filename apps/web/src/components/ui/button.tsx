import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

export type ButtonVariant =
  | 'primary'
  | 'champagne'
  | 'emerald'
  | 'secondary'
  | 'ghost'
  | 'outline'
  | 'danger'
  | 'glass'
  | 'serif';

export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  pill?: boolean;
  fullWidth?: boolean;
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
  loading?: boolean;
}

const VARIANTS: Record<ButtonVariant, string> = {
  primary:
    'bg-charcoal text-white hover:bg-black/90 shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)]',
  champagne:
    'bg-champagne text-charcoal hover:brightness-95 shadow-[var(--shadow-sm)]',
  emerald: 'bg-emerald text-white hover:brightness-110 shadow-[var(--shadow-sm)]',
  secondary:
    'bg-surface text-text border border-border-strong hover:bg-hover',
  ghost: 'bg-transparent text-text hover:bg-hover',
  outline:
    'bg-transparent text-text border border-border-strong hover:border-charcoal hover:bg-hover',
  danger: 'bg-danger text-white hover:brightness-110 shadow-[var(--shadow-sm)]',
  glass:
    'bg-white/60 text-text border border-white/40 backdrop-blur-md hover:bg-white/75',
  serif:
    'bg-transparent text-text font-display tracking-[-0.02em] border-b border-text/30 hover:border-text rounded-none',
};

const SIZES: Record<ButtonSize, string> = {
  xs: 'h-7 px-3 text-xs',
  sm: 'h-8 px-3.5 text-sm',
  md: 'h-[38px] px-4 text-sm',
  lg: 'h-[46px] px-5 text-base',
  xl: 'h-[54px] px-6 text-base',
};

const BASE =
  'inline-flex items-center justify-center gap-2 font-medium ' +
  'transition-[background-color,box-shadow,border-color,opacity,transform] ' +
  'duration-[var(--duration-fast)] ease-[var(--ease-fast)] ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-charcoal/30 ' +
  'disabled:opacity-50 disabled:cursor-not-allowed';

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'primary',
    size = 'md',
    pill = false,
    fullWidth = false,
    iconLeft,
    iconRight,
    loading = false,
    className,
    children,
    disabled,
    type = 'button',
    ...rest
  },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      className={cn(
        BASE,
        VARIANTS[variant],
        SIZES[size],
        pill ? 'rounded-full' : 'rounded-[var(--radius-md)]',
        fullWidth && 'w-full',
        className,
      )}
      {...rest}
    >
      {loading ? (
        <span
          aria-hidden
          className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
        />
      ) : (
        iconLeft && <span aria-hidden>{iconLeft}</span>
      )}
      {children && <span>{children}</span>}
      {!loading && iconRight && <span aria-hidden>{iconRight}</span>}
    </button>
  );
});
