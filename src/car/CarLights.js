/**
 * CarLights — headlights (angular LED strips with point lights)
 * and taillights (full-width LED bar with accents).
 * Visibility is driven by the StateManager via the EventBus.
 */
import * as THREE from 'three';
import { CAR_DIMENSIONS as D } from '../config/carSpecs.js';
import matLib from '../materials/MaterialLibrary.js';
import bus from '../core/EventBus.js';
import state from '../core/StateManager.js';

class CarLights {
  constructor() {
    this.group = new THREE.Group();
    this.group.name = 'CarLights';
    this.headlights = [];
    this._build();
    this._bindEvents();
  }

  _build() {
    const headlightMat = matLib.get('headlight');
    const taillightMat = matLib.get('taillight');

    // Headlights
    [0.75, -0.75].forEach((z) => {
      const hl = new THREE.Mesh(
        new THREE.BoxGeometry(0.12, 0.08, 0.55),
        headlightMat
      );
      hl.position.set(-2.2, D.rideHeight + 0.3, z);
      hl.rotation.y = z > 0 ? 0.12 : -0.12;
      this.group.add(hl);

      const pl = new THREE.PointLight(0xffffff, 0.6, 6);
      pl.position.set(-2.3, D.rideHeight + 0.3, z);
      this.group.add(pl);

      this.headlights.push({ mesh: hl, light: pl });
    });

    // Taillight bar — full width
    const taillight = new THREE.Mesh(
      new THREE.BoxGeometry(0.06, 0.06, 1.85),
      taillightMat
    );
    taillight.position.set(2.32, D.rideHeight + 0.4, 0);
    this.group.add(taillight);

    // Taillight accents
    [1, -1].forEach((z) => {
      const t = new THREE.Mesh(
        new THREE.BoxGeometry(0.05, 0.04, 0.4),
        taillightMat
      );
      t.position.set(2.33, D.rideHeight + 0.3, z * 0.65);
      this.group.add(t);
    });
  }

  _bindEvents() {
    bus.on('state:change:lightsOn', (v) => this.setHeadlightVisibility(v));
    // Sync initial state
    this.setHeadlightVisibility(state.get('lightsOn'));
  }

  setHeadlightVisibility(v) {
    this.headlights.forEach(({ mesh, light }) => {
      mesh.visible = v;
      light.visible = v;
    });
  }

  dispose() {
    this.group.traverse((c) => {
      if (c.isMesh && c.geometry) c.geometry.dispose();
    });
  }
}

export default CarLights;
