/**
 * StudioFloor — the reflective stage beneath the car.
 * Includes a glowing accent ring, grid helper, circular floor,
 * and optional reflective surface. Supports smooth material
 * transitions when scene modes change.
 */
import * as THREE from 'three';
import bus from '../core/EventBus.js';
import state from '../core/StateManager.js';
import { lerp } from '../utils/math.js';

class StudioFloor {
  constructor() {
    this.group = new THREE.Group();
    this.group.name = 'StudioFloor';
    this._targetFloor = null;
    this._fromFloor = null;
    this._tweenT = 0;
    this._tweening = false;
    this._build();
    this._bindEvents();
  }

  _build() {
    this.floorMat = new THREE.MeshStandardMaterial({
      color: 0x0a0c10,
      metalness: 0.6,
      roughness: 0.4,
      envMapIntensity: 0.8,
    });
    const floor = new THREE.Mesh(
      new THREE.CircleGeometry(18, 64),
      this.floorMat
    );
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    this.group.add(floor);
    this.floorMesh = floor;

    this.ringMat = new THREE.MeshBasicMaterial({
      color: 0xff3d2e,
      transparent: true,
      opacity: 0.6,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
    });
    this.ring = new THREE.Mesh(
      new THREE.RingGeometry(3.2, 3.35, 64),
      this.ringMat
    );
    this.ring.rotation.x = -Math.PI / 2;
    this.ring.position.y = 0.01;
    this.group.add(this.ring);

    this.ringMat2 = new THREE.MeshBasicMaterial({
      color: 0xff3d2e,
      transparent: true,
      opacity: 0.15,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
    });
    this.ring2 = new THREE.Mesh(
      new THREE.RingGeometry(5.0, 5.1, 64),
      this.ringMat2
    );
    this.ring2.rotation.x = -Math.PI / 2;
    this.ring2.position.y = 0.008;
    this.group.add(this.ring2);

    this.grid = new THREE.GridHelper(30, 30, 0x1a1f2a, 0x10141a);
    this.grid.position.y = 0.005;
    this.grid.material.transparent = true;
    this.grid.material.opacity = 0.3;
    this.group.add(this.grid);
  }

  _bindEvents() {
    bus.on('state:change:underglowOn', (v) => {
      this.ring.visible = v;
      this.ring2.visible = v;
    });
    bus.on('state:change:floorVisible', (v) => {
      this.group.visible = v;
    });
    bus.on('paint:applied', (cfg) => {
      const c = new THREE.Color(cfg.hex);
      this.ringMat.color.copy(c);
      this.ringMat2.color.copy(c);
    });
    this.ring.visible = state.get('underglowOn');
    this.ring2.visible = state.get('underglowOn');
    this.group.visible = state.get('floorVisible');
  }

  transitionTo(floorConfig) {
    this._fromFloor = {
      color: this.floorMat.color.getHex(),
      metalness: this.floorMat.metalness,
      roughness: this.floorMat.roughness,
    };
    this._targetFloor = floorConfig;
    this._tweenT = 0;
    this._tweening = true;
  }

  update(dt, t) {
    if (this.ring.visible) {
      this.ringMat.opacity = 0.4 + Math.sin(t * 2) * 0.2;
      this.ringMat2.opacity = 0.1 + Math.sin(t * 2 + 0.5) * 0.08;
    }

    if (this._tweening && this._targetFloor) {
      this._tweenT += dt / 1.5;
      const e = Math.min(this._tweenT, 1);
      const ease = e < 0.5 ? 2 * e * e : 1 - Math.pow(-2 * e + 2, 2) / 2;

      this.floorMat.color.lerpColors(
        new THREE.Color(this._fromFloor.color),
        new THREE.Color(this._targetFloor.color),
        ease
      );
      this.floorMat.metalness = lerp(this._fromFloor.metalness, this._targetFloor.metalness, ease);
      this.floorMat.roughness = lerp(this._fromFloor.roughness, this._targetFloor.roughness, ease);

      if (this._targetFloor.reflectivity !== undefined) {
        this.floorMat.envMapIntensity = lerp(0.8, this._targetFloor.reflectivity, ease);
      }

      if (this._tweenT >= 1) this._tweening = false;
    }
  }

  setGridVisible(v) {
    this.grid.visible = v;
  }

  dispose() {
    this.group.traverse((c) => {
      if (c.isMesh && c.geometry) c.geometry.dispose();
      if (c.isMesh && c.material) c.material.dispose();
    });
  }
}

export default StudioFloor;
