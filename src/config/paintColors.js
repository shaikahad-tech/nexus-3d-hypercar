/**
 * paintColors.js — automotive paint color database.
 * Each color defines physical material properties for realistic
 * PBR rendering: metalness, roughness, clearcoat layers.
 *
 * Color categories: metallic, pearl, matte, candy, chrome.
 */
export const PAINT_COLORS = [
  // --- Metallic finishes ---
  { name: 'Inferno',        hex: 0xff3d2e, metalness: 0.90, roughness: 0.25, clearcoat: 1.0, category: 'metallic', flakeIntensity: 0.8 },
  { name: 'Abyss',          hex: 0x0a0f1a, metalness: 0.95, roughness: 0.12, clearcoat: 1.0, category: 'metallic', flakeIntensity: 0.6 },
  { name: 'Liquid Silver',  hex: 0xc8ccd0, metalness: 1.00, roughness: 0.08, clearcoat: 0.9, category: 'metallic', flakeIntensity: 1.0 },
  { name: 'Cobalt',         hex: 0x0044ff, metalness: 0.90, roughness: 0.20, clearcoat: 1.0, category: 'metallic', flakeIntensity: 0.7 },
  { name: 'Sunset',         hex: 0xff6b00, metalness: 0.90, roughness: 0.25, clearcoat: 1.0, category: 'metallic', flakeIntensity: 0.75 },
  { name: 'British Racing', hex: 0x1a3a1a, metalness: 0.85, roughness: 0.18, clearcoat: 1.0, category: 'metallic', flakeIntensity: 0.5 },
  { name: 'Tuscan Gold',    hex: 0xb8860b, metalness: 0.95, roughness: 0.15, clearcoat: 1.0, category: 'metallic', flakeIntensity: 0.9 },
  { name: 'Glacier Blue',   hex: 0xa0d8ef, metalness: 0.88, roughness: 0.10, clearcoat: 1.0, category: 'metallic', flakeIntensity: 0.8 },

  // --- Pearl finishes ---
  { name: 'Pearl White',    hex: 0xf0ebe0, metalness: 0.70, roughness: 0.15, clearcoat: 1.0, category: 'pearl', flakeIntensity: 0.3 },
  { name: 'Champagne',      hex: 0xe8d8b0, metalness: 0.65, roughness: 0.12, clearcoat: 1.0, category: 'pearl', flakeIntensity: 0.25 },
  { name: 'Pearl Black',    hex: 0x111318, metalness: 0.75, roughness: 0.10, clearcoat: 1.0, category: 'pearl', flakeIntensity: 0.4 },

  // --- Matte finishes ---
  { name: 'Stealth',        hex: 0x1a1d24, metalness: 0.80, roughness: 0.60, clearcoat: 0.3, category: 'matte', flakeIntensity: 0.0 },
  { name: 'Satin Grey',     hex: 0x6a6e75, metalness: 0.50, roughness: 0.55, clearcoat: 0.4, category: 'matte', flakeIntensity: 0.0 },
  { name: 'Desert Tan',     hex: 0xc2b280, metalness: 0.45, roughness: 0.65, clearcoat: 0.3, category: 'matte', flakeIntensity: 0.0 },

  // --- Candy finishes ---
  { name: 'Candy Red',      hex: 0xcc0033, metalness: 0.80, roughness: 0.08, clearcoat: 1.0, category: 'candy', flakeIntensity: 0.6 },
  { name: 'Candy Purple',   hex: 0x660099, metalness: 0.80, roughness: 0.08, clearcoat: 1.0, category: 'candy', flakeIntensity: 0.5 },

  // --- Chrome / special ---
  { name: 'Chrome',         hex: 0xe0e0e0, metalness: 1.00, roughness: 0.02, clearcoat: 0.5, category: 'chrome', flakeIntensity: 0.0 },
  { name: 'Gold Leaf',      hex: 0xffd700, metalness: 1.00, roughness: 0.05, clearcoat: 0.8, category: 'chrome', flakeIntensity: 0.0 },
];

/** Rim finish options */
export const RIM_FINISHES = [
  { name: 'Polished',  hex: 0xe8eaed, metalness: 1.0, roughness: 0.15 },
  { name: 'Gunmetal',  hex: 0x3a3d42, metalness: 0.9, roughness: 0.30 },
  { name: 'Bronze',    hex: 0xcd7f32, metalness: 0.95, roughness: 0.25 },
  { name: 'Matte Black', hex: 0x1a1a1a, metalness: 0.5, roughness: 0.6 },
  { name: 'Gold',      hex: 0xffd700, metalness: 1.0, roughness: 0.08 },
];

/** Caliper colors */
export const CALIPER_COLORS = [
  { name: 'Red',    hex: 0xff2020 },
  { name: 'Yellow', hex: 0xffd700 },
  { name: 'Orange', hex: 0xff6b00 },
  { name: 'Blue',   hex: 0x0066ff },
  { name: 'Black',  hex: 0x1a1a1a },
  { name: 'Carbon', hex: 0x2a2a2a },
];

export default PAINT_COLORS;
