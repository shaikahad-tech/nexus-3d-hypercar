/**
 * SceneModeManager — manages environment / lighting presets.
 * Switches between studio, day, sunset, night, and cyberpunk
 * modes by coordinating the LightingRig, Environment, PostFX,
 * and floor material transitions.
 *
 * Inspired by 3D-Car-Viewing's studio/day/night scene switching
 * and PorscheLab's 8 HDRI environment presets.
 */
import bus from '../core/EventBus.js';
import state from '../core/StateManager.js';
import { SCENE_MODES, SCENE_MODE_LIST } from '../config/sceneModes.js';

class SceneModeManager {
  constructor(sceneMgr, lighting, environment, postfx, floor) {
    this.sceneMgr = sceneMgr;
    this.lighting = lighting;
    this.environment = environment;
    this.postfx = postfx;
    this.floor = floor;
    this.currentMode = SCENE_MODES.studio;
    this._bindEvents();
  }

  _bindEvents() {
    bus.on('scene:set', (modeId) => this.setMode(modeId));
    bus.on('scene:next', () => this.nextMode());
    bus.on('scene:prev', () => this.prevMode());
  }

  setMode(modeId) {
    const mode = SCENE_MODES[modeId];
    if (!mode || modeId === this.currentMode.id) return;

    this.currentMode = mode;
    state.set('activeSceneMode', modeId);

    // Transition fog
    if (this.sceneMgr.scene.fog) {
      this.sceneMgr.scene.fog.color.setHex(mode.fog.color);
      this.sceneMgr.scene.fog.density = mode.fog.density;
    }

    // Transition lighting
    this.lighting.transitionTo(mode.lights, 1.5);

    // Transition environment map
    this.environment.switchEnvironment(mode);

    // Transition bloom
    this.postfx.setBloom(mode.bloom.strength);
    this.postfx.setVignette(1.0, mode.id === 'night' ? 0.8 : 0.4);

    // Transition exposure
    this.sceneMgr.setExposure(mode.exposure);

    // Transition floor
    if (this.floor) {
      this.floor.transitionTo(mode.floor);
    }

    bus.emit('sceneMode:change', mode);
  }

  nextMode() {
    const ids = SCENE_MODE_LIST.map(m => m.id);
    const idx = ids.indexOf(this.currentMode.id);
    const next = ids[(idx + 1) % ids.length];
    this.setMode(next);
  }

  prevMode() {
    const ids = SCENE_MODE_LIST.map(m => m.id);
    const idx = ids.indexOf(this.currentMode.id);
    const prev = ids[(idx - 1 + ids.length) % ids.length];
    this.setMode(prev);
  }

  getMode() {
    return this.currentMode;
  }

  getModeList() {
    return SCENE_MODE_LIST;
  }
}

export default SceneModeManager;
