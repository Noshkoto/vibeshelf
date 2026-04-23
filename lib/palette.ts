import type { CoverPalette } from "./types";

export interface PaletteColors {
  bg: string;
  ink: string;
  accent: string;
  shadow: string;
}

export const PALETTES: Record<CoverPalette, PaletteColors> = {
  citrus: { bg: "#D4FF3B", ink: "#0B0B0A", accent: "#FF5B2E", shadow: "#B4DC27" },
  dusk: { bg: "#3B2F55", ink: "#F4EAD5", accent: "#FFB26B", shadow: "#251B3C" },
  menthol: { bg: "#CFEDDD", ink: "#0B2C1E", accent: "#1A6F45", shadow: "#9FCBB4" },
  ember: { bg: "#1A0F0B", ink: "#F4EAD5", accent: "#FF5B2E", shadow: "#3C1E12" },
  concrete: { bg: "#BEB6A4", ink: "#1D1B16", accent: "#D4FF3B", shadow: "#8C866F" },
  bloom: { bg: "#F7C7D0", ink: "#3A1720", accent: "#6E1F3E", shadow: "#D89AA6" },
  ocean: { bg: "#0B1F3A", ink: "#DFEAF7", accent: "#56C1FF", shadow: "#04101E" },
  saffron: { bg: "#F5A623", ink: "#2A1A04", accent: "#0B0B0A", shadow: "#B67B12" },
  violet: { bg: "#2B1449", ink: "#E8D4FF", accent: "#D4FF3B", shadow: "#180825" },
  graphite: { bg: "#1D1D1B", ink: "#F4EAD5", accent: "#9AA38B", shadow: "#0E0E0C" },
  lilac: { bg: "#D9CFF2", ink: "#231142", accent: "#FF5B2E", shadow: "#A697C7" },
  mint: { bg: "#B6E4C3", ink: "#0B2C1E", accent: "#FF8A3D", shadow: "#7FB295" },
};
