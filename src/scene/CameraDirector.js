/**
 * CameraDirector — orchestrates camera behavior.
 * Wraps OrbitControls and adds cinematic presets, smooth intro
 * animation, auto-rotate, cinematic sequence playback, and
 * FOV animation during preset transitions.
 *
 * Inspired by PorscheLab's 8 camera angles and the Mustang
 * showcase's GSAP-driven camera transitions.
 */
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import state from '../core/StateManager.js';
import bus from '../core/EventBus.js';
import { easeOutCubic, easeInOutCubic, lerp } from '../utils/math.js';
import { CAMERA_PRESETS, CINEMATIC_SEQUENCE } from '../config/cameraPresets.js';

class CameraDirector {
  constructor(camera, domElement) {
    this.camera = camera;
    this.controls = new OrbitControls(camera, domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.06;
    this.controls.minDistance = 3;
    this.controls.maxDistance = 25;
    this.controls.maxPolarAngle = Math.PI * 0.49;
    this.controls.target.set(0, 0.55, 0);
    this.controls.autoRotateSpeed = 0.8;

    this._introT = 0;
    this._introActive = true;
    this._tween = null;
    this._cinematicPlaying = false;
    this._cinematicIndex = 0;
    this._cinematicTimer = 0;

    this._bindEvents();
    this._startIntro();
  }

  _bindEvents() {
    bus.on('camera:preset', (name) => this.moveToPreset(name));
    bus.on('cinematic:start', () => this.startCinematic());
    bus.on('cinematic:stop', () => this.stopCinematic());
    bus.on('state:change:autoRotate', (v) => {
      this.controls.autoRotate = v;
    });
  }

  _startIntro() {
    const start = new THREE.Vector3(14, 7, 16);
    const end = new THREE.Vector3(...CAMERA_PRESETS.hero.pos);
    this.camera.position.copy(start);
    this.camera.fov = 55;
    this.camera.updateProjectionMatrix();
    this._introStart = start;
    this._introEnd = end;
    this._introFovStart = 55;
    this._introFovEnd = CAMERA_PRESETS.hero.fov;
    this._introActive = true;
  }

  moveToPreset(name) {
    const p = CAMERA_PRESETS[name];
    if (!p) return;
    state.set('activePreset', name);
    this._tween = {
      startPos: this.camera.position.clone(),
      endPos: new THREE.Vector3(...p.pos),
      startTarget: this.controls.target.clone(),
      endTarget: new THREE.Vector3(...p.target),
      startFov: this.camera.fov,
      endFov: p.fov,
      t: 0,
      duration: p.duration || 1.2,
    };
  }

  startCinematic() {
    this._cinematicPlaying = true;
    this._cinematicIndex = 0;
    this._cinematicTimer = 0;
    state.set('cinematicMode', true);
    // Jump to first preset immediately
    const seq = CINEMATIC_SEQUENCE[0];
    this.moveToPreset(seq.preset);
  }

  stopCinematic() {
    this._cinematicPlaying = false;
    state.set('cinematicMode', false);
    // Return to hero
    this.moveToPreset('hero');
  }

  update(dt) {
    // Intro animation
    if (this._introActive) {
      this._introT += dt / 2.0;
      if (this._introT >= 1) {
        this._introT = 1;
        this._introActive = false;
      }
      const e = easeOutCubic(Math.min(this._introT, 1));
      this.camera.position.lerpVectors(this._introStart, this._introEnd, e);
      this.camera.fov = lerp(this._introFovStart, this._introFovEnd, e);
      this.camera.updateProjectionMatrix();
    }

    // Preset tween
    if (this._tween) {
      this._tween.t += dt / this._tween.duration;
      const t = Math.min(this._tween.t, 1);
      const e = easeInOutCubic(t);
      this.camera.position.lerpVectors(this._tween.startPos, this._tween.endPos, e);
      this.controls.target.lerpVectors(this._tween.startTarget, this._tween.endTarget, e);
      this.camera.fov = lerp(this._tween.startFov, this._tween.endFov, e);
      this.camera.updateProjectionMatrix();
      if (this._tween.t >= 1) this._tween = null;
    }

    // Cinematic sequence
    if (this._cinematicPlaying && !this._tween) {
      this._cinematicTimer += dt;
      const currentStep = CINEMATIC_SEQUENCE[this._cinematicIndex];
      if (this._cinematicTimer >= currentStep.hold) {
        this._cinematicTimer = 0;
        this._cinematicIndex = (this._cinematicIndex + 1) % CINEMATIC_SEQUENCE.length;
        const nextStep = CINEMATIC_SEQUENCE[this._cinematicIndex];
        this.moveToPreset(nextStep.preset);
      }
    }

    this.controls.update();
  }

  get presets() { return Object.keys(CAMERA_PRESETS); }

  dispose() {
    this.controls.dispose();
  }
}

export default CameraDirector;
