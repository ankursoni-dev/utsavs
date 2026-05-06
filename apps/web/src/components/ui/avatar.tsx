import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface AvatarProps extends HTMLAttributes<HTMLSpanElement> {
  name: string;
  /** Optional image src — when provided, initials are hidden. */
  src?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  /** Adds a champagne ring around the avatar (used for VIP / hosts). */
  ring?: boolean;
}

// 6-color palette rotation. Index = sum of charcodes mod 6 — deterministic per name.
const PALETTE: ReadonlyArray<{ bg: string; fg: string }> = [
  { bg: '#0F4C3A', fg: '#FFFFFF' }, // emerald
  { bg: '#C8A96B', fg: '#1A1A1A' }, // champagne
  { bg: '#1B1F3B', fg: '#FFFFFF' }, // navy
  { bg: '#5B1A2B', fg: '#FFFFFF' }, // maroon
  { bg: '#A88B4A', fg: '#FFFFFF' }, // brass
  { bg: '#1A1A1A', fg: '#FFFFFF' }, // charcoal
];

const SIZES: Record<NonNullable<AvatarProps['size']>, string> = {
  xs: 'h-6 w-6 text-[10px]',
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
  xl: 'h-16 w-16 text-lg',
};

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return (parts[0]![0]! + parts[parts.length - 1]![0]!).toUpperCase();
}

function paletteIndex(name: string): number {
  let sum = 0;
  for (let i = 0; i < name.length; i++) sum += name.charCodeAt(i);
  return sum % PALETTE.length;
}

export function Avatar({
  name,
  src,
  size = 'md',
  ring = false,
  className,
  ...rest
}: AvatarProps) {
  const color = PALETTE[paletteIndex(name)]!;
  const initials = initialsOf(name);

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center rounded-full font-medium select-none',
        'overflow-hidden',
        ring && 'ring-2 ring-[var(--color-champagne)] ring-offset-2 ring-offset-[var(--color-bg)]',
        SIZES[size],
        className,
      )}
      style={src ? undefined : { backgroundColor: color.bg, color: color.fg }}
      title={name}
      {...rest}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={name} className="h-full w-full object-cover" />
      ) : (
        initials
      )}
    </span>
  );
}
