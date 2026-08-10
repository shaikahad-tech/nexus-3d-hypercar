/**
 * AssetLoader — centralized async resource loading with progress tracking.
 * Currently handles environment map generation; designed to be extended
 * for GLTF models, textures, HDRIs, etc. without changing call sites.
 */
import * as THREE from 'three';
import bus from './EventBus.js';

class AssetLoader {
  constructor(renderer) {
    this.renderer = renderer;
    this.pmrem = new THREE.PMREMGenerator(renderer);
    this.cache = new Map();
  }

  async loadAll(manifest) {
    const results = {};
    const entries = Object.entries(manifest);
    let completed = 0;

    for (const [key, spec] of entries) {
      try {
        results[key] = await this._loadOne(spec);
      } catch (err) {
        console.warn(`[AssetLoader] failed to load "${key}":`, err);
        results[key] = null;
      }
      completed++;
      bus.emit('assets:progress', { completed, total: entries.length, key });
    }

    bus.emit('assets:complete', results);
    return results;
  }

  async _loadOne(spec) {
    if (spec.type === 'envGradient') {
      return this._loadGradientEnv(spec);
    }
    if (spec.type === 'texture') {
      return this._loadTexture(spec);
    }
    console.warn('[AssetLoader] unknown asset type:', spec.type);
    return null;
  }

  _loadGradientEnv(spec) {
    const { top = 0x1a2438, mid = 0x0c1018, bot = 0x050608, accent = 0xff3d2e } = spec.colors || {};
    const envScene = new THREE.Scene();

    const gradMat = new THREE.ShaderMaterial({
      side: THREE.BackSide,
      uniforms: {
        uTop:    { value: new THREE.Color(top) },
        uMid:    { value: new THREE.Color(mid) },
        uBot:    { value: new THREE.Color(bot) },
        uAccent: { value: new THREE.Color(accent) },
      },
      vertexShader: /* glsl */`
        varying vec3 vWorld;
        void main() {
          vec4 wp = modelMatrix * vec4(position, 1.0);
          vWorld = wp.xyz;
          gl_Position = projectionMatrix * viewMatrix * wp;
        }
      `,
      fragmentShader: /* glsl */`
        uniform vec3 uTop, uMid, uBot, uAccent;
        varying vec3 vWorld;
        void main() {
          float h = normalize(vWorld).y;
          vec3 col = mix(uBot, uMid, smoothstep(-1.0, 0.0, h));
          col = mix(col, uTop, smoothstep(0.0, 1.0, h));
          float rim = 1.0 - abs(h);
          col += uAccent * 0.18 * pow(rim, 6.0);
          gl_FragColor = vec4(col, 1.0);
        }
      `,
    });

    const sphere = new THREE.Mesh(new THREE.SphereGeometry(60, 32, 32), gradMat);
    envScene.add(sphere);

    const envRT = this.pmrem.fromScene(envScene, 0.04);
    const texture = envRT.texture;

    // Cleanup
    sphere.geometry.dispose();
    gradMat.dispose();
    return texture;
  }

  _loadTexture(spec) {
    return new Promise((resolve, reject) => {
      const loader = new THREE.TextureLoader();
      loader.load(
        spec.url,
        (tex) => {
          if (spec.colorSpace) tex.colorSpace = spec.colorSpace;
          if (spec.wrap) {
            tex.wrapS = tex.wrapT = spec.wrap;
          }
          resolve(tex);
        },
        undefined,
        reject
      );
    });
  }

  dispose() {
    this.pmrem.dispose();
    this.cache.clear();
  }
}

export default AssetLoader;
