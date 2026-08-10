/**
 * PostFX — post-processing pipeline using EffectComposer.
 * Bloom (selective glow), and SMAA edge anti-aliasing.
 * Intensity is state-driven so the UI can control bloom in real time.
 */
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { SMAAPass } from 'three/addons/postprocessing/SMAAPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import state from '../core/StateManager.js';

class PostFX {
  constructor(renderer, scene, camera) {
    this.renderer = renderer;
    this.scene = scene;
    this.camera = camera;
    this.enabled = true;
    this._build();
  }

  _build() {
    const size = new THREE.Vector2(window.innerWidth, window.innerHeight);
    this.composer = new EffectComposer(this.renderer);
    this.composer.addPass(new RenderPass(this.scene, this.camera));

    // Bloom — makes emissive lights and underglow pop
    this.bloomPass = new UnrealBloomPass(size, 0.6, 0.4, 0.85);
    this.composer.addPass(this.bloomPass);

    // SMAA — better edge quality than built-in MSAA for complex geometry
    this.smaaPass = new SMAAPass(size.x, size.y);
    this.composer.addPass(this.smaaPass);

    // Output (color space + tone mapping pass)
    this.outputPass = new OutputPass();
    this.composer.addPass(this.outputPass);

    this._syncState();
  }

  _syncState() {
    this.bloomPass.strength = state.get('bloomIntensity') ?? 0.6;
  }

  setBloom(v) {
    this.bloomPass.strength = v;
    state.set('bloomIntensity', v);
  }

  setSize(w, h) {
    this.composer.setSize(w, h);
    this.bloomPass.resolution.set(w, h);
  }

  render() {
    if (this.enabled) {
      this.composer.render();
    } else {
      this.renderer.render(this.scene, this.camera);
    }
  }

  dispose() {
    this.composer.dispose();
  }
}

export default PostFX;
