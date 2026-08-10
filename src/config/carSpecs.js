/**
 * carSpecs.js — Multi-vehicle specification database.
 * Single source of truth for all car data. Supports multiple
 * vehicle variants with different performance characteristics,
 * dimensions, and visual proportions.
 *
 * Inspired by PorscheLab's multi-model lineup and the Mustang
 * showcase's generational variants.
 */

export const VEHICLE_VARIANTS = [
  {
    id: 'aether-gt',
    name: 'Aether GT',
    codename: 'NEXUS-3D',
    year: 2032,
    version: '4.1.0',
    tagline: 'Quad-Motor Hypercar Concept',
    category: 'Hypercar',
    performance: {
      power:      { value: 1914, unit: 'hp' },
      torque:     { value: 2300, unit: 'Nm' },
      accel:      { value: 1.78, unit: 's', label: '0-100 km/h' },
      topSpeed:   { value: 412, unit: 'km/h' },
      rpm:        { base: 8200, variance: 200, redline: 9000 },
      weight:     { value: 1650, unit: 'kg' },
      powerToWeight: { value: 1160, unit: 'hp/ton' },
      braking:    { value: 28, unit: 'm', label: '100-0 km/h' },
      lateral:    { value: 1.8, unit: 'g', label: 'lateral accel' },
    },
    powertrain: {
      type: 'Quad-Motor EV',
      motors: 4,
      drivetrain: 'AWD',
      battery:    { value: 128, unit: 'kWh solid-state' },
      range:      { value: 720, unit: 'km' },
      charging:   { value: 15, unit: 'min 10-80%' },
      regen:      { value: 400, unit: 'kW max' },
    },
    aero: {
      drag:       { value: 0.19, unit: 'Cd' },
      lift:       { value: -850, unit: 'kg @ 300km/h' },
      chassis:    'Carbon MonoCoque',
      downforce:  { value: 850, unit: 'kg @ 300km/h' },
      frontal:    { value: 1.92, unit: 'm²' },
    },
    dimensions: {
      length: 4.4, width: 2.0, bodyHeight: 0.7, rideHeight: 0.55,
      wheelRadius: 0.55, wheelWidth: 0.28, wheelbase: 3.2,
      trackWidth: 1.0, frontOverhang: 0.95, rearOverhang: 1.0,
      roofHeight: 1.2, groundClearance: 0.12,
    },
  },
  {
    id: 'phantom-r',
    name: 'Phantom R',
    codename: 'NEXUS-3D',
    year: 2032,
    version: '4.1.0',
    tagline: 'Track-Focused Performance EV',
    category: 'Track',
    performance: {
      power:      { value: 1200, unit: 'hp' },
      torque:     { value: 1400, unit: 'Nm' },
      accel:      { value: 2.1, unit: 's', label: '0-100 km/h' },
      topSpeed:   { value: 350, unit: 'km/h' },
      rpm:        { base: 7500, variance: 150, redline: 8500 },
      weight:     { value: 1420, unit: 'kg' },
      powerToWeight: { value: 845, unit: 'hp/ton' },
      braking:    { value: 31, unit: 'm', label: '100-0 km/h' },
      lateral:    { value: 1.95, unit: 'g', label: 'lateral accel' },
    },
    powertrain: {
      type: 'Twin-Motor EV',
      motors: 2,
      drivetrain: 'RWD',
      battery:    { value: 95, unit: 'kWh solid-state' },
      range:      { value: 480, unit: 'km' },
      charging:   { value: 18, unit: 'min 10-80%' },
      regen:      { value: 350, unit: 'kW max' },
    },
    aero: {
      drag:       { value: 0.24, unit: 'Cd' },
      lift:       { value: -1200, unit: 'kg @ 250km/h' },
      chassis:    'Carbon MonoCoque',
      downforce:  { value: 1200, unit: 'kg @ 250km/h' },
      frontal:    { value: 1.88, unit: 'm²' },
    },
    dimensions: {
      length: 4.2, width: 1.95, bodyHeight: 0.65, rideHeight: 0.48,
      wheelRadius: 0.52, wheelWidth: 0.30, wheelbase: 2.85,
      trackWidth: 0.98, frontOverhang: 0.85, rearOverhang: 0.90,
      roofHeight: 1.1, groundClearance: 0.09,
    },
  },
  {
    id: 'vortex-s',
    name: 'Vortex S',
    codename: 'NEXUS-3D',
    year: 2032,
    version: '4.1.0',
    tagline: 'Luxury Grand Tourer',
    category: 'GT',
    performance: {
      power:      { value: 850, unit: 'hp' },
      torque:     { value: 1100, unit: 'Nm' },
      accel:      { value: 3.2, unit: 's', label: '0-100 km/h' },
      topSpeed:   { value: 300, unit: 'km/h' },
      rpm:        { base: 6800, variance: 100, redline: 7800 },
      weight:     { value: 1950, unit: 'kg' },
      powerToWeight: { value: 436, unit: 'hp/ton' },
      braking:    { value: 34, unit: 'm', label: '100-0 km/h' },
      lateral:    { value: 1.3, unit: 'g', label: 'lateral accel' },
    },
    powertrain: {
      type: 'Dual-Motor EV',
      motors: 2,
      drivetrain: 'AWD',
      battery:    { value: 110, unit: 'kWh solid-state' },
      range:      { value: 650, unit: 'km' },
      charging:   { value: 20, unit: 'min 10-80%' },
      regen:      { value: 300, unit: 'kW max' },
    },
    aero: {
      drag:       { value: 0.22, unit: 'Cd' },
      lift:       { value: -400, unit: 'kg @ 250km/h' },
      chassis:    'Aluminum Space Frame',
      downforce:  { value: 400, unit: 'kg @ 250km/h' },
      frontal:    { value: 2.1, unit: 'm²' },
    },
    dimensions: {
      length: 4.8, width: 2.05, bodyHeight: 0.75, rideHeight: 0.60,
      wheelRadius: 0.58, wheelWidth: 0.26, wheelbase: 3.4,
      trackWidth: 1.02, frontOverhang: 1.05, rearOverhang: 1.10,
      roofHeight: 1.35, groundClearance: 0.15,
    },
  },
];

export const ACTIVE_VARIANT = VEHICLE_VARIANTS[0];

export const CAR_SPECS = ACTIVE_VARIANT;

export const CAR_DIMENSIONS = ACTIVE_VARIANT.dimensions;

export default VEHICLE_VARIANTS;
