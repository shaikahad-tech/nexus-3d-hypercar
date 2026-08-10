/**
 * ParticleSystem — floating ambient dust motes.
 * GPU-friendly Points object with additive blending and per-particle
 * velocity. Particles wrap when they drift out of bounds.
 */
import * as THREE from 'three';
import { randomRange, randomSign } from '../utils/math.js';

class ParticleSystem {
  constructor(count = 250, bounds = { x: 20, y: 8, z: 20 }) {
    this.count = count;
    this.bounds = bounds;
    this.velocities = [];
    this._build();
  }

  _build() {
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(this.count * 3);
    this.velocities = [];

    for (let i = 0; i < this.count; i++) {
      positions[i * 3]     = randomRange(-this.bounds.x / 2, this.bounds.x / 2);
      positions[i * 3 + 1] = randomRange(0, this.bounds.y);
      positions[i * 3 + 2] = randomRange(-this.bounds.z / 2, this.bounds.z / 2);
      this.velocities.push({
        x: randomSign() * 0.002,
        y: Math.random() * 0.005 + 0.001,
        z: randomSign() * 0.002,
      });
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const mat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.04,
      transparent: true,
      opacity: 0.5,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    this.points = new THREE.Points(geo, mat);
    this.points.name = 'Particles';
  }

  get object() { return this.points; }

  update(dt, t) {
    const pos = this.points.geometry.attributes.position.array;
    for (let i = 0; i < this.count; i++) {
      pos[i * 3]     += this.velocities[i].x;
      pos[i * 3 + 1] += this.velocities[i].y;
      pos[i * 3 + 2] += this.velocities[i].z;

      if (pos[i * 3 + 1] > this.bounds.y) pos[i * 3 + 1] = 0;
      if (Math.abs(pos[i * 3]) > this.bounds.x / 2) this.velocities[i].x *= -1;
      if (Math.abs(pos[i * 3 + 2]) > this.bounds.z / 2) this.velocities[i].z *= -1;
    }
    this.points.geometry.attributes.position.needsUpdate = true;
  }

  dispose() {
    this.points.geometry.dispose();
    this.points.material.dispose();
  }
}

export default ParticleSystem;
