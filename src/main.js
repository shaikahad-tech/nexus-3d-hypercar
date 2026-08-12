/**
 * main.js — Application entry point / bootstrap.
 *
 * Every subsystem communicates via the EventBus — no direct imports
 * between siblings. The only thing that knows about everything is
 * this file.
 */
import SceneManager from './scene/SceneManager.js';
import LightingRig from './scene/LightingRig.js';
import Environment from './scene/Environment.js';
import PostFX from './scene/PostFX.js';
import CameraDirector from './scene/CameraDirector.js';
import SceneModeManager from './scene/SceneModeManager.js';
import AssetLoader from './core/AssetLoader.js';
import bus from './core/EventBus.js';
import state from './core/StateManager.js';

import matLib from './materials/MaterialLibrary.js';

import CarBuilder from './car/CarBuilder.js';
import ParticleSystem from './effects/ParticleSystem.js';
import StudioFloor from './effects/StudioFloor.js';
import UnderglowFX from './effects/UnderglowFX.js';
import PhysicsSimulator from './physics/PhysicsSimulator.js';
import audio from './audio/AudioEngine.js';

import HUD from './ui/HUD.js';
import Configurator from './ui/Configurator.js';
import HotspotPanel from './ui/HotspotPanel.js';
import PerformanceMeter from './ui/PerformanceMeter.js';

import KeyboardController from './interaction/KeyboardController.js';
import HotspotSystem from './interaction/HotspotSystem.js';
import ScreenshotManager from './interaction/ScreenshotManager.js';

import { log } from './utils/debug.js';

/** Show an error overlay on the page so crashes are visible */
function showFatalError(message, error) {
  const loader = document.getElementById('loader');
  if (loader) loader.style.display = 'none';

  let overlay = document.getElementById('fatal-error');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'fatal-error';
    overlay.style.cssText = `
      position:fixed; inset:0; z-index:9999;
      background:#0a0c10; color:#e8eaed;
      font-family:'JetBrains Mono',monospace; font-size:13px;
      padding:40px; overflow:auto; line-height:1.6;
    `;
    document.body.appendChild(overlay);
  }

  const stack = error?.stack || error?.message || String(error || '');
  overlay.innerHTML = `
    <h2 style="color:#ff3d2e;font-family:'Bricolage Grotesque',sans-serif;font-size:22px;margin-bottom:16px;">
      NEXUS 3D — Initialization Error
    </h2>
    <p style="color:#8b919e;margin-bottom:20px;">${message}</p>
    <pre style="background:#141821;border:1px solid rgba(255,255,255,0.1);border-radius:8px;padding:16px;overflow-x:auto;color:#ff6b6b;font-size:12px;white-space:pre-wrap;">${stack}</pre>
    <p style="color:#5a5f6a;margin-top:20px;font-size:11px;">
      Open the browser console (F12) for more details. Take a screenshot of this error and report it.
    </p>
  `;
}

/** Wrap an init step in try/catch with a descriptive label */
function step(label, fn) {
  try {
    log(`[App] ${label}...`);
    const result = fn();
    log(`[App] ✓ ${label}`);
    return result;
  } catch (err) {
    showFatalError(`Failed during: ${label}`, err);
    console.error(`[App] ✗ ${label}:`, err);
    throw err;
  }
}

class App {
  constructor() {
    this.sceneMgr = null;
    this.lighting = null;
    this.env = null;
    this.postfx = null;
    this.cameraDir = null;
    this.sceneModeMgr = null;
    this.car = null;
    this.particles = null;
    this.floor = null;
    this.underglow = null;
    this.physics = null;
    this.audio = audio;
    this.hud = null;
    this.configurator = null;
    this.hotspotPanel = null;
    this.perfMeter = null;
    this.keyboard = null;
    this.hotspots = null;
    this.screenshot = null;
    this._perfCheckTimer = 0;
  }

