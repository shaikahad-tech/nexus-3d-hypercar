/**
 * Environment — wraps the AssetLoader's procedural gradient env map
 * and assigns it to the scene + material library for reflections.
 */
import bus from '../core/EventBus.js';
import matLib from '../materials/MaterialLibrary.js';

class Environment {
  constructor(scene, renderer, loader) {
    this.scene = scene;
    this.renderer = renderer;
    this.loader = loader;
    this.texture = null;
  }

  async load(config) {
    const manifest = {
      env: {
        type: 'envGradient',
        colors: config || {
          top: 0x1a2438, mid: 0x0c1018, bot: 0x050608, accent: 0xff3d2e,
        },
      },
    };

    const results = await this.loader.loadAll(manifest);
    this.texture = results.env;

    if (this.texture) {
      this.scene.environment = this.texture;
      matLib.setEnvMap(this.texture);
      bus.emit('env:loaded', this.texture);
    }

    return this.texture;
  }

  dispose() {
    if (this.texture) {
      this.texture.dispose();
      this.scene.environment = null;
    }
  }
}

export default Environment;
