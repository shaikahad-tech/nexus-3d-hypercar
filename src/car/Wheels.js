/**
 * Wheels — four-wheel assembly with tires, rims, brake discs,
 * 5-spoke aero design, and center caps. Wheels spin in the update loop.
 *
 * Exposes .update(dt, spinRate) so the CarBuilder can drive the spin.
 */
import * as THREE from 'three';
import { CAR_DIMENSIONS as D } from '../config/carSpecs.js';
import matLib from '../materials/MaterialLibrary.js';

class Wheels {
  constructor() {
    this.group = new THREE.Group();
    this.group.name = 'Wheels';
    this.wheels = [];
    this.arches = [];
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
    const darkPlastic = matLib.get('darkPlastic');
    const r = D.wheelRadius;

    const wheel = new THREE.Group();
    wheel.name = `Wheel_${name}`;

    // Tire (torus)
    const tireMesh = new THREE.Mesh(
      new THREE.TorusGeometry(r, D.wheelWidth, 20, 40),
      tire
    );
    tireMesh.rotation.y = Math.PI / 2;
    tireMesh.castShadow = true;
    wheel.add(tireMesh);

    // Rim (cylinder filling the torus)
    const rim = new THREE.Mesh(
      new THREE.CylinderGeometry(r - 0.05, r - 0.05, D.wheelWidth + 0.04, 32),
      chrome
    );
    rim.rotation.z = Math.PI / 2;
    rim.castShadow = true;
    wheel.add(rim);

    // Brake disc
    const disc = new THREE.Mesh(
      new THREE.CylinderGeometry(r * 0.65, r * 0.65, 0.04, 24),
      brake
    );
    disc.rotation.z = Math.PI / 2;
    wheel.add(disc);

    // 5-spoke aero design
    for (let i = 0; i < 5; i++) {
      const angle = (i / 5) * Math.PI * 2;
      const spoke = new THREE.Mesh(
        new THREE.BoxGeometry(0.06, r * 1.6, 0.12),
        darkPlastic
      );
      spoke.rotation.x = angle;
      wheel.add(spoke);
    }

    // Center cap
    const cap = new THREE.Mesh(
      new THREE.CylinderGeometry(0.12, 0.12, D.wheelWidth + 0.08, 16),
      chrome
    );
    cap.rotation.z = Math.PI / 2;
    wheel.add(cap);

    wheel.position.set(x, r, z);

    // Wheel arch (dark, doesn't spin)
    const arch = new THREE.Mesh(
      new THREE.TorusGeometry(r + 0.13, 0.1, 8, 20, Math.PI),
      darkPlastic
    );
    arch.rotation.y = Math.PI / 2;
    arch.rotation.z = Math.PI / 2;
    arch.position.set(x, r, z);

    return { wheel, arch };
  }

  update(dt, spinRate = 0.5) {
    for (const wheel of this.wheels) {
      // Rotate children[0] (tire) and children[1] (rim) on X axis
      if (wheel.children[0]) wheel.children[0].rotation.x += dt * spinRate;
      if (wheel.children[1]) wheel.children[1].rotation.x += dt * spinRate;
    }
  }

  dispose() {
    this.group.traverse((c) => {
      if (c.isMesh && c.geometry) c.geometry.dispose();
    });
  }
}

export default Wheels;
