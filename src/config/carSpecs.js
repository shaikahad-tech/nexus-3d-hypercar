/**
 * carSpecs.js — Aether GT vehicle specifications
 * Single source of truth for all car data displayed in the UI and
 * consumed by the CarBuilder for proportions.
 */
export const CAR_SPECS = {
  identity: {
    name: "Aether GT",
    codename: "NEXUS-3D",
    year: 2032,
    version: "4.1.0",
    tagline: "Quad-Motor Hypercar Concept",
  },
  performance: {
    power: { value: 1914, unit: "hp" },
    torque: { value: 2300, unit: "Nm" },
    accel: { value: 1.78, unit: "s", label: "0-100 km/h" },
    topSpeed: { value: 412, unit: "km/h" },
    rpm: { base: 8200, variance: 200 },
  },
  powertrain: {
    type: "Quad-Motor EV",
    battery: { value: 128, unit: "kWh solid-state" },
    range: { value: 720, unit: "km" },
  },
  aero: {
    drag: { value: 0.19, unit: "Cd" },
    chassis: "Carbon MonoCoque",
    downforce: { value: 850, unit: "kg @ 300km/h" },
  },
};

/** Car geometric proportions (world-space units) */
export const CAR_DIMENSIONS = {
  length: 4.4,
  width: 2.0,
  bodyHeight: 0.7,
  rideHeight: 0.55,
  wheelRadius: 0.55,
  wheelWidth: 0.28,
  wheelbase: 3.2,
  trackWidth: 1.0,
  frontOverhang: 0.95,
  rearOverhang: 1.0,
};

/** Paint color palette */
export const PAINT_COLORS = [
  { name: "Inferno",        hex: 0xff3d2e, metalness: 0.90, roughness: 0.25, clearcoat: 1.0 },
  { name: "Abyss",          hex: 0x0a0f1a, metalness: 0.95, roughness: 0.12, clearcoat: 1.0 },
  { name: "Liquid Silver",  hex: 0xc8ccd0, metalness: 1.00, roughness: 0.08, clearcoat: 0.9 },
  { name: "Poison",         hex: 0x39ff14, metalness: 0.85, roughness: 0.30, clearcoat: 1.0 },
  { name: "Cobalt",         hex: 0x0044ff, metalness: 0.90, roughness: 0.20, clearcoat: 1.0 },
  { name: "Sunset",         hex: 0xff6b00, metalness: 0.90, roughness: 0.25, clearcoat: 1.0 },
  { name: "Pearl",          hex: 0xf0ebe0, metalness: 0.70, roughness: 0.15, clearcoat: 1.0 },
  { name: "Stealth",        hex: 0x1a1d24, metalness: 0.80, roughness: 0.60, clearcoat: 0.3 },
];

export default CAR_SPECS;
