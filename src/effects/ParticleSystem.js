/**
 * ParticleSystem — floating ambient dust motes with per-particle
 * velocity, additive blending, and bounds wrapping.
 *
 * Supports configurable count, bounds, size, color, and opacity.
 * Particles wrap when they drift out of bounds, creating a
 * continuous atmospheric effect.
 */
import * as THREE from 'three';
import { randomRange, randomSign, SeededRandom } from '../utils/math.js';
import bus from '../core/EventBus.js';
import state from '../core/StateManager.js';

class ParticleSystem {
  constructor(opts = {}) {
    this.count = opts.count ?? 250;
    this.bounds = opts.bounds ?? { x: 20, y: 8, z: 20 };
    this.size = opts.size ?? 0.04;
    this.color = opts.color ?? 0xffffff;
    this.opacity = opts.opacity ?? 0.5;
    this.velocities = [];
    this._seed = opts.seed ?? 42;
    this._build();
    this._bindEvents();
  }

  _build() {
    const rng = new SeededRandom(this._seed);
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(this.count * 3);
    const sizes = new Float32Array(this.count);
    this.velocities = [];

    for (let i = 0; i < this.count; i++) {
      positions[i * 3]     = rng.range(-this.bounds.x / 2, this.bounds.x / 2);
      positions[i * 3 + 1] = rng.range(0, this.bounds.y);
      positions[i * 3 + 2] = rng.range(-this.bounds.z / 2, this.bounds.z / 2);
      sizes[i] = rng.range(this.size * 0.5, this.size * 1.5);
      this.velocities.push({
        x: randomSign() * 0.002,
        y: Math.random() * 0.005 + 0.001,
        z: randomSign() * 0.002,
      });
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const mat = new THREE.PointsMaterial({
      color: this.color,
      size: this.size,
      transparent: true,
      opacity: this.opacity,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true,
    });

    this.points = new THREE.Points(geo, mat);
    this.points.name = 'Particles';
    this.points.frustumCulled = false;
  }

  _bindEvents() {
    bus.on('state:change:particlesVisible', (v) => {
      this.points.visible = v;
    });
    this.points.visible = state.get('particlesVisible');
  }

  get object() { return this.points; }

  update(dt, t) {
    if (!this.points.visible) return;
    const pos = this.points.geometry.attributes.position.array;
    for (let i = 0; i < this.count; i++) {
      pos[i * 3]     += this.velocities[i].x;
      pos[i * 3 + 1] += this.velocities[i].y;
      pos[i * 3 + 2] += this.velocities[i].z;

      if (pos[i * 3 + 1] > this.bounds.y) {
        pos[i * 3 + 1] = 0;
        pos[i * 3]     = (Math.random() - 0.5) * this.bounds.x;
        pos[i * 3 + 2] = (Math.random() - 0.5) * this.bounds.z;
      }
      if (Math.abs(pos[i * 3]) > this.bounds.x / 2) this.velocities[i].x *= -1;
      if (Math.abs(pos[i * 3 + 2]) > this.bounds.z / 2) this.velocities[i].z *= -1;
    }
    this.points.geometry.attributes.position.needsUpdate = true;
  }

  setColor(hex) {
    this.points.material.color.setHex(hex);
  }

  setOpacity(v) {
    this.points.material.opacity = v;
  }

  dispose() {
    this.points.geometry.dispose();
    this.points.material.dispose();
  }
}

export default ParticleSystem;
