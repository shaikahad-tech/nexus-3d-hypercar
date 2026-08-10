/**
 * SceneManager — owns the renderer, scene graph, camera, and render loop.
 * Provides a single update(dt, t) entry point that the Director calls
 * each frame; subsystems register themselves as "tickers" to receive
 * per-frame updates without owning the RAF loop themselves.
 */
import * as THREE from 'three';
import bus from '../core/EventBus.js';
import { DEBUG, attachDebugPanel } from '../utils/debug.js';

class SceneManager {
  constructor(container) {
    this.container = container;
    this.tickers = [];
    this._running = false;

    this._createRenderer();
    this._createScene();
    this._createCamera();
    this._createClock();

    if (DEBUG) this.debugPanel = attachDebugPanel(this.renderer, this.scene, this.camera);

    window.addEventListener('resize', () => this._onResize());
  }

  _createRenderer() {
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.container.appendChild(this.renderer.domElement);
  }

  _createScene() {
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x08090c, 0.018);
  }

  _createCamera() {
    this.camera = new THREE.PerspectiveCamera(
      42, window.innerWidth / window.innerHeight, 0.1, 200
    );
    this.camera.position.set(7.5, 3.2, 8.5);
  }

  _createClock() {
    this.clock = new THREE.Clock();
  }

  // --- Ticker registration ---
  addTicker(fn) {
    this.tickers.push(fn);
    return () => {
      const i = this.tickers.indexOf(fn);
      if (i >= 0) this.tickers.splice(i, 1);
    };
  }

  // --- Lifecycle ---
  start() {
    if (this._running) return;
    this._running = true;
    this._loop();
  }

  stop() {
    this._running = false;
  }

  _loop() {
    if (!this._running) return;
    requestAnimationFrame(() => this._loop());
    const dt = this.clock.getDelta();
    const t = this.clock.getElapsedTime();
    this._update(dt, t);
  }

  _update(dt, t) {
    for (const ticker of this.tickers) {
      ticker(dt, t);
    }
    bus.emit('frame:render', { dt, t });
    this.renderer.render(this.scene, this.camera);
  }

  _onResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    bus.emit('scene:resize', {
      width: window.innerWidth,
      height: window.innerHeight,
    });
  }

  get domElement() {
    return this.renderer.domElement;
  }

  dispose() {
    this.stop();
    window.removeEventListener('resize', this._onResize);
    this.renderer.dispose();
    if (this.renderer.domElement.parentNode) {
      this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
    }
  }
}

export default SceneManager;
