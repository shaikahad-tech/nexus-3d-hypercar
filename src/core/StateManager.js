/**
 * StateManager — centralized reactive state with change notifications.
 * Components read/write state through this single object; mutations
 * fire change events on the EventBus so subscribers can react.
 */
import bus from './EventBus.js';

const initialState = {
  activeColorIndex: 0,
  lightsOn: true,
  underglowOn: true,
  autoRotate: false,
  floorVisible: true,
  bloomIntensity: 0.6,
  cameraMode: 'orbit', // 'orbit' | 'cinematic'
  scene: {
    ready: false,
    carLoaded: false,
  },
  paint: {
    color: 0xff3d2e,
    metalness: 0.9,
    roughness: 0.25,
    clearcoat: 1.0,
  },
};

class StateManager {
  constructor(initial) {
    this._state = structuredClone(initial);
    this._listeners = new Map();
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

  reset() {
    this._state = structuredClone(initialState);
    bus.emit('state:reset');
  }
}

export const state = new StateManager(initialState);
export default state;
