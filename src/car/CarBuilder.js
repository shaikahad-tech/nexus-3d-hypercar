/**
 * CarBuilder — top-level car assembly.
 * Composes Chassis, Cabin, Wheels, Aerodynamics, and CarLights
 * into a single THREE.Group. Registers update() for per-frame
 * animation (wheel spin, hover breathing, suspension simulation).
 */
import * as THREE from 'three';
import Chassis from './Chassis.js';
import Cabin from './Cabin.js';
import Wheels from './Wheels.js';
import Aerodynamics from './Aerodynamics.js';
import CarLights from './CarLights.js';
import bus from '../core/EventBus.js';
import state from '../core/StateManager.js';
import { VEHICLE_VARIANTS } from '../config/carSpecs.js';

class CarBuilder {
  constructor() {
    this.group = new THREE.Group();
    this.group.name = 'AetherGT';
    this.components = {};
    this._hoverPhase = 0;
    this._suspensionOffset = new THREE.Vector3();
    this._build();
    this._bindEvents();
  }

  _build() {
    this.components.chassis = new Chassis();
    this.components.cabin = new Cabin();
    this.components.wheels = new Wheels();
    this.components.aero = new Aerodynamics();
    this.components.lights = new CarLights();

    Object.values(this.components).forEach((c) => {
      this.group.add(c.group);
    });

    this.group.position.y = 0;
    bus.emit('car:ready', this.group);
  }

  _bindEvents() {
    bus.on('state:change:underglowOn', (v) => {
      this.components.aero.setIntakeVisibility(v);
    });
    bus.on('vehicle:change', (index) => {
      this.swapVariant(index);
    });
  }

  swapVariant(index) {
    const variant = VEHICLE_VARIANTS[index];
    if (variant) {
      bus.emit('vehicle:swapped', variant);
    }
  }

  update(dt, t, physicsData) {
    this.components.wheels.update(dt);

    this._hoverPhase += dt * 0.8;
    const hover = Math.sin(this._hoverPhase) * 0.015;

    if (physicsData) {
      this._suspensionOffset.lerp(
        new THREE.Vector3(
          physicsData.pitch || 0,
          hover + (physicsData.bounce || 0),
          physicsData.roll || 0
        ),
        0.1
      );
      this.group.position.y = this._suspensionOffset.y;
      this.group.rotation.x = this._suspensionOffset.x * 0.05;
      this.group.rotation.z = this._suspensionOffset.z * 0.05;
    } else {
      this.group.position.y = hover;
    }

    if (physicsData && physicsData.braking) {
      bus.emit('braking', physicsData.braking);
    }
  }

  getComponent(name) {
    return this.components[name] || null;
  }

  dispose() {
    Object.values(this.components).forEach((c) => {
      if (c.dispose) c.dispose();
    });
  }
}

export default CarBuilder;
