/**
 * StateManager — centralized reactive state with change notifications.
 * Components read/write state through this single object; mutations
 * fire change events on the EventBus so subscribers can react.
 *
 * Supports dot-path access (e.g. state.get('scene.ready')),
 * deep cloning for immutability, and a reset() method that
 * restores the initial state.
 */
import bus from './EventBus.js';

const initialState = {
  // Active configuration
  activeColorIndex: 0,
  activeRimIndex: 0,
  activeCaliperIndex: 0,
  activeVehicleIndex: 0,
  activeSceneMode: 'studio',

  // Toggle states
  lightsOn: true,
  underglowOn: true,
  autoRotate: false,
  floorVisible: true,
  particlesVisible: true,
  hotspotsVisible: false,
  cinematicMode: false,
  physicsEnabled: true,
  audioEnabled: false,

  // Render quality
  bloomIntensity: 0.6,
  shadowsEnabled: true,
  pixelRatio: null, // null = auto

  // Camera
  cameraMode: 'orbit',
  activePreset: 'hero',

  // Scene lifecycle
  scene: {
    ready: false,
    carLoaded: false,
    assetsLoaded: false,
  },

  // Active paint properties (mirrored from config for quick access)
  paint: {
    color: 0xff3d2e,
    metalness: 0.9,
    roughness: 0.25,
    clearcoat: 1.0,
    category: 'metallic',
  },

  // UI state
  ui: {
    hotspotPanelOpen: false,
    activeHotspot: null,
    loadingProgress: 0,
  },
};

class StateManager {
  constructor(initial) {
    this._initialState = JSON.parse(JSON.stringify(initial));
    this._state = JSON.parse(JSON.stringify(initial));
  }

  get(path) {
    if (!path) return this._state;
    const keys = path.split('.');
    let ref = this._state;
    for (const k of keys) {
      if (ref == null) return undefined;
      ref = ref[k];
    }
    return ref;
  }

  set(path, value) {
    const keys = path.split('.');
    let ref = this._state;
    for (let i = 0; i < keys.length - 1; i++) {
      if (ref[keys[i]] == null) ref[keys[i]] = {};
      ref = ref[keys[i]];
    }
    const key = keys[keys.length - 1];
    if (ref[key] === value) return;
    ref[key] = value;
    bus.emit(`state:change:${path}`, value);
    bus.emit('state:change', { path, value });
  }

  mutate(path, fn) {
    this.set(path, fn(this.get(path)));
  }

  toggle(path) {
    this.set(path, !this.get(path));
  }

  /** Cycle through an array value at a given path */
  cycle(path, values) {
    const current = this.get(path);
    const idx = values.indexOf(current);
    const next = values[(idx + 1) % values.length];
    this.set(path, next);
    return next;
  }

  reset() {
    this._state = JSON.parse(JSON.stringify(this._initialState));
    bus.emit('state:reset');
  }

  /** Serialize current state to JSON (for save/share) */
  serialize() {
    return JSON.stringify({
      activeColorIndex: this._state.activeColorIndex,
      activeRimIndex: this._state.activeRimIndex,
      activeCaliperIndex: this._state.activeCaliperIndex,
      activeVehicleIndex: this._state.activeVehicleIndex,
      activeSceneMode: this._state.activeSceneMode,
      lightsOn: this._state.lightsOn,
      underglowOn: this._state.underglowOn,
      autoRotate: this._state.autoRotate,
      floorVisible: this._state.floorVisible,
    });
  }

  /** Restore state from JSON string */
  deserialize(json) {
    try {
      const data = JSON.parse(json);
      Object.entries(data).forEach(([key, value]) => {
        this.set(key, value);
      });
      return true;
    } catch (e) {
      console.error('[StateManager] failed to deserialize:', e);
      return false;
    }
  }
}

export const state = new StateManager(initialState);
export default state;
