/**
 * UnderglowFX — a glowing plane beneath the car that pulses.
 * Color tracks the active paint color. Visibility driven by state.
 */
import * as THREE from 'three';
import bus from '../core/EventBus.js';
import state from '../core/StateManager.js';

class UnderglowFX {
  constructor() {
    this.mesh = this._build();
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

  get object() { return this.mesh; }

  _bindEvents() {
    bus.on('state:change:underglowOn', (v) => {
      this.mesh.visible = v;
    });
    bus.on('paint:applied', (cfg) => {
      this.mesh.material.color.setHex(cfg.hex);
    });
    this.mesh.visible = state.get('underglowOn');
  }

  update(dt, t) {
    if (this.mesh.visible) {
      this.mesh.material.opacity = 0.25 + Math.sin(t * 2) * 0.12;
    }
  }

  dispose() {
    this.mesh.geometry.dispose();
    this.mesh.material.dispose();
  }
}

export default UnderglowFX;
