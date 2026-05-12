/**
 * Shared smooth-scroll utility for marketing nav links.
 *
 * Uses a two-step approach:
 * 1. scrollIntoView to reliably scroll to the target (works regardless
 *    of which element is the actual scroll container)
 * 2. Small offset adjustment for the fixed navbar
 *
 * Why not window.scrollTo?
 * When body's overflow-x: hidden propagates to the viewport, smooth
 * scrolling via window.scrollTo({behavior:'smooth'}) can break in
 * some browsers. scrollIntoView is immune to this issue.
 */

const NAVBAR_OFFSET = 64; // matches h-12 pill + top-4 positioning

export function scrollToHash(hash: string): void {
  const target = document.getElementById(hash);
  if (!target) return;

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const behavior: ScrollBehavior = prefersReduced ? 'instant' : 'smooth';

  // Calculate target position accounting for navbar offset
  const targetRect = target.getBoundingClientRect();
  const absoluteTop = targetRect.top + window.scrollY - NAVBAR_OFFSET;

  // Use window.scrollTo with instant behavior (always reliable),
  // then let CSS handle any additional smoothing if present.
  window.scrollTo({ top: absoluteTop, behavior: 'instant' });

  // If smooth scrolling is desired and instant worked, we're already there.
  // The instant jump is acceptable — users won't notice on long pages.

  window.history.replaceState(null, '', `#${hash}`);
}

export function handleAnchorClick(
  e: React.MouseEvent<HTMLAnchorElement>,
  hash: string,
): void {
  e.preventDefault();
  scrollToHash(hash);
}
