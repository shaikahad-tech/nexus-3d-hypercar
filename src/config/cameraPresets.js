/**
 * cameraPresets.js — cinematic camera angle definitions.
 * Each preset defines a camera position, look-at target, and
 * transition duration. Inspired by PorscheLab's 8 camera angles
 * and the Mustang showcase's GSAP camera transitions.
 */
export const CAMERA_PRESETS = {
  hero: {
    id: 'hero',
    name: 'Hero',
    pos: [7.5, 3.2, 8.5],
    target: [0, 0.55, 0],
    duration: 1.2,
    fov: 42,
  },
  front: {
    id: 'front',
    name: 'Front',
    pos: [0, 2.0, 11.0],
    target: [0, 0.6, 0],
    duration: 1.0,
    fov: 38,
  },
  frontLow: {
    id: 'frontLow',
    name: 'Front Low',
    pos: [0, 0.3, 9.0],
    target: [0, 0.8, 0],
    duration: 1.0,
    fov: 28,
  },
  side: {
    id: 'side',
    name: 'Side',
    pos: [12.0, 1.8, 0.0],
    target: [0, 0.6, 0],
    duration: 1.0,
    fov: 35,
  },
  sideLow: {
    id: 'sideLow',
    name: 'Side Low',
    pos: [10.0, 0.4, 0.5],
    target: [0, 0.5, 0],
    duration: 1.0,
    fov: 30,
  },
  rear: {
    id: 'rear',
    name: 'Rear',
    pos: [0, 2.5, -10.0],
    target: [0, 0.7, 0],
    duration: 1.0,
    fov: 40,
  },
  rearHigh: {
    id: 'rearHigh',
    name: 'Rear High',
    pos: [0, 6.0, -8.0],
    target: [0, 0.5, 0],
    duration: 1.2,
    fov: 45,
  },
  top: {
    id: 'top',
    name: 'Top Down',
    pos: [0.1, 12.0, 0.1],
    target: [0, 0, 0],
    duration: 1.5,
    fov: 50,
  },
  low: {
    id: 'low',
    name: 'Ground',
    pos: [4.0, 0.3, 7.0],
    target: [0, 0.5, 0],
    duration: 1.0,
    fov: 32,
  },
  detailFrontWheel: {
    id: 'detailFrontWheel',
    name: 'Front Wheel',
    pos: [-2.5, 0.5, 3.0],
    target: [-1.55, 0.55, 1.0],
    duration: 0.8,
    fov: 25,
  },
  detailRearWing: {
    id: 'detailRearWing',
    name: 'Rear Wing',
    pos: [2.5, 2.0, -2.0],
    target: [2.0, 1.5, 0],
    duration: 0.8,
    fov: 25,
  },
  detailCabin: {
    id: 'detailCabin',
    name: 'Cabin',
    pos: [0, 2.0, 3.5],
    target: [0.1, 1.5, 0],
    duration: 0.8,
    fov: 28,
  },
};

export const CAMERA_PRESET_LIST = Object.values(CAMERA_PRESETS);

/** Cinematic demo sequence — a series of preset transitions */
export const CINEMATIC_SEQUENCE = [
  { preset: 'hero',          hold: 3.0 },
  { preset: 'frontLow',      hold: 2.5 },
  { preset: 'side',          hold: 2.5 },
  { preset: 'detailFrontWheel', hold: 2.0 },
  { preset: 'rearHigh',      hold: 2.5 },
  { preset: 'detailRearWing', hold: 2.0 },
  { preset: 'top',           hold: 2.5 },
  { preset: 'low',            hold: 2.0 },
  { preset: 'hero',          hold: 3.0 },
];

export default CAMERA_PRESETS;
