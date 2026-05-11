'use client';

import { type RefObject, useEffect, useRef, useState } from 'react';

export interface UseScrollRevealOptions {
  threshold?: number;
  delay?: number;
  triggerOnce?: boolean;
  rootMargin?: string;
}

export interface UseScrollRevealResult<T extends HTMLElement = HTMLDivElement> {
  ref: RefObject<T | null>;
  isVisible: boolean;
}

/**
 * Reveals an element when it enters the viewport.
 *
 * Respects `prefers-reduced-motion: reduce` — when reduced motion is active,
 * `isVisible` is immediately set to `true` and no observer is created.
 *
 * Cleanup: IntersectionObserver is disconnected and any pending setTimeout is
 * cleared when the component unmounts.
 */
export function useScrollReveal<T extends HTMLElement = HTMLDivElement>({
  threshold = 0.2,
  delay = 0,
  triggerOnce = false,
  rootMargin = '0px',
}: UseScrollRevealOptions = {}): UseScrollRevealResult<T> {
  const ref = useRef<T>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Respect user motion preference immediately.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      const id = setTimeout(() => setIsVisible(true), 0);
      return () => clearTimeout(id);
    }

    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (delay > 0) {
              timeoutId = setTimeout(() => setIsVisible(true), delay);
            } else {
              setIsVisible(true);
            }
            if (triggerOnce) {
              observer.unobserve(entry.target);
            }
          } else if (!triggerOnce) {
            // Allow re-trigger: hide when element leaves viewport.
            if (timeoutId !== null) {
              clearTimeout(timeoutId);
              timeoutId = null;
            }
            setIsVisible(false);
          }
        });
      },
      { threshold, rootMargin },
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
      if (timeoutId !== null) clearTimeout(timeoutId);
    };
  }, [threshold, delay, triggerOnce, rootMargin]);

  return { ref, isVisible };
}
