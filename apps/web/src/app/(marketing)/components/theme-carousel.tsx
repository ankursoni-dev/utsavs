"use client";

import { useState } from "react";
import { THEMES, THEME_NAMES, type ThemeName } from "@/lib/themes";

function getGradientTextColor(grad: string): string {
  const match = grad.match(/#([A-Fa-f0-9]{6})/);
  if (!match) return "#171717";
  const hex = match[1];
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance < 0.5 ? "#FBF9F6" : "#171717";
}

function getCardBg(grad: string): string {
  const match = grad.match(/#([A-Fa-f0-9]{6})/);
  if (!match) return "bg-white/20";
  const hex = match[1];
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance < 0.5 ? "bg-white/15" : "bg-black/5";
}

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
  const gradText = getGradientTextColor(theme.grad);
  const cardBg = getCardBg(theme.grad);

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
            style={{ color: gradText }}
          >
            {formatThemeName(selected)}
          </h3>
          <p className="text-sm mt-1 opacity-70" style={{ color: gradText }}>
            {VIBES[selected]}
          </p>

          {/* Mini invite mock */}
          <div
            aria-hidden="true"
            className={`${cardBg} backdrop-blur-sm rounded-lg p-4 mt-6 mx-auto max-w-[200px] text-center w-full`}
          >
            <p className="font-display text-base" style={{ color: gradText }}>
              Priya &amp; Arjun
            </p>
            <p className="text-xs mt-1 opacity-80" style={{ color: gradText }}>
              Dec 14 · Jaipur
            </p>
          </div>
        </div>
      </div>

      {/* Swatch row */}
      <div className="flex overflow-x-auto gap-3 py-2 mt-6 md:justify-center md:gap-4 md:mt-8">
        {THEME_NAMES.map((name) => (
          <button
            key={name}
            type="button"
            onClick={() => setSelected(name)}
            aria-label={`Select ${formatThemeName(name)} theme`}
            aria-pressed={selected === name}
            className={`w-14 h-14 rounded-[var(--radius-md)] flex-shrink-0 cursor-pointer transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-charcoal/30 ${
              selected === name ? "ring-2 ring-charcoal ring-offset-2" : ""
            }`}
            style={{ background: THEMES[name].grad }}
          />
        ))}
      </div>
    </div>
  );
}
