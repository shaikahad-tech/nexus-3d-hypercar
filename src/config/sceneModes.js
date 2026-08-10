/**
 * sceneModes.js — environment presets for different lighting moods.
 * Inspired by 3D-Car-Viewing's studio/day/night scene switching
 * and PorscheLab's 8 HDRI environment presets.
 *
 * Each mode defines: sky colors, fog, light intensities, floor
 * material properties, and ambient atmosphere.
 */
export const SCENE_MODES = {
  studio: {
    id: 'studio',
    name: 'Studio',
    icon: 'studio',
    sky: { top: 0x1a2438, mid: 0x0c1018, bot: 0x050608, accent: 0xff3d2e },
    fog: { color: 0x08090c, density: 0.018 },
    lights: {
      hemi:   { sky: 0x4a5a7a, ground: 0x0a0c10, intensity: 0.55 },
      key:    { color: 0xffffff, intensity: 2.4, pos: [8, 12, 6] },
      rim:    { color: 0x00d9ff, intensity: 1.6, pos: [-7, 5, -8] },
      fill:   { color: 0xff3d2e, intensity: 0.7, pos: [-4, 3, 8] },
      spot:   { color: 0xffffff, intensity: 120, pos: [0, 14, 0] },
    },
    floor: { color: 0x0a0c10, metalness: 0.6, roughness: 0.4, reflectivity: 0.3 },
    ring:  { color: 0xff3d2e, opacity: 0.6, pulse: true },
    grid:  { visible: true, opacity: 0.3 },
    bloom: { strength: 0.6, threshold: 0.85 },
    exposure: 1.15,
  },

  day: {
    id: 'day',
    name: 'Daylight',
    icon: 'sun',
    sky: { top: 0x4a90d9, mid: 0x87ceeb, bot: 0xb0c4de, accent: 0xffd700 },
    fog: { color: 0x87ceeb, density: 0.005 },
    lights: {
      hemi:   { sky: 0x87ceeb, ground: 0x3a5f3a, intensity: 1.2 },
      key:    { color: 0xfff4e0, intensity: 3.0, pos: [10, 15, 5] },
      rim:    { color: 0x87ceeb, intensity: 0.8, pos: [-8, 6, -6] },
      fill:   { color: 0xffffff, intensity: 0.5, pos: [0, 5, 10] },
      spot:   { color: 0xfff4e0, intensity: 0, pos: [0, 14, 0] },
    },
    floor: { color: 0x2a3a2a, metalness: 0.2, roughness: 0.8, reflectivity: 0.1 },
    ring:  { color: 0xffd700, opacity: 0.3, pulse: false },
    grid:  { visible: false, opacity: 0 },
    bloom: { strength: 0.3, threshold: 0.95 },
    exposure: 1.3,
  },

  sunset: {
    id: 'sunset',
    name: 'Sunset',
    icon: 'sunset',
    sky: { top: 0x1a1a3e, mid: 0x4a1a5a, bot: 0x8b2a3a, accent: 0xff6b00 },
    fog: { color: 0x4a1a2a, density: 0.012 },
    lights: {
      hemi:   { sky: 0x8b2a3a, ground: 0x2a1a1a, intensity: 0.8 },
      key:    { color: 0xff8c42, intensity: 2.8, pos: [12, 4, -2] },
      rim:    { color: 0x4a1a5a, intensity: 1.2, pos: [-6, 8, -8] },
      fill:   { color: 0xff6b00, intensity: 1.0, pos: [-4, 3, 8] },
      spot:   { color: 0xff8c42, intensity: 60, pos: [0, 14, 0] },
    },
    floor: { color: 0x1a1a2a, metalness: 0.4, roughness: 0.5, reflectivity: 0.2 },
    ring:  { color: 0xff6b00, opacity: 0.5, pulse: true },
    grid:  { visible: true, opacity: 0.15 },
    bloom: { strength: 0.8, threshold: 0.7 },
    exposure: 1.25,
  },

  night: {
    id: 'night',
    name: 'Night',
    icon: 'moon',
    sky: { top: 0x05080f, mid: 0x0a0e18, bot: 0x030406, accent: 0x00d9ff },
    fog: { color: 0x030406, density: 0.025 },
    lights: {
      hemi:   { sky: 0x1a2a3a, ground: 0x050608, intensity: 0.2 },
      key:    { color: 0x4a90d9, intensity: 0.8, pos: [5, 10, 5] },
      rim:    { color: 0x00d9ff, intensity: 2.5, pos: [-8, 4, -6] },
      fill:   { color: 0x6a4aff, intensity: 0.6, pos: [6, 3, -4] },
      spot:   { color: 0xffffff, intensity: 200, pos: [0, 16, 0] },
    },
    floor: { color: 0x05080a, metalness: 0.8, roughness: 0.2, reflectivity: 0.6 },
    ring:  { color: 0x00d9ff, opacity: 0.8, pulse: true },
    grid:  { visible: true, opacity: 0.5 },
    bloom: { strength: 1.2, threshold: 0.6 },
    exposure: 0.95,
  },

  cyberpunk: {
    id: 'cyberpunk',
    name: 'Cyberpunk',
    icon: 'neon',
    sky: { top: 0x1a0033, mid: 0x2d0a3d, bot: 0x0d011a, accent: 0xff00aa },
    fog: { color: 0x1a0033, density: 0.020 },
    lights: {
      hemi:   { sky: 0xff00aa, ground: 0x0d011a, intensity: 0.4 },
      key:    { color: 0xff00aa, intensity: 1.5, pos: [6, 10, 4] },
      rim:    { color: 0x00ffff, intensity: 3.0, pos: [-7, 6, -7] },
      fill:   { color: 0xff6b00, intensity: 1.0, pos: [4, 3, 8] },
      spot:   { color: 0xff00aa, intensity: 150, pos: [0, 14, 0] },
    },
    floor: { color: 0x0a0014, metalness: 0.9, roughness: 0.1, reflectivity: 0.7 },
    ring:  { color: 0xff00aa, opacity: 0.9, pulse: true },
    grid:  { visible: true, opacity: 0.7 },
    bloom: { strength: 1.5, threshold: 0.5 },
    exposure: 1.1,
  },
};

export const SCENE_MODE_LIST = Object.values(SCENE_MODES);

export default SCENE_MODES;
