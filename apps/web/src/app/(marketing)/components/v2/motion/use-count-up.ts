'use client';

import { type RefObject, useEffect, useRef, useState } from 'react';

export interface UseCountUpOptions {
  duration?: number;
  delay?: number;
  startOnVisible?: boolean;
  threshold?: number;
}

export interface UseCountUpResult<T extends HTMLElement = HTMLDivElement> {
  displayValue: string;
  ref: RefObject<T | null>;
}

interface ParsedValue {
  prefix: string;
  from: number;
  to: number | null;
  suffix: string;
  isRange: boolean;
}

function parseValue(value: string): ParsedValue | null {
  const match = value.trim().match(/^([^\d]*?)(\d+)(?:\s*[-–]\s*(\d+))?([^\d]*)$/);
  if (!match) return null;
  const from = parseInt(match[2], 10);
  const to = match[3] != null ? parseInt(match[3], 10) : null;
  return {
    prefix: match[1] ?? '',
    from,
    to,
    suffix: match[4] ?? '',
    isRange: to !== null,
  };
}

function easeOut(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

function formatValue(parsed: ParsedValue, progress: number): string {
  if (parsed.isRange && parsed.to !== null) {
    const currentFrom = Math.round(easeOut(progress) * parsed.from);
    const currentTo = Math.round(easeOut(progress) * parsed.to);
    return `${parsed.prefix}${currentFrom}-${currentTo}${parsed.suffix}`;
  }
  const currentTo = Math.round(easeOut(progress) * parsed.from);
  return `${parsed.prefix}${currentTo}${parsed.suffix}`;
}

/**
 * Animates a numeric string value from 0 to its final value.
 *
 * Supports plain numbers ("42"), ranges ("15-80"), and values with
 * prefix/suffix ("₹15-80L", "+200%").
 *
 * Respects `prefers-reduced-motion: reduce` — when active, the final value is
 * shown immediately with no animation.
 *
 * Cleanup: cancels any pending requestAnimationFrame, disconnects the
 * IntersectionObserver, and clears any pending setTimeout on unmount.
 */
export function useCountUp<T extends HTMLElement = HTMLDivElement>(
  value: string,
  {
    duration = 1800,
    delay = 0,
    startOnVisible = true,
    threshold = 0.3,
  }: UseCountUpOptions = {},
): UseCountUpResult<T> {
  const ref = useRef<T>(null);
  const [displayValue, setDisplayValue] = useState(value);

  // Holds the latest value for the animation's final snap — updated inside the
  // effect so the ref is only written during effect execution, not during render.
  const latestValueRef = useRef(value);

  useEffect(() => {
    // Keep ref in sync with the latest prop value.
    latestValueRef.current = value;

    const el = ref.current;
    const parsed = parseValue(value);
    let syncId: ReturnType<typeof setTimeout> | null = null;

    // If the value can't be parsed, show it as-is.
    if (!parsed) {
      syncId = setTimeout(() => setDisplayValue(value), 0);
      return () => {
        if (syncId !== null) clearTimeout(syncId);
      };
    }

    // Respect user motion preference.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      syncId = setTimeout(() => setDisplayValue(value), 0);
      return () => {
        if (syncId !== null) clearTimeout(syncId);
      };
    }

    let rafId: number | null = null;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    let observer: IntersectionObserver | null = null;

    const runAnimation = () => {
      const startTime = performance.now();

      const tick = (now: number) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);

        setDisplayValue(formatValue(parsed, progress));

        if (progress < 1) {
          rafId = requestAnimationFrame(tick);
        } else {
          // Snap to the exact final string.
          setDisplayValue(latestValueRef.current);
        }
      };

      rafId = requestAnimationFrame(tick);
    };

    const triggerWithDelay = () => {
      if (delay > 0) {
        timeoutId = setTimeout(runAnimation, delay);
      } else {
        runAnimation();
      }
    };

    if (startOnVisible && el) {
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              observer?.unobserve(entry.target);
              triggerWithDelay();
            }
          });
        },
        { threshold },
      );
      observer.observe(el);
    } else {
      triggerWithDelay();
    }

    return () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
      if (timeoutId !== null) clearTimeout(timeoutId);
      observer?.disconnect();
    };
  }, [value, duration, delay, startOnVisible, threshold]);

  return { displayValue, ref };
}
