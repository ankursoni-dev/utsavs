/**
 * Shared smooth-scroll utility for marketing nav links.
 *
 * Why getScrollParent?
 * The root layout sets `h-full` on <html>, which caps html to viewport height.
 * Depending on the browser, this causes the body or a wrapper div to become
 * the actual scroll container rather than `window`. `window.scrollTo` is a
 * no-op when the document is not the scroll container — only scrollIntoView
 * and direct container.scrollTo work in that case.
 *
 * getScrollParent walks up the DOM to find the nearest element whose content
 * overflows and that has overflow:auto/scroll. If none is found, it falls back
 * to window — the standard case on most browsers.
 */

const NAVBAR_OFFSET = 64; // matches h-12 pill + top-4 positioning

function getScrollParent(el: HTMLElement): HTMLElement | Window {
  let parent = el.parentElement;
  while (parent) {
    const style = window.getComputedStyle(parent);
    const overflowY = style.overflowY;
    if (
      (overflowY === 'auto' || overflowY === 'scroll') &&
      parent.scrollHeight > parent.clientHeight
    ) {
      return parent;
    }
    parent = parent.parentElement;
  }
  return window;
}

export function scrollToHash(hash: string): void {
  const target = document.getElementById(hash);
  if (!target) return;

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const behavior: ScrollBehavior = prefersReduced ? 'auto' : 'smooth';
  const scrollParent = getScrollParent(target);

  if (scrollParent instanceof Window) {
    const targetTop = window.scrollY + target.getBoundingClientRect().top - NAVBAR_OFFSET;
    window.scrollTo({ top: targetTop, behavior });
  } else {
    const parentRect = scrollParent.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();
    const targetTop = scrollParent.scrollTop + (targetRect.top - parentRect.top) - NAVBAR_OFFSET;
    scrollParent.scrollTo({ top: targetTop, behavior });
  }

  window.history.replaceState(null, '', `#${hash}`);
}

export function handleAnchorClick(
  e: React.MouseEvent<HTMLAnchorElement>,
  hash: string,
): void {
  e.preventDefault();
  scrollToHash(hash);
}
