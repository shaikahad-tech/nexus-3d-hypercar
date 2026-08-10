/**
 * CarBuilder — top-level car assembly.
 * Composes Chassis, Cabin, Wheels, Aerodynamics, and CarLights
 * into a single THREE.Group. Registers itself as a ticker on the
 * SceneManager so wheel spin and hover breathing animate each frame.
 *
 * Emits 'car:ready' on the EventBus when assembly is complete.
 */
import * as THREE from 'three';
import Chassis from './Chassis.js';
import Cabin from './Cabin.js';
import Wheels from './Wheels.js';
import Aerodynamics from './Aerodynamics.js';
import CarLights from './CarLights.js';
import bus from '../core/EventBus.js';
import state from '../core/StateManager.js';

class CarBuilder {
  constructor() {
    this.group = new THREE.Group();
    this.group.name = 'AetherGT';
    this.components = {};
    this._build();
    this._bindEvents();
  }

  _build() {
    this.components.chassis = new Chassis();
    this.components.cabin = new Cabin();
    this.components.wheels = new Wheels();
    this.components.aero = new Aerodynamics();
    this.components.lights = new CarLights();

    // Mount all components
    Object.values(this.components).forEach((c) => {
      this.group.add(c.group);
    });

    bus.emit('car:ready', this.group);
  }

  _bindEvents() {
    bus.on('state:change:underglowOn', (v) => {
      this.components.aero.setIntakeVisibility(v);
    });
  }

  /** Called each frame by SceneManager */
  update(dt, t) {
    // Wheel spin
    this.components.wheels.update(dt, 0.5);

    // Subtle hover breathing
    this.group.position.y = Math.sin(t * 0.8) * 0.015;
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
