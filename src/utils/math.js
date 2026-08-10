/**
 * math.js — math helpers used across the project.
 * Includes lerp, clamp, easing functions, range mapping,
 * and random utilities with seeded random support.
 */

export const lerp = (a, b, t) => a + (b - a) * t;

export const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

export const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

export const easeInOutCubic = (t) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

export const easeInOutQuad = (t) =>
  t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

export const easeOutBack = (t) => {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
};

export const easeOutElastic = (t) => {
  const c4 = (2 * Math.PI) / 3;
  return t === 0 ? 0 : t === 1 ? 1 :
    Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
};

export const mapRange = (v, inMin, inMax, outMin, outMax) =>
  outMin + ((v - inMin) * (outMax - outMin)) / (inMax - inMin);

export const randomRange = (min, max) => Math.random() * (max - min) + min;

export const randomSign = () => (Math.random() > 0.5 ? 1 : -1);

export const randomInt = (min, max) => Math.floor(randomRange(min, max + 1));

export const randomChoice = (arr) => arr[Math.floor(Math.random() * arr.length)];

export const degToRad = (deg) => deg * (Math.PI / 180);

export const radToDeg = (rad) => rad * (180 / Math.PI);

export const clamp01 = (v) => clamp(v, 0, 1);

export const smoothstep = (edge0, edge1, x) => {
  const t = clamp01((x - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
};

export const smootherstep = (edge0, edge1, x) => {
  const t = clamp01((x - edge0) / (edge1 - edge0));
  return t * t * t * (t * (t * 6 - 15) + 10);
};

/** Seeded pseudo-random number generator (Mulberry32) */
export class SeededRandom {
  constructor(seed = Date.now()) {
    this.seed = seed >>> 0;
  }
  next() {
    let t = (this.seed += 0x6D2B79F5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
  range(min, max) { return min + this.next() * (max - min); }
  int(min, max) { return Math.floor(this.range(min, max + 1)); }
  sign() { return this.next() > 0.5 ? 1 : -1; }
  choice(arr) { return arr[Math.floor(this.next() * arr.length)]; }
}

/** Linear interpolation for THREE.Vector3 */
export const v3lerp = (a, b, t) => {
  return {
    x: lerp(a.x, b.x, t),
    y: lerp(a.y, b.y, t),
    z: lerp(a.z, b.z, t),
  };
};

/** Format a number with thousands separators */
export const formatNumber = (n) => n.toLocaleString('en-US');

/** Format a number to a fixed decimal with unit */
export const formatSpec = (value, unit = '', decimals = 0) => {
  const formatted = decimals > 0 ? value.toFixed(decimals) : Math.round(value).toString();
  return unit ? `${formatted} ${unit}` : formatted;
};

export default {
  lerp, clamp, clamp01, easeOutCubic, easeInOutCubic, easeInOutQuad,
  easeOutBack, easeOutElastic, mapRange, randomRange, randomSign,
  randomInt, randomChoice, degToRad, radToDeg, smoothstep, smootherstep,
  SeededRandom, v3lerp, formatNumber, formatSpec,
};
