/**
 * Environment — wraps the AssetLoader's procedural gradient env map
 * and assigns it to the scene + material library for reflections.
 * Supports smooth transitions between scene mode environments.
 */
import * as THREE from 'three';
import bus from '../core/EventBus.js';
import matLib from '../materials/MaterialLibrary.js';
import { SCENE_MODES } from '../config/sceneModes.js';

class Environment {
  constructor(scene, renderer, loader) {
    this.scene = scene;
    this.renderer = renderer;
    this.loader = loader;
    this.texture = null;
    this.textures = new Map(); // cache per scene mode

    bus.on('sceneMode:change', (mode) => this.switchEnvironment(mode));
  }

  async load(config) {
    const manifest = {
      env: {
        type: 'envGradient',
        colors: config || SCENE_MODES.studio.sky,
      },
    };

    const results = await this.loader.loadAll(manifest);
    this.texture = results.env;

    if (this.texture) {
      this.scene.environment = this.texture;
      matLib.setEnvMap(this.texture);
      this.textures.set('studio', this.texture);
      bus.emit('env:loaded', this.texture);
    }

    return this.texture;
  }

  async switchEnvironment(mode) {
    // Check cache
    if (this.textures.has(mode.id)) {
      this._applyEnv(this.textures.get(mode.id));
      return;
    }

    // Generate new env map for this mode
    const manifest = {
      env: {
        type: 'envGradient',
        colors: mode.sky,
      },
    };

    const results = await this.loader.loadAll(manifest);
    const tex = results.env;

    if (tex) {
      this.textures.set(mode.id, tex);
      this._applyEnv(tex);
    }
  }

  _applyEnv(tex) {
    if (this.texture && this.texture !== tex) {
      this.texture.dispose();
    }
    this.texture = tex;
    this.scene.environment = tex;
    matLib.setEnvMap(tex);
    bus.emit('env:switched', tex);
  }

  dispose() {
    this.textures.forEach(tex => tex.dispose());
    this.textures.clear();
    this.scene.environment = null;
  }
}

export default Environment;
