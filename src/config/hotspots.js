/**
 * hotspots.js — interactive info points on the car.
 * Clicking a hotspot moves the camera to a detail view and
 * shows information about that car component.
 *
 * Inspired by F1 Experience's interactive hotspots system.
 */
export const HOTSPOTS = [
  {
    id: 'powertrain',
    label: 'Powertrain',
    position: [0, 0.9, 0],
    cameraPreset: 'detailCabin',
    info: {
      title: 'Quad-Motor EV Powertrain',
      specs: [
        { label: 'Peak Power', value: '1,914 hp' },
        { label: 'Torque', value: '2,300 Nm' },
        { label: 'Motors', value: '4 (one per wheel)' },
        { label: 'Drivetrain', value: 'AWD with torque vectoring' },
        { label: '0-100 km/h', value: '1.78 seconds' },
      ],
      description: 'Four independent axial-flux motors provide instantaneous torque to each wheel, enabling millisecond-level torque vectoring for unprecedented cornering precision.',
    },
  },
  {
    id: 'aero-front',
    label: 'Front Splitter',
    position: [-2.1, 0.3, 0],
    cameraPreset: 'frontLow',
    info: {
      title: 'Active Front Splitter',
      specs: [
        { label: 'Material', value: 'Carbon Fiber' },
        { label: 'Downforce', value: '180 kg @ 250 km/h' },
        { label: 'Adjustable', value: 'Yes, electro-hydraulic' },
      ],
      description: 'The active front splitter automatically adjusts its angle based on speed and driving mode, channeling airflow under the car to reduce lift and increase front-end grip.',
    },
  },
  {
    id: 'aero-rear',
    label: 'Rear Wing',
    position: [2.0, 1.6, 0],
    cameraPreset: 'detailRearWing',
    info: {
      title: 'Adaptive Rear Wing',
      specs: [
        { label: 'Material', value: 'Carbon Fiber' },
        { label: 'Max Downforce', value: '850 kg @ 300 km/h' },
        { label: 'Modes', value: '3 (Comfort, Sport, Race)' },
        { label: 'DRS', value: 'Available in Race mode' },
      ],
      description: 'The adaptive rear wing features three deployment modes. In Race mode with DRS active, the wing flattens to reduce drag on straights, then returns to maximum angle under braking.',
    },
  },
  {
    id: 'wheels',
    label: 'Wheels & Brakes',
    position: [-1.55, 0.55, 1.0],
    cameraPreset: 'detailFrontWheel',
    info: {
      title: '5-Spoke Aero Wheels',
      specs: [
        { label: 'Rim', value: 'Forged Magnesium' },
        { label: 'Tire', value: 'Michelin Pilot Sport Cup 2' },
        { label: 'Brakes', value: 'Carbon Ceramic (410mm)' },
        { label: 'Calipers', value: '6-piston front / 4-piston rear' },
        { label: '100-0 km/h', value: '28 meters' },
      ],
      description: 'Forged magnesium wheels with aero-blade spokes reduce unsprung mass by 30% versus aluminum. The carbon ceramic brake system provides consistent stopping power without fade.',
    },
  },
  {
    id: 'battery',
    label: 'Battery',
    position: [0, 0.4, 0],
    cameraPreset: 'low',
    info: {
      title: 'Solid-State Battery',
      specs: [
        { label: 'Capacity', value: '128 kWh' },
        { label: 'Chemistry', value: 'Solid-State Lithium-Sulfur' },
        { label: 'Range (WLTP)', value: '720 km' },
        { label: 'Fast Charging', value: '15 min (10-80%)' },
        { label: 'Regen', value: '400 kW max' },
        { label: 'Warranty', value: '1,000 cycles / 10 years' },
      ],
      description: 'The solid-state battery pack uses lithium-sulfur cells with a solid ceramic electrolyte, eliminating liquid electrolyte fire risk while delivering 2x the energy density of conventional lithium-ion.',
    },
  },
  {
    id: 'cabin',
    label: 'Cabin',
    position: [0.1, 1.5, 0],
    cameraPreset: 'detailCabin',
    info: {
      title: 'Smart Glass Cabin',
      specs: [
        { label: 'Canopy', value: 'Electrochromic Smart Glass' },
        { label: 'HUD', value: 'Full-windshield AR display' },
        { label: 'Seats', value: 'Carbon shell with Alcantara' },
        { label: 'Controls', value: 'Steer-by-wire yoke' },
      ],
      description: 'The electrochromic canopy transitions from transparent to opaque in 0.3 seconds. A full-windshield AR HUD projects racing line, speed, and navigation directly onto the glass.',
    },
  },
];

export default HOTSPOTS;
