'use client';
import { useState } from 'react';

export function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        onClick={() => setOpen(!open)}
        className="p-2 text-text-muted hover:text-text"
        aria-label="Toggle menu"
        aria-expanded={open}
      >
        {open ? (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <path
              d="M4 4L16 16M16 4L4 16"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        ) : (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <path
              d="M3 6h14M3 10h14M3 14h14"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        )}
      </button>
      {open && (
        <div className="absolute top-full left-0 right-0 bg-bg border-b border-border px-6 py-4 flex flex-col gap-4">
          <a
            href="#features"
            onClick={() => setOpen(false)}
            className="text-sm text-text-muted hover:text-text"
          >
            Features
          </a>
          <a
            href="#themes"
            onClick={() => setOpen(false)}
            className="text-sm text-text-muted hover:text-text"
          >
            Themes
          </a>
          <a
            href="#waitlist"
            onClick={() => setOpen(false)}
            className="block w-full text-center px-4 py-2 bg-charcoal text-white text-sm font-medium rounded-[var(--radius-md)] hover:bg-charcoal/90 transition-colors"
          >
            Join Waitlist
          </a>
        </div>
      )}
    </div>
  );
}
