'use client';

import { useEffect } from 'react';

/**
 * Single page-level pageshow handler. On a bfcache-persisted restore it
 * dispatches a `reveal:rearm` CustomEvent that every useScrollReveal hook
 * listens to. Hooks tear down their old IntersectionObserver and create a
 * fresh one so Chromium correctly re-delivers initial intersection entries.
 *
 * Also forces a synchronous layout flush before dispatching the event so
 * the new observers evaluate against the current scroll position.
 *
 * Renders nothing.
 */
export function PageRestoreGuard() {
  useEffect(() => {
    const onPageShow = (e: PageTransitionEvent) => {
      if (!e.persisted) return;
      void document.body.getBoundingClientRect();
      window.dispatchEvent(new CustomEvent('reveal:rearm'));
    };
    window.addEventListener('pageshow', onPageShow);
    return () => window.removeEventListener('pageshow', onPageShow);
  }, []);
  return null;
}
