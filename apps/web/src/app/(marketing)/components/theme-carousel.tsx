"use client";

import { useState } from "react";
import { THEMES, THEME_NAMES, type ThemeName } from "@/lib/themes";

const VIBES: Record<ThemeName, string> = {
  "royal-ivory": "Warm, classic, gold & ivory",
  "modern-emerald": "Fresh, botanical, deep green",
  "midnight-sangeet": "Dark, cinematic, party-mode",
  "minimal-luxury": "Monochrome, editorial",
  "floral-sunset": "Soft, romantic, dreamy",
  "temple-classic": "Traditional, temple aesthetic",
};

function formatThemeName(name: ThemeName): string {
  return name
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function ThemeCarousel() {
  const [selected, setSelected] = useState<ThemeName>("royal-ivory");
  const theme = THEMES[selected];

  return (
    <div>
      {/* Preview card */}
      <div
        className="rounded-[var(--radius-xl)] min-h-[320px] flex flex-col items-center justify-center p-8 transition-all duration-500"
        style={{ background: theme.grad }}
      >
        <div
          key={selected}
          className="flex flex-col items-center transition-opacity duration-300"
        >
          <h3
            className="font-display text-2xl capitalize tracking-[-0.02em]"
            style={{ color: theme.text }}
          >
            {formatThemeName(selected)}
          </h3>
          <p className="text-sm mt-1 opacity-70" style={{ color: theme.text }}>
            {VIBES[selected]}
          </p>

          {/* Mini invite mock */}
          <div
            aria-hidden="true"
            className="bg-white/20 backdrop-blur-sm rounded-lg p-4 mt-6 mx-auto max-w-[200px] text-center w-full"
          >
            <p className="font-display text-base" style={{ color: theme.text }}>
              Priya &amp; Arjun
            </p>
            <p
              className="text-xs mt-1 opacity-80"
              style={{ color: theme.text }}
            >
              Dec 14 · Jaipur
            </p>
          </div>
        </div>
      </div>

      {/* Swatch row */}
      <div className="flex overflow-x-auto gap-3 pb-2 mt-6 md:justify-center md:gap-4 md:mt-8">
        {THEME_NAMES.map((name) => (
          <button
            key={name}
            type="button"
            onClick={() => setSelected(name)}
            aria-label={`Select ${formatThemeName(name)} theme`}
            aria-pressed={selected === name}
            className={`w-12 h-12 rounded-[var(--radius-md)] flex-shrink-0 cursor-pointer transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-charcoal/30 ${
              selected === name ? "ring-2 ring-charcoal ring-offset-2" : ""
            }`}
            style={{ background: THEMES[name].grad }}
          />
        ))}
      </div>
    </div>
  );
}
