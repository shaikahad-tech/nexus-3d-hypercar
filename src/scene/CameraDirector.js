/**
 * CameraDirector — orchestrates camera behavior.
 * Wraps OrbitControls and adds cinematic presets, a smooth intro
 * animation, and auto-rotate driven by the StateManager.
 */
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import state from '../core/StateManager.js';
import bus from '../core/EventBus.js';
import { easeOutCubic } from '../utils/math.js';

const PRESETS = {
  hero:       { pos: [7.5, 3.2, 8.5],   target: [0, 0.55, 0] },
  front:      { pos: [0, 2.0, 11.0],   target: [0, 0.6, 0] },
  side:       { pos: [12.0, 1.8, 0.0],  target: [0, 0.6, 0] },
  rear:       { pos: [0, 2.5, -10.0],   target: [0, 0.7, 0] },
  top:        { pos: [0.1, 12.0, 0.1],  target: [0, 0, 0] },
  low:        { pos: [4.0, 0.5, 7.0],   target: [0, 0.5, 0] },
};

class CameraDirector {
  constructor(camera, domElement) {
    this.camera = camera;
    this.controls = new OrbitControls(camera, domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.06;
    this.controls.minDistance = 5;
    this.controls.maxDistance = 20;
    this.controls.maxPolarAngle = Math.PI * 0.49;
    this.controls.target.set(0, 0.55, 0);
    this.controls.autoRotateSpeed = 0.8;

    this._introT = 0;
    this._introActive = true;
    this._tween = null;

    this._bindEvents();

    // Start intro animation
    this._startIntro();
  }

  _bindEvents() {
    bus.on('camera:preset', (name) => this.moveToPreset(name));
    state && bus.on('state:change:autoRotate', (v) => {
      this.controls.autoRotate = v;
    });
  }

  _startIntro() {
    const start = new THREE.Vector3(12, 6, 14);
    const end = new THREE.Vector3(...PRESETS.hero.pos);
    this.camera.position.copy(start);
    this._introStart = start;
    this._introEnd = end;
    this._introActive = true;
  }

  moveToPreset(name) {
    const p = PRESETS[name];
    if (!p) return;
    this._tween = {
      startPos: this.camera.position.clone(),
      endPos: new THREE.Vector3(...p.pos),
      startTarget: this.controls.target.clone(),
      endTarget: new THREE.Vector3(...p.target),
      t: 0,
      duration: 1.2,
    };
  }

  update(dt) {
    // Intro animation
    if (this._introActive) {
      this._introT += dt / 1.5;
      if (this._introT >= 1) {
        this._introT = 1;
        this._introActive = false;
      }
      const e = easeOutCubic(Math.min(this._introT, 1));
      this.camera.position.lerpVectors(this._introStart, this._introEnd, e);
    }

    // Preset tween
    if (this._tween) {
      this._tween.t += dt / this._tween.duration;
      const e = easeOutCubic(Math.min(this._tween.t, 1));
      this.camera.position.lerpVectors(this._tween.startPos, this._tween.endPos, e);
      this.controls.target.lerpVectors(this._tween.startTarget, this._tween.endTarget, e);
      if (this._tween.t >= 1) this._tween = null;
    }

    this.controls.update();
  }

  get presets() { return Object.keys(PRESETS); }

  dispose() {
    this.controls.dispose();
  }
}

export default CameraDirector;
