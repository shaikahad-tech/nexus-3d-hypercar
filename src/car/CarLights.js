/**
 * CarLights — headlights (angular LED DRL strips with point lights),
 * taillights (full-width LED bar with accents), fog lights, and
 * turn signals. Visibility driven by the StateManager via EventBus.
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
    this.taillights = [];
    this._build();
    this._bindEvents();
  }

  _build() {
    const headlightMat = matLib.get('headlight');
    const taillightMat = matLib.get('taillight');
    const darkPlastic = matLib.get('darkPlastic');
    const chrome = matLib.get('chrome');

    // ---- Headlights ----
    [0.75, -0.75].forEach((z) => {
      const housing = new THREE.Mesh(
        new THREE.BoxGeometry(0.15, 0.15, 0.6),
        darkPlastic
      );
      housing.position.set(-2.18, D.rideHeight + 0.3, z);
      this.group.add(housing);

      const hl = new THREE.Mesh(
        new THREE.BoxGeometry(0.12, 0.08, 0.55),
        headlightMat
      );
      hl.position.set(-2.2, D.rideHeight + 0.3, z);
      this.group.add(hl);

      const lens = new THREE.Mesh(
        new THREE.SphereGeometry(0.06, 16, 16),
        chrome
      );
      lens.position.set(-2.18, D.rideHeight + 0.28, z * 0.85);
      this.group.add(lens);

      const pl = new THREE.PointLight(0xfff5e0, 0.8, 8, 2);
      pl.position.set(-2.35, D.rideHeight + 0.3, z);
      this.group.add(pl);

      this.headlights.push({ mesh: hl, light: pl, lens });
    });

    // ---- DRL signature strip ----
    const drl = new THREE.Mesh(
      new THREE.BoxGeometry(0.03, 0.03, 1.3),
      headlightMat
    );
    drl.position.set(-2.25, D.rideHeight + 0.42, 0);
    this.group.add(drl);

    // ---- Fog lights ----
    [0.55, -0.55].forEach((z) => {
      const fog = new THREE.Mesh(
        new THREE.CircleGeometry(0.05, 16),
        headlightMat
      );
      fog.position.set(-2.28, D.rideHeight + 0.12, z);
      fog.rotation.y = Math.PI / 2;
      this.group.add(fog);

      const fogLight = new THREE.PointLight(0xfff5e0, 0.3, 4);
      fogLight.position.set(-2.32, D.rideHeight + 0.12, z);
      this.group.add(fogLight);
      this.headlights.push({ mesh: fog, light: fogLight, lens: null });
    });

    // ---- Taillight bar ----
    const taillight = new THREE.Mesh(
      new THREE.BoxGeometry(0.06, 0.06, 1.85),
      taillightMat
    );
    taillight.position.set(2.32, D.rideHeight + 0.4, 0);
    this.group.add(taillight);
    this.taillights.push(taillight);

    [1, -1].forEach((z) => {
      const t = new THREE.Mesh(
        new THREE.BoxGeometry(0.05, 0.04, 0.4),
        taillightMat
      );
      t.position.set(2.33, D.rideHeight + 0.3, z * 0.65);
      this.group.add(t);
      this.taillights.push(t);
    });

    // ---- Reverse lights ----
    [0.7, -0.7].forEach((z) => {
      const reverse = new THREE.Mesh(
        new THREE.BoxGeometry(0.04, 0.04, 0.08),
        new THREE.MeshStandardMaterial({
          color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 1.0,
        })
      );
      reverse.position.set(2.33, D.rideHeight + 0.2, z);
      this.group.add(reverse);
    });
  }

  _bindEvents() {
    bus.on('state:change:lightsOn', (v) => this.setHeadlightVisibility(v));
    bus.on('braking', (intensity) => this.setBrakeLightIntensity(intensity));
    this.setHeadlightVisibility(state.get('lightsOn'));
  }

  setHeadlightVisibility(v) {
    this.headlights.forEach(({ mesh, light }) => {
      mesh.visible = v;
      if (light) light.visible = v;
    });
  }

  setBrakeLightIntensity(intensity) {
    this.taillights.forEach((t) => {
      t.material.emissiveIntensity = 3.0 + intensity * 4.0;
    });
  }

  dispose() {
    this.group.traverse((c) => {
      if (c.isMesh && c.geometry) c.geometry.dispose();
    });
  }
}

export default CarLights;
