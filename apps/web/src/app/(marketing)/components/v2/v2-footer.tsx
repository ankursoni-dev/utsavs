/**
 * V2Footer — static server component. No animations; minimal, editorial.
 * Background: #0A0A0A (near-black). Text on dark.
 */

export function V2Footer() {
  return (
    <footer className="bg-[#0A0A0A] py-16 px-6 md:py-20 md:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Top: logo + tagline */}
        <div className="text-center">
          <p className="font-display text-xl text-white tracking-tight">utsavs</p>
          <p className="mt-2 text-sm text-white/40">The command center for Indian weddings.</p>
        </div>

        {/* Separator */}
        <div className="border-t border-white/10 my-8" />

        {/* Bottom row */}
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
          <p className="text-sm text-white/40 order-2 sm:order-1">
            &copy; 2026 Utsavs &middot; Built in India
          </p>
          <div className="flex items-center gap-6 order-1 sm:order-2">
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-white/50 hover:text-white transition-colors duration-200"
            >
              Twitter
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-white/50 hover:text-white transition-colors duration-200"
            >
              Instagram
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
