/**
 * math.js — math helpers used across the project.
 */

export const lerp = (a, b, t) => a + (b - a) * t;

export const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

export const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

export const easeInOutQuad = (t) =>
  t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

export const mapRange = (v, inMin, inMax, outMin, outMax) =>
  outMin + ((v - inMin) * (outMax - outMin)) / (inMax - inMin);

export const randomRange = (min, max) => Math.random() * (max - min) + min;

export const randomSign = () => (Math.random() > 0.5 ? 1 : -1);

export default { lerp, clamp, easeOutCubic, easeInOutQuad, mapRange, randomRange, randomSign };