  _checkWebGL() {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
      if (!gl) throw new Error('No WebGL context');
      return true;
    } catch (e) {
      showFatalError('WebGL is not supported by your browser or device.', e);
      return false;
    }
  }

  async init() {
    log('[App] initializing...');

    if (!this._checkWebGL()) return;

    const container = document.getElementById('canvas-wrap');

    // --- Phase 1: Core setup ---
    this.sceneMgr = step('SceneManager', () => new SceneManager(container));

    this._wireLoader();

    const loader = step('AssetLoader', () => new AssetLoader(this.sceneMgr.renderer));
    this.env = step('Environment', () => new Environment(this.sceneMgr.scene, this.sceneMgr.renderer, loader));

    // --- Phase 2: Load assets ---
    try {
      await this.env.load();
      log('[App] ✓ Environment loaded');
    } catch (err) {
      showFatalError('Failed to load environment assets.', err);
      throw err;
    }

    // --- Phase 3: Build 3D scene ---
    this.lighting = step('LightingRig', () => new LightingRig(this.sceneMgr.scene));
    this.car = step('CarBuilder', () => new CarBuilder());
    this.sceneMgr.scene.add(this.car.group);

    this.particles = step('ParticleSystem', () => new ParticleSystem({ count: 250 }));
    this.sceneMgr.scene.add(this.particles.object);

    this.floor = step('StudioFloor', () => new StudioFloor());
    this.sceneMgr.scene.add(this.floor.group);

    this.underglow = step('UnderglowFX', () => new UnderglowFX());
    this.sceneMgr.scene.add(this.underglow.object);
    this.sceneMgr.scene.add(this.underglow.light);

    // --- Phase 4: Post-processing ---
    this.postfx = step('PostFX', () => new PostFX(this.sceneMgr.renderer, this.sceneMgr.scene, this.sceneMgr.camera));

    // --- Phase 5: Camera + physics ---
    this.cameraDir = step('CameraDirector', () => new CameraDirector(this.sceneMgr.camera, this.sceneMgr.domElement));
    this.physics = step('PhysicsSimulator', () => new PhysicsSimulator());

    this.sceneModeMgr = step('SceneModeManager', () => new SceneModeManager(
      this.sceneMgr, this.lighting, this.env, this.postfx, this.floor
    ));

    // --- Phase 6: Interaction ---
    this.keyboard = step('KeyboardController', () => new KeyboardController());
    this.keyboard.attach();

    this.hotspots = step('HotspotSystem', () => new HotspotSystem(this.sceneMgr.camera, this.sceneMgr.domElement));
    this.sceneMgr.scene.add(this.hotspots.group);

    this.screenshot = step('ScreenshotManager', () => new ScreenshotManager(this.sceneMgr.renderer));
    this.sceneMgr.renderer.userData.scene = this.sceneMgr.scene;
    this.sceneMgr.renderer.userData.camera = this.sceneMgr.camera;

    // --- Phase 7: UI ---
    this.hud = step('HUD', () => new HUD());
    this.hud.init();

    this.configurator = step('Configurator', () => new Configurator());
    this.configurator.init();

    this.hotspotPanel = step('HotspotPanel', () => new HotspotPanel());

    this.perfMeter = step('PerformanceMeter', () => new PerformanceMeter(this.sceneMgr.renderer));

    // --- Phase 8: Start ---
    this.sceneMgr.addTicker((dt, t) => this._tick(dt, t));

    bus.on('scene:resize', ({ width, height }) => {
      this.postfx.setSize(width, height);
    });

    bus.on('screenshot:saved', () => this._flashScreen());

    state.set('scene.ready', true);
    state.set('scene.assetsLoaded', true);
    bus.emit('app:ready');

    this.sceneMgr.start();

    const loaderEl = document.getElementById('loader');
    if (loaderEl) {
      setTimeout(() => loaderEl.classList.add('hide'), 500);
    }

    log('[App] ready — all subsystems initialized');
  }

  _wireLoader() {
    const bar = document.getElementById('loaderBar');
    const text = document.getElementById('loaderProgress');

    bus.on('assets:progress', ({ completed, total, progress, key }) => {
      const pct = Math.round(progress * 100);
      if (bar) bar.style.width = pct + '%';
      if (text) text.textContent = `Loading ${key}... ${pct}%`;
    });

    bus.on('assets:complete', () => {
      if (bar) bar.style.width = '100%';
      if (text) text.textContent = 'Starting render engine...';
    });
  }

  _flashScreen() {
    const flash = document.getElementById('screenshot-flash');
    if (!flash) return;
    flash.style.opacity = '0.8';
    setTimeout(() => { flash.style.opacity = '0'; }, 150);
  }

  _tick(dt, t) {
    try {
      this.physics.update(dt, t);
      const physicsData = this.physics.getPhysicsData();

      this.cameraDir.update(dt);
      this.car.update(dt, t, physicsData);

      this.particles.update(dt, t);
      this.floor.update(dt, t);
      this.underglow.update(dt, t);
      this.hotspots.update(dt, t);

      this.audio.update(dt, t);
      this.lighting.update(dt);

      this.hud.updateRPM(t, physicsData.rpm, physicsData.speed);
      this.perfMeter.update();

      this._perfCheckTimer += dt;
      if (this._perfCheckTimer > 3.0) {
        this._perfCheckTimer = 0;
        this._autoScaleQuality();
      }

      this.postfx.render();
    } catch (err) {
      console.error('[App] tick error:', err);
      // Stop the render loop to avoid spam
      this.sceneMgr?.stop();
      showFatalError('Error during render loop (tick).', err);
    }
  }

  _autoScaleQuality() {
    const fps = this.perfMeter?.frames
      ? Math.round((this.perfMeter.frames * 1000) / (performance.now() - this.perfMeter.lastTime + 1))
      : 60;

    if (fps < 30 && state.get('shadowsEnabled')) {
      log('[App] FPS low, disabling shadows for performance');
      this.sceneMgr.renderer.shadowMap.enabled = false;
      state.set('shadowsEnabled', false);
      this.sceneMgr.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    }
  }

  dispose() {
    this.keyboard?.dispose();
    this.hotspots?.dispose();
    this.screenshot?.dispose();
    this.sceneMgr?.dispose();
    this.lighting?.dispose();
    this.env?.dispose();
    this.car?.dispose();
    this.particles?.dispose();
    this.floor?.dispose();
    this.underglow?.dispose();
    this.postfx?.dispose();
    this.cameraDir?.dispose();
    this.physics?.dispose();
    this.audio?.dispose();
    this.hud?.dispose();
    this.hotspotPanel?.dispose();
    this.perfMeter?.dispose();
    matLib.dispose();
    bus.clear();
  }
}

const app = new App();

// Global error handlers — catch uncaught errors and promise rejections
window.addEventListener('error', (e) => {
  showFatalError('Uncaught error:', e.error || e.message);
});

window.addEventListener('unhandledrejection', (e) => {
  showFatalError('Unhandled promise rejection:', e.reason);
});

function boot() {
  app.init().catch((err) => {
    console.error('[App] init failed:', err);
    showFatalError('Application failed to initialize.', err);
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}

window.__NEXUS = app;

export default app;
