"use client";

import {
  useEffect,
  useState,
  createContext,
  useContext,
  type ReactNode,
} from "react";
import { BRAND_PALETTES, ACTIVE_BRAND, type BrandName } from "@/lib/brand";

interface BrandContextValue {
  brandName: BrandName;
  setBrand: (name: BrandName) => void;
}

const BrandContext = createContext<BrandContextValue>({
  brandName: ACTIVE_BRAND,
  setBrand: () => {},
});

export function useBrand(): BrandContextValue {
  return useContext(BrandContext);
}

export function BrandProvider({ children }: { children: ReactNode }) {
  const [brandName, setBrandName] = useState<BrandName>(ACTIVE_BRAND);

  useEffect(() => {
    const p = BRAND_PALETTES[brandName];
    const root = document.documentElement;
    root.style.setProperty("--brand-primary", p.primary);
    root.style.setProperty("--brand-light", p.light);
    root.style.setProperty("--brand-lighter", p.lighter);
    root.style.setProperty("--brand-text", p.text);
  }, [brandName]);

  return (
    <BrandContext.Provider value={{ brandName, setBrand: setBrandName }}>
      {children}
    </BrandContext.Provider>
  );
}
