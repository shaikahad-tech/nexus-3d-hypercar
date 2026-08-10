/**
 * AssetLoader — centralized async resource loading with progress tracking.
 * Handles environment maps, textures, and procedural assets.
 * Designed to be extended for GLTF models without changing call sites.
 *
 * Fires progress events on the EventBus so the UI can show a
 * loading bar.
 */
import * as THREE from 'three';
import bus from './EventBus.js';

class AssetLoader {
  constructor(renderer) {
    this.renderer = renderer;
    this.pmrem = new THREE.PMREMGenerator(renderer);
    this.cache = new Map();
    this.totalLoaded = 0;
    this.totalQueued = 0;
  }

  async loadAll(manifest) {
    const results = {};
    const entries = Object.entries(manifest);
    this.totalQueued = entries.length;
    this.totalLoaded = 0;

    for (const [key, spec] of entries) {
      bus.emit('assets:progress', {
        completed: this.totalLoaded,
        total: this.totalQueued,
        key,
        progress: this.totalLoaded / this.totalQueued,
      });

      try {
        results[key] = await this._loadOne(spec);
      } catch (err) {
        console.warn(`[AssetLoader] failed to load "${key}":`, err);
        results[key] = null;
      }
      this.totalLoaded++;
    }

    bus.emit('assets:complete', results);
    return results;
  }

  async _loadOne(spec) {
    // Check cache first
    const cacheKey = JSON.stringify(spec);
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    let result;
    if (spec.type === 'envGradient') {
      result = this._loadGradientEnv(spec);
    } else if (spec.type === 'texture') {
      result = await this._loadTexture(spec);
    } else if (spec.type === 'cubeTexture') {
      result = await this._loadCubeTexture(spec);
    } else {
      console.warn('[AssetLoader] unknown asset type:', spec.type);
      return null;
    }

    this.cache.set(cacheKey, result);
    return result;
  }

  _loadGradientEnv(spec) {
    const {
      top = 0x1a2438, mid = 0x0c1018, bot = 0x050608, accent = 0xff3d2e,
    } = spec.colors || {};

    const envScene = new THREE.Scene();
    const gradMat = new THREE.ShaderMaterial({
      side: THREE.BackSide,
      uniforms: {
        uTop:    { value: new THREE.Color(top) },
        uMid:    { value: new THREE.Color(mid) },
        uBot:    { value: new THREE.Color(bot) },
        uAccent: { value: new THREE.Color(accent) },
        uTime:   { value: 0 },
      },
      vertexShader: /* glsl */`
        varying vec3 vWorld;
        varying vec3 vPosition;
        void main() {
          vec4 wp = modelMatrix * vec4(position, 1.0);
          vWorld = wp.xyz;
          vPosition = position;
          gl_Position = projectionMatrix * viewMatrix * wp;
        }
      `,
      fragmentShader: /* glsl */`
        uniform vec3 uTop, uMid, uBot, uAccent;
        uniform float uTime;
        varying vec3 vWorld;
        varying vec3 vPosition;

        // Simple noise for subtle cloud-like variation
        float hash(vec2 p) {
          return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
        }

        float noise(vec2 p) {
          vec2 i = floor(p);
          vec2 f = fract(p);
          f = f * f * (3.0 - 2.0 * f);
          return mix(
            mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
            mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x),
            f.y
          );
        }

        void main() {
          float h = normalize(vWorld).y;
          vec3 col = mix(uBot, uMid, smoothstep(-1.0, 0.0, h));
          col = mix(col, uTop, smoothstep(0.0, 1.0, h));
          float rim = 1.0 - abs(h);
          col += uAccent * 0.18 * pow(rim, 6.0);
          // Subtle cloud noise near horizon
          float n = noise(vWorld.xz * 0.3 + uTime * 0.02) * 0.05;
          col += vec3(n);
          gl_FragColor = vec4(col, 1.0);
        }
      `,
    });

    const sphere = new THREE.Mesh(new THREE.SphereGeometry(60, 32, 32), gradMat);
    envScene.add(sphere);

    const envRT = this.pmrem.fromScene(envScene, 0.04);
    const texture = envRT.texture;

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
          if (spec.anisotropy) {
            tex.anisotropy = spec.anisotropy;
          }
          resolve(tex);
        },
        undefined,
        reject
      );
    });
  }

  async _loadCubeTexture(spec) {
    return new Promise((resolve, reject) => {
      const loader = new THREE.CubeTextureLoader();
      loader.load(spec.urls, resolve, undefined, reject);
    });
  }

  dispose() {
    this.pmrem.dispose();
    this.cache.clear();
  }
}

export default AssetLoader;
