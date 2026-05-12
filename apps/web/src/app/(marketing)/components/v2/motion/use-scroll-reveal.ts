'use client';

import { type RefObject, useEffect, useRef, useState } from 'react';

export interface UseScrollRevealOptions {
  threshold?: number;
  delay?: number;
  /** Default false. When true, reveal latches and never re-hides. */
  triggerOnce?: boolean;
  rootMargin?: string;
}

export interface UseScrollRevealResult<T extends HTMLElement = HTMLDivElement> {
  ref: RefObject<T | null>;
  isVisible: boolean;
}

/**
 * Tracks whether the referenced element is in the viewport.
 *
 * Default behaviour is replayable: `isVisible` flips true on enter and false
 * on exit so framer-motion animations re-play every time the element
 * re-enters the viewport. Pass `triggerOnce: true` to latch on first reveal.
 *
 * Respects prefers-reduced-motion: when reduced motion is active, isVisible
 * is set true immediately (via setTimeout to keep React happy about
 * effect-body setState) and no observer is created.
 *
 * bfcache safety: the observer is re-armed in response to a global
 * `reveal:rearm` CustomEvent. PageRestoreGuard dispatches this event on
 * `pageshow` with `persisted === true`. Re-arming creates a fresh
 * IntersectionObserver so Chromium reliably re-delivers initial entries
 * for the current viewport state.
 */
export function useScrollReveal<T extends HTMLElement = HTMLDivElement>({
  threshold = 0.2,
  delay = 0,
  triggerOnce = false,
  rootMargin = '0px 0px -10% 0px',
}: UseScrollRevealOptions = {}): UseScrollRevealResult<T> {
  const ref = useRef<T>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    let observer: IntersectionObserver | null = null;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      timeoutId = setTimeout(() => setIsVisible(true), 0);
      return () => {
        if (timeoutId !== null) clearTimeout(timeoutId);
      };
    }

    const reveal = () => {
      if (delay > 0) {
        timeoutId = setTimeout(() => setIsVisible(true), delay);
      } else {
        setIsVisible(true);
      }
    };

    const arm = () => {
      observer?.disconnect();
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              reveal();
              if (triggerOnce) observer?.unobserve(entry.target);
            } else if (!triggerOnce) {
              // Replayable contract (user-requested): hide on scroll-out so the
              // entrance animation plays again on next viewport entry.
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
    };

    arm();

    const onRearm = () => arm();
    window.addEventListener('reveal:rearm', onRearm);

    return () => {
      observer?.disconnect();
      window.removeEventListener('reveal:rearm', onRearm);
      if (timeoutId !== null) clearTimeout(timeoutId);
    };
  }, [threshold, delay, triggerOnce, rootMargin]);

  return { ref, isVisible };
}
