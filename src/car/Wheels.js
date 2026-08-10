/**
 * Wheels — four-wheel assembly with tires, rims, brake discs,
 * 5-spoke aero design, brake calipers, center caps, and wheel arches.
 *
 * Reads dimensions from the active vehicle variant and supports
 * different rim finishes and caliper colors via the MaterialLibrary.
 * Wheels spin in the update loop — speed is adjustable.
 */
import * as THREE from 'three';
import { roundedBox } from '../utils/geometry.js';
import { CAR_DIMENSIONS as D } from '../config/carSpecs.js';
import matLib from '../materials/MaterialLibrary.js';

class Wheels {
  constructor() {
    this.group = new THREE.Group();
    this.group.name = 'Wheels';
    this.wheels = [];
    this.arches = [];
    this.spinRate = 0.5;
    this._build();
  }

  _build() {
    const positions = [
      { x: -1.55, z: 1.0,  name: 'FL' },
      { x: -1.55, z: -1.0, name: 'FR' },
      { x: 1.65,  z: 1.0,  name: 'RL' },
      { x: 1.65,  z: -1.0, name: 'RR' },
    ];

    for (const pos of positions) {
      const { wheel, arch } = this._makeWheel(pos);
      this.wheels.push(wheel);
      this.arches.push(arch);
      this.group.add(wheel);
      this.group.add(arch);
    }
  }

  _makeWheel({ x, z, name }) {
    const tire = matLib.get('tire');
    const chrome = matLib.get('chrome');
    const brake = matLib.get('brake');
    const caliper = matLib.get('caliper');
    const darkPlastic = matLib.get('darkPlastic');
    const r = D.wheelRadius;

    const wheel = new THREE.Group();
    wheel.name = `Wheel_${name}`;

    // ---- Tire (torus) ----
    const tireMesh = new THREE.Mesh(
      new THREE.TorusGeometry(r, D.wheelWidth, 20, 40),
      tire
    );
    tireMesh.rotation.y = Math.PI / 2;
    tireMesh.castShadow = true;
    wheel.add(tireMesh);

    // Tire sidewall detail (inner ring)
    const sidewall = new THREE.Mesh(
      new THREE.TorusGeometry(r - 0.05, 0.02, 8, 40),
      tire
    );
    sidewall.rotation.y = Math.PI / 2;
    wheel.add(sidewall);

    // ---- Rim (cylinder filling the torus) ----
    const rim = new THREE.Mesh(
      new THREE.CylinderGeometry(r - 0.05, r - 0.05, D.wheelWidth + 0.04, 32),
      chrome
    );
    rim.rotation.z = Math.PI / 2;
    rim.castShadow = true;
    wheel.add(rim);

    // ---- Rim barrel (inner depth) ----
    const barrel = new THREE.Mesh(
      new THREE.CylinderGeometry(r - 0.08, r - 0.08, D.wheelWidth + 0.02, 24),
      darkPlastic
    );
    barrel.rotation.z = Math.PI / 2;
    wheel.add(barrel);

    // ---- Brake disc ----
    const disc = new THREE.Mesh(
      new THREE.CylinderGeometry(r * 0.65, r * 0.65, 0.04, 24),
      brake
    );
    disc.rotation.z = Math.PI / 2;
    wheel.add(disc);

    // Brake disc drilling pattern (vents)
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const hole = new THREE.Mesh(
        new THREE.CylinderGeometry(0.02, 0.02, 0.06, 8),
        darkPlastic
      );
      hole.rotation.z = Math.PI / 2;
      hole.position.set(0, Math.cos(angle) * r * 0.5, Math.sin(angle) * r * 0.5);
      wheel.add(hole);
    }

    // ---- Brake caliper ----
    const caliperMesh = new THREE.Mesh(
      roundedBox(0.08, 0.15, 0.06, 2, 0.02),
      caliper
    );
    caliperMesh.position.set(0, r * 0.5, 0);
    wheel.add(caliperMesh);

    // Caliper logo plate (small detail)
    const logoPlate = new THREE.Mesh(
      new THREE.PlaneGeometry(0.04, 0.02),
      chrome
    );
    logoPlate.position.set(0.04, r * 0.5, 0);
    logoPlate.rotation.y = Math.PI / 2;
    wheel.add(logoPlate);

    // ---- 5-spoke aero design ----
    for (let i = 0; i < 5; i++) {
      const angle = (i / 5) * Math.PI * 2;
      const spoke = new THREE.Mesh(
        new THREE.BoxGeometry(0.06, r * 1.6, 0.12),
        darkPlastic
      );
      spoke.rotation.x = angle;
      wheel.add(spoke);

      // Spoke accent (chrome edge)
      const spokeAccent = new THREE.Mesh(
        new THREE.BoxGeometry(0.02, r * 1.5, 0.04),
        chrome
      );
      spokeAccent.rotation.x = angle;
      spokeAccent.position.set(0.03, 0, 0);
      wheel.add(spokeAccent);
    }

    // ---- Center cap ----
    const cap = new THREE.Mesh(
      new THREE.CylinderGeometry(0.12, 0.12, D.wheelWidth + 0.08, 16),
      chrome
    );
    cap.rotation.z = Math.PI / 2;
    wheel.add(cap);

    // Center cap logo
    const capLogo = new THREE.Mesh(
      new THREE.CircleGeometry(0.06, 16),
      darkPlastic
    );
    capLogo.position.set(D.wheelWidth / 2 + 0.05, 0, 0);
    capLogo.rotation.y = Math.PI / 2;
    wheel.add(capLogo);

    // ---- Lug nuts ----
    for (let i = 0; i < 5; i++) {
      const angle = (i / 5) * Math.PI * 2 + Math.PI / 5;
      const lug = new THREE.Mesh(
        new THREE.CylinderGeometry(0.02, 0.02, 0.04, 6),
        chrome
      );
      lug.rotation.z = Math.PI / 2;
      lug.position.set(0, Math.cos(angle) * 0.2, Math.sin(angle) * 0.2);
      wheel.add(lug);
    }

    wheel.position.set(x, r, z);

    // ---- Wheel arch (dark, doesn't spin) ----
    const archGeo = new THREE.TorusGeometry(r + 0.13, 0.1, 8, 20, Math.PI);
    const arch = new THREE.Mesh(archGeo, darkPlastic);
    arch.rotation.y = Math.PI / 2;
    arch.rotation.z = Math.PI / 2;
    arch.position.set(x, r, z);

    return { wheel, arch };
  }

  update(dt, spinRate) {
    const rate = spinRate ?? this.spinRate;
    for (const wheel of this.wheels) {
      // Rotate tire (children[0]) and rim (children[2]) on X axis
      if (wheel.children[0]) wheel.children[0].rotation.x += dt * rate;
      if (wheel.children[2]) wheel.children[2].rotation.x += dt * rate;
    }
  }

  setSpinRate(rate) {
    this.spinRate = rate;
  }

  dispose() {
    this.group.traverse((c) => {
      if (c.isMesh && c.geometry) c.geometry.dispose();
    });
  }
}

export default Wheels;
