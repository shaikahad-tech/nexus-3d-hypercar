/**
 * MaterialLibrary — centralized material factory and registry.
 * All materials are created here so they can be shared, updated,
 * and disposed from a single location. Paint changes propagate
 * through the EventBus.
 */
import * as THREE from 'three';
import bus from '../core/EventBus.js';
import { PAINT_COLORS } from '../config/carSpecs.js';

class MaterialLibrary {
  constructor() {
    this.materials = {};
    this._paintIndex = 0;
    this._initMaterials();
    this._bindEvents();
  }

  _initMaterials() {
    // Paint (body) — dynamic, updated via EventBus
    const c = PAINT_COLORS[0];
    this.materials.paint = new THREE.MeshPhysicalMaterial({
      color: c.hex,
      metalness: c.metalness,
      roughness: c.roughness,
      clearcoat: c.clearcoat,
      clearcoatRoughness: 0.04,
      envMapIntensity: 1.3,
    });

    // Glass cabin
    this.materials.glass = new THREE.MeshPhysicalMaterial({
      color: 0x0a0e14,
      metalness: 0.4,
      roughness: 0.05,
      transmission: 0.6,
      transparent: true,
      opacity: 0.65,
      ior: 1.45,
      envMapIntensity: 1.5,
    });

    // Chrome (rims, trim)
    this.materials.chrome = new THREE.MeshStandardMaterial({
      color: 0xe8eaed, metalness: 1.0, roughness: 0.15, envMapIntensity: 1.6,
    });

    // Dark plastic (splitters, arches, interior trim)
    this.materials.darkPlastic = new THREE.MeshStandardMaterial({
      color: 0x0a0c0f, metalness: 0.3, roughness: 0.7,
    });

    // Carbon fiber (wing, skirts, diffuser)
    this.materials.carbon = new THREE.MeshStandardMaterial({
      color: 0x14161a, metalness: 0.6, roughness: 0.35,
    });

    // Tires
    this.materials.tire = new THREE.MeshStandardMaterial({
      color: 0x0c0d0f, metalness: 0.1, roughness: 0.85,
    });

    // Brake disc
    this.materials.brake = new THREE.MeshStandardMaterial({
      color: 0x8a8d92, metalness: 0.9, roughness: 0.25,
    });

    // Headlight emissive
    this.materials.headlight = new THREE.MeshStandardMaterial({
      color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 2.5,
    });

    // Taillight emissive
    this.materials.taillight = new THREE.MeshStandardMaterial({
      color: 0xff1a1a, emissive: 0xff2020, emissiveIntensity: 3.0,
    });

    // Underglow / accent strip (color-tracked with paint)
    this.materials.underglow = new THREE.MeshStandardMaterial({
      color: c.hex, emissive: c.hex, emissiveIntensity: 1.5,
    });
  }

  _bindEvents() {
    bus.on('paint:change', (cfg) => this._applyPaint(cfg));
  }

  _applyPaint(cfg) {
    const m = this.materials.paint;
    m.color.setHex(cfg.hex);
    m.metalness = cfg.metalness;
    m.roughness = cfg.roughness;
    m.clearcoat = cfg.clearcoat;
    m.needsUpdate = true;

    // Sync accent color
    const accent = new THREE.Color(cfg.hex);
    this.materials.underglow.color.copy(accent);
    this.materials.underglow.emissive.copy(accent);
  }

  setPaintIndex(index) {
    this._paintIndex = index;
    const cfg = PAINT_COLORS[index];
    if (!cfg) return;
    this._applyPaint(cfg);
    bus.emit('paint:applied', { index, ...cfg });
  }

  getPaintIndex() { return this._paintIndex; }

  get(name) { return this.materials[name] || null; }

  setEnvMap(envMap) {
    Object.values(this.materials).forEach((m) => {
      m.envMap = envMap;
      m.needsUpdate = true;
    });
  }

  dispose() {
    Object.values(this.materials).forEach((m) => m.dispose());
  }
}

export const matLib = new MaterialLibrary();
export default matLib;
