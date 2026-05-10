"use client";

import { BRAND_PALETTES, type BrandName } from "@/lib/brand";
import { useBrand } from "./brand-provider";

const NAMES = Object.keys(BRAND_PALETTES) as BrandName[];

export function BrandSwitcher() {
  const { brandName, setBrand } = useBrand();

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-surface/90 backdrop-blur-md border border-border rounded-full px-3 py-2 shadow-lg">
      {NAMES.map((name) => (
        <button
          key={name}
          type="button"
          onClick={() => setBrand(name)}
          aria-label={`Switch to ${BRAND_PALETTES[name].name}`}
          aria-pressed={brandName === name}
          className={`w-6 h-6 rounded-full transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
            brandName === name
              ? "ring-2 ring-charcoal ring-offset-2 scale-110"
              : "hover:scale-105"
          }`}
          style={{ backgroundColor: BRAND_PALETTES[name].primary }}
        />
      ))}
    </div>
  );
}
