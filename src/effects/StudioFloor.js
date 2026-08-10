/**
 * StudioFloor — the dark reflective stage beneath the car.
 * Includes a glowing accent ring, grid helper, and a circular floor.
 * Visibility is driven by the StateManager.
 */
import * as THREE from 'three';
import bus from '../core/EventBus.js';
import state from '../core/StateManager.js';

class StudioFloor {
  constructor() {
    this.group = new THREE.Group();
    this.group.name = 'StudioFloor';
    this._build();
    this._bindEvents();
  }

  _build() {
    // Circular floor
    const floor = new THREE.Mesh(
      new THREE.CircleGeometry(18, 64),
      new THREE.MeshStandardMaterial({
        color: 0x0a0c10,
        metalness: 0.6,
        roughness: 0.4,
        envMapIntensity: 0.8,
      })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    this.group.add(floor);

    // Glowing accent ring under car
    this.ring = new THREE.Mesh(
      new THREE.RingGeometry(3.2, 3.35, 64),
      new THREE.MeshBasicMaterial({
        color: 0xff3d2e,
        transparent: true,
        opacity: 0.6,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
      })
    );
    this.ring.rotation.x = -Math.PI / 2;
    this.ring.position.y = 0.01;
    this.group.add(this.ring);

    // Grid
    this.grid = new THREE.GridHelper(30, 30, 0x1a1f2a, 0x10141a);
    this.grid.position.y = 0.005;
    this.grid.material.transparent = true;
    this.grid.material.opacity = 0.3;
    this.group.add(this.grid);
  }

  _bindEvents() {
    bus.on('state:change:underglowOn', (v) => {
      this.ring.visible = v;
    });
    bus.on('state:change:floorVisible', (v) => {
      this.group.visible = v;
    });
    bus.on('paint:applied', (cfg) => {
      const c = new THREE.Color(cfg.hex);
      this.ring.material.color.copy(c);
    });
    this.ring.visible = state.get('underglowOn');
    this.group.visible = state.get('floorVisible');
  }

  update(dt, t) {
    // Pulse the ring
    if (this.ring.visible) {
      this.ring.material.opacity = 0.4 + Math.sin(t * 2) * 0.2;
    }
  }

  dispose() {
    this.group.traverse((c) => {
      if (c.isMesh && c.geometry) c.geometry.dispose();
      if (c.isMesh && c.material) c.material.dispose();
    });
  }
}

export default StudioFloor;
