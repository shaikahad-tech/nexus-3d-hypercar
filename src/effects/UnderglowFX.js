/**
 * UnderglowFX — a glowing plane beneath the car that pulses.
 * Color tracks the active paint color. Visibility driven by state.
 * Includes a secondary ground projection light for extra ambiance.
 */
import * as THREE from 'three';
import bus from '../core/EventBus.js';
import state from '../core/StateManager.js';

class UnderglowFX {
  constructor() {
    this.mesh = this._build();
    this.groundLight = this._buildGroundLight();
    this._bindEvents();
  }

  _build() {
    const geo = new THREE.PlaneGeometry(4.8, 2.2);
    const mat = new THREE.MeshBasicMaterial({
      color: 0xff3d2e,
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.y = 0.02;
    mesh.name = 'Underglow';
    return mesh;
  }

  _buildGroundLight() {
    const light = new THREE.PointLight(0xff3d2e, 2, 8, 2);
    light.position.set(0, 0.1, 0);
    return light;
  }

  get object() { return this.mesh; }
  get light() { return this.groundLight; }

  _bindEvents() {
    bus.on('state:change:underglowOn', (v) => {
      this.mesh.visible = v;
      this.groundLight.visible = v;
    });
    bus.on('paint:applied', (cfg) => {
      this.mesh.material.color.setHex(cfg.hex);
      this.groundLight.color.setHex(cfg.hex);
    });
    this.mesh.visible = state.get('underglowOn');
    this.groundLight.visible = state.get('underglowOn');
  }

  update(dt, t) {
    if (this.mesh.visible) {
      this.mesh.material.opacity = 0.25 + Math.sin(t * 2) * 0.12;
      this.groundLight.intensity = 1.5 + Math.sin(t * 2) * 0.5;
    }
  }

  dispose() {
    this.mesh.geometry.dispose();
    this.mesh.material.dispose();
  }
}

export default UnderglowFX;
