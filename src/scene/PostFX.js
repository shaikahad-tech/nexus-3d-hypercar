/**
 * PostFX — post-processing pipeline using EffectComposer.
 * Bloom (selective glow), SMAA (edge anti-aliasing), Vignette,
 * and OutputPass (tone mapping + color space).
 *
 * If post-processing fails to initialize, it falls back to
 * direct renderer.render() so the app still works.
 */
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { SMAAPass } from 'three/addons/postprocessing/SMAAPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import state from '../core/StateManager.js';
import bus from '../core/EventBus.js';
import { lerp } from '../utils/math.js';

// Custom vignette shader
const VignetteShader = {
  uniforms: {
    tDiffuse: { value: null },
    offset: { value: 1.0 },
    darkness: { value: 1.0 },
  },
  vertexShader: /* glsl */`
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: /* glsl */
    uniform sampler2D tDiffuse;
    uniform float offset;
    uniform float darkness;
    varying vec2 vUv;
    void main() {
      vec4 texel = texture2D(tDiffuse, vUv);
      vec2 uv = (vUv - vec2(0.5)) * vec2(offset);
      gl_FragColor = vec4(mix(texel.rgb, vec3(1.0), dot(uv, uv)), texel.w);
      gl_FragColor.rgb *= 1.0 - dot(uv, uv) * darkness;
    }
  `,
};

class PostFX {
  constructor(renderer, scene, camera) {
    this.renderer = renderer;
    this.scene = scene;
    this.camera = camera;
    this.enabled = false; // Start disabled, enable if build succeeds
    this._targetBloom = 0.6;
    this._currentBloom = 0.6;
    this.composer = null;

    try {
      this._build();
      this._bindEvents();
      this.enabled = true;
      console.log('[PostFX] Post-processing pipeline initialized successfully');
    } catch (err) {
      console.warn('[PostFX] Failed to initialize post-processing, falling back to direct render:', err);
      this.enabled = false;
    }
  }

  _build() {
    const size = new THREE.Vector2(window.innerWidth, window.innerHeight);
    this.composer = new EffectComposer(this.renderer);
    this.composer.addPass(new RenderPass(this.scene, this.camera));

    // Bloom
    this.bloomPass = new UnrealBloomPass(size, 0.6, 0.4, 0.85);
    this.composer.addPass(this.bloomPass);

    // Vignette
    this.vignettePass = new ShaderPass(VignetteShader);
    this.vignettePass.uniforms.offset.value = 1.0;
    this.vignettePass.uniforms.darkness.value = 0.5;
    this.composer.addPass(this.vignettePass);

    // SMAA
    this.smaaPass = new SMAAPass(size.x, size.y);
    this.composer.addPass(this.smaaPass);

    // Output
    this.outputPass = new OutputPass();
    this.composer.addPass(this.outputPass);

    this._syncState();
  }

  _bindEvents() {
    bus.on('scene:resize', ({ width, height }) => {
      this.setSize(width, height);
    });
    bus.on('sceneMode:change', (mode) => {
      this._targetBloom = mode.bloom.strength;
    });
  }

  _syncState() {
    this.bloomPass.strength = state.get('bloomIntensity') ?? 0.6;
    this._currentBloom = this.bloomPass.strength;
    this._targetBloom = this._currentBloom;
  }

  setBloom(v) {
    this._targetBloom = v;
    state.set('bloomIntensity', v);
  }

  setVignette(offset, darkness) {
    if (this.vignettePass) {
      this.vignettePass.uniforms.offset.value = offset;
      this.vignettePass.uniforms.darkness.value = darkness;
    }
  }

  setSize(w, h) {
    if (this.composer) {
      this.composer.setSize(w, h);
      this.bloomPass?.resolution.set(w, h);
    }
  }

  render() {
    if (this.enabled && this.composer) {
      // Smooth bloom transitions
      if (Math.abs(this._currentBloom - this._targetBloom) > 0.001) {
        this._currentBloom = lerp(this._currentBloom, this._targetBloom, 0.05);
        this.bloomPass.strength = this._currentBloom;
      }
      this.composer.render();
    } else {
      // Fallback: direct render without post-processing
      this.renderer.render(this.scene, this.camera);
    }
  }

  dispose() {
    if (this.composer) this.composer.dispose();
  }
}

export default PostFX;
