import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type DisplaySize = 'sm' | 'md' | 'lg' | 'xl' | '2xl';

const SIZES: Record<DisplaySize, string> = {
  sm: 'text-2xl md:text-3xl',
  md: 'text-3xl md:text-4xl',
  lg: 'text-4xl md:text-5xl',
  xl: 'text-5xl md:text-6xl',
  '2xl': 'text-6xl md:text-7xl',
};

export interface DisplayProps extends HTMLAttributes<HTMLHeadingElement> {
  size?: DisplaySize;
  as?: 'h1' | 'h2' | 'h3' | 'h4';
}

/**
 * Marcellus display heading. Used for couple names, section titles, hero text.
 * Letter-spacing is fixed to -0.02em per the design system.
 */
export function Display({
  size = 'lg',
  as: Tag = 'h1',
  className,
  children,
  ...rest
}: DisplayProps) {
  return (
    <Tag
      className={cn(
        'font-display tracking-[-0.02em] leading-[1.05] text-text',
        SIZES[size],
        className,
      )}
      {...rest}
    >
      {children}
    </Tag>
  );
}
