export const BRAND_PALETTES = {
  plum: {
    primary: '#7C2D6E',
    light: '#A855A0',
    lighter: '#F3E8F1',
    text: '#ffffff',
    name: 'Deep Plum',
  },
  wine: {
    primary: '#7F1D1D',
    light: '#B91C1C',
    lighter: '#FEE2E2',
    text: '#ffffff',
    name: 'Burgundy Wine',
  },
  sapphire: {
    primary: '#1E3A5F',
    light: '#2563EB',
    lighter: '#E6F1FB',
    text: '#ffffff',
    name: 'Sapphire',
  },
  teal: {
    primary: '#0F766E',
    light: '#14B8A6',
    lighter: '#E1F5EE',
    text: '#ffffff',
    name: 'Emerald Teal',
  },
} as const;

export type BrandName = keyof typeof BRAND_PALETTES;

export function getActiveBrand(): BrandName {
  const envBrand = process.env.NEXT_PUBLIC_BRAND;
  if (envBrand && envBrand in BRAND_PALETTES) {
    return envBrand as BrandName;
  }
  return 'plum';
}

export const ACTIVE_BRAND: BrandName = getActiveBrand();

export const brand = BRAND_PALETTES[ACTIVE_BRAND];
