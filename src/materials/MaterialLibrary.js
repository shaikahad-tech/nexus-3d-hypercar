/**
 * MaterialLibrary — centralized material factory and registry.
 * All materials are created here so they can be shared, updated,
 * and disposed from a single location. Paint changes propagate
 * through the EventBus. Also manages rim finishes and caliper colors.
 *
 * Supports paint flake simulation via envMapIntensity modulation
 * and clearcoat layer adjustments for different paint categories
 * (metallic, pearl, matte, candy, chrome).
 */
import * as THREE from 'three';
import bus from '../core/EventBus.js';
import { PAINT_COLORS, RIM_FINISHES, CALIPER_COLORS } from '../config/paintColors.js';

class MaterialLibrary {
  constructor() {
    this.materials = {};
    this._paintIndex = 0;
    this._rimIndex = 0;
    this._caliperIndex = 0;
    this._initMaterials();
    this._bindEvents();
  }

  _initMaterials() {
    const c = PAINT_COLORS[0];

    // Paint (body) — dynamic, updated via EventBus
    this.materials.paint = new THREE.MeshPhysicalMaterial({
      color: c.hex,
      metalness: c.metalness,
      roughness: c.roughness,
      clearcoat: c.clearcoat,
      clearcoatRoughness: 0.04,
      envMapIntensity: 1.3,
      sheen: 0.5,
      sheenColor: new THREE.Color(c.hex),
      sheenRoughness: 0.3,
    });

    // Glass cabin — electrochromic smart glass
    this.materials.glass = new THREE.MeshPhysicalMaterial({
      color: 0x0a0e14,
      metalness: 0.4,
      roughness: 0.05,
      transmission: 0.6,
      transparent: true,
      opacity: 0.65,
      ior: 1.45,
      envMapIntensity: 1.5,
      thickness: 0.5,
      specularIntensity: 1.0,
    });

    // Chrome (rims, trim) — default polished
    const rim = RIM_FINISHES[0];
    this.materials.chrome = new THREE.MeshStandardMaterial({
      color: rim.hex,
      metalness: rim.metalness,
      roughness: rim.roughness,
      envMapIntensity: 1.6,
    });

    // Dark plastic (splitters, arches, interior trim)
    this.materials.darkPlastic = new THREE.MeshStandardMaterial({
      color: 0x0a0c0f,
      metalness: 0.3,
      roughness: 0.7,
      envMapIntensity: 0.5,
    });

    // Carbon fiber (wing, skirts, diffuser)
    this.materials.carbon = new THREE.MeshStandardMaterial({
      color: 0x14161a,
      metalness: 0.6,
      roughness: 0.35,
      envMapIntensity: 0.8,
    });

    // Tires — rubber with subtle subsurface
    this.materials.tire = new THREE.MeshStandardMaterial({
      color: 0x0c0d0f,
      metalness: 0.1,
      roughness: 0.85,
      envMapIntensity: 0.3,
    });

    // Brake disc — vented steel
    this.materials.brake = new THREE.MeshStandardMaterial({
      color: 0x8a8d92,
      metalness: 0.9,
      roughness: 0.25,
      envMapIntensity: 1.2,
    });

    // Brake caliper — default red
    const caliper = CALIPER_COLORS[0];
    this.materials.caliper = new THREE.MeshStandardMaterial({
      color: caliper.hex,
      metalness: 0.4,
      roughness: 0.3,
      emissive: caliper.hex,
      emissiveIntensity: 0.1,
      envMapIntensity: 0.8,
    });

    // Headlight emissive
    this.materials.headlight = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0xffffff,
      emissiveIntensity: 2.5,
    });

    // Taillight emissive
    this.materials.taillight = new THREE.MeshStandardMaterial({
      color: 0xff1a1a,
      emissive: 0xff2020,
      emissiveIntensity: 3.0,
    });

    // Underglow / accent strip (color-tracked with paint)
    this.materials.underglow = new THREE.MeshStandardMaterial({
      color: c.hex,
      emissive: c.hex,
      emissiveIntensity: 1.5,
    });

    // Interior — dashboard / seats
    this.materials.interior = new THREE.MeshStandardMaterial({
      color: 0x1a1a1a,
      metalness: 0.2,
      roughness: 0.6,
      envMapIntensity: 0.4,
    });

    // Alcantara (seat inserts)
    this.materials.alcantara = new THREE.MeshStandardMaterial({
      color: 0x2a2a2a,
      metalness: 0.0,
      roughness: 0.9,
      envMapIntensity: 0.2,
    });

    // Emissive display screen
    this.materials.screen = new THREE.MeshStandardMaterial({
      color: 0x00ff88,
      emissive: 0x00ff88,
      emissiveIntensity: 1.5,
    });
  }

  _bindEvents() {
    bus.on('paint:change', (cfg) => this._applyPaint(cfg));
    bus.on('rim:change', (cfg) => this._applyRim(cfg));
    bus.on('caliper:change', (cfg) => this._applyCaliper(cfg));
  }

  _applyPaint(cfg) {
    const m = this.materials.paint;
    m.color.setHex(cfg.hex);
    m.metalness = cfg.metalness;
    m.roughness = cfg.roughness;
    m.clearcoat = cfg.clearcoat;
    // Adjust clearcoat roughness based on category
    m.clearcoatRoughness = cfg.category === 'matte' ? 0.3 : 0.04;
    // Adjust envMap intensity based on flake
    m.envMapIntensity = 1.0 + (cfg.flakeIntensity || 0.5) * 0.6;
    // Sheen for pearl finishes
    if (cfg.category === 'pearl') {
      m.sheen = 1.0;
      m.sheenColor = new THREE.Color(cfg.hex).lerp(new THREE.Color(0xffffff), 0.5);
    } else {
      m.sheen = 0.3;
      m.sheenColor = new THREE.Color(cfg.hex);
    }
    m.needsUpdate = true;

    // Sync accent color (underglow follows paint)
    const accent = new THREE.Color(cfg.hex);
    this.materials.underglow.color.copy(accent);
    this.materials.underglow.emissive.copy(accent);
  }

  _applyRim(cfg) {
    this.materials.chrome.color.setHex(cfg.hex);
    this.materials.chrome.metalness = cfg.metalness;
    this.materials.chrome.roughness = cfg.roughness;
    this.materials.chrome.needsUpdate = true;
  }

  _applyCaliper(cfg) {
    this.materials.caliper.color.setHex(cfg.hex);
    this.materials.caliper.emissive.setHex(cfg.hex);
    this.materials.caliper.needsUpdate = true;
  }

  setPaintIndex(index) {
    this._paintIndex = index;
    const cfg = PAINT_COLORS[index];
    if (!cfg) return;
    this._applyPaint(cfg);
    bus.emit('paint:applied', { index, ...cfg });
  }

  setRimIndex(index) {
    this._rimIndex = index;
    const cfg = RIM_FINISHES[index];
    if (!cfg) return;
    this._applyRim(cfg);
    bus.emit('rim:applied', { index, ...cfg });
  }

  setCaliperIndex(index) {
    this._caliperIndex = index;
    const cfg = CALIPER_COLORS[index];
    if (!cfg) return;
    this._applyCaliper(cfg);
    bus.emit('caliper:applied', { index, ...cfg });
  }

  cyclePaint() {
    const next = (this._paintIndex + 1) % PAINT_COLORS.length;
    this.setPaintIndex(next);
    return next;
  }

  cycleRim() {
    const next = (this._rimIndex + 1) % RIM_FINISHES.length;
    this.setRimIndex(next);
    return next;
  }

  cycleCaliper() {
    const next = (this._caliperIndex + 1) % CALIPER_COLORS.length;
    this.setCaliperIndex(next);
    return next;
  }

  getPaintIndex() { return this._paintIndex; }
  getRimIndex() { return this._rimIndex; }
  getCaliperIndex() { return this._caliperIndex; }

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
