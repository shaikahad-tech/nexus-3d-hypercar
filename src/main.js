/**
 * main.js — Application entry point / bootstrap.
 *
 * Architecture flow:
 *   1. Create SceneManager (owns renderer, scene, camera, RAF loop)
 *   2. Create AssetLoader + Environment (procedural env map)
 *   3. Create LightingRig (cinematic 4-point studio lighting)
 *   4. Create CarBuilder (component-based vehicle assembly)
 *   5. Create effects (Particles, StudioFloor, UnderglowFX)
 *   6. Create PostFX (bloom + SMAA pipeline)
 *   7. Create CameraDirector (orbit controls + cinematic presets)
 *   8. Init UI (HUD + Configurator + PerformanceMeter)
 *   9. Register tickers on SceneManager → start render loop
 *
 * Every subsystem communicates via the EventBus — no direct imports
 * between siblings. The only thing that knows about everything is
 * this file.
 */
import * as THREE from 'three';

import SceneManager from './scene/SceneManager.js';
import LightingRig from './scene/LightingRig.js';
import Environment from './scene/Environment.js';
import PostFX from './scene/PostFX.js';
import CameraDirector from './scene/CameraDirector.js';
import AssetLoader from './core/AssetLoader.js';
import bus from './core/EventBus.js';
import state from './core/StateManager.js';

import matLib from './materials/MaterialLibrary.js';

import CarBuilder from './car/CarBuilder.js';
import ParticleSystem from './effects/ParticleSystem.js';
import StudioFloor from './effects/StudioFloor.js';
import UnderglowFX from './effects/UnderglowFX.js';

import HUD from './ui/HUD.js';
import Configurator from './ui/Configurator.js';
import PerformanceMeter from './ui/PerformanceMeter.js';

import { log } from './utils/debug.js';

class App {
  constructor() {
    this.sceneMgr = null;
    this.lighting = null;
    this.env = null;
    this.postfx = null;
    this.cameraDir = null;
    this.car = null;
    this.particles = null;
    this.floor = null;
    this.underglow = null;
    this.hud = null;
    this.configurator = null;
    this.perfMeter = null;
  }

  async init() {
    log('[App] initializing...');

    // 1. Scene
    const container = document.getElementById('canvas-wrap');
    this.sceneMgr = new SceneManager(container);

    // 2. Assets + Environment
    const loader = new AssetLoader(this.sceneMgr.renderer);
    this.env = new Environment(this.sceneMgr.scene, this.sceneMgr.renderer, loader);
    await this.env.load();

    // 3. Lighting
    this.lighting = new LightingRig(this.sceneMgr.scene);

    // 4. Car
    this.car = new CarBuilder();
    this.sceneMgr.scene.add(this.car.group);

    // 5. Effects
    this.particles = new ParticleSystem(250);
    this.sceneMgr.scene.add(this.particles.object);

    this.floor = new StudioFloor();
    this.sceneMgr.scene.add(this.floor.group);

    this.underglow = new UnderglowFX();
    this.sceneMgr.scene.add(this.underglow.object);

    // 6. Post-processing
    this.postfx = new PostFX(this.sceneMgr.renderer, this.sceneMgr.scene, this.sceneMgr.camera);

    // 7. Camera director
    this.cameraDir = new CameraDirector(this.sceneMgr.camera, this.sceneMgr.domElement);

    // 8. UI
    this.hud = new HUD();
    this.hud.init();

    this.configurator = new Configurator();
    this.configurator.init();

    this.perfMeter = new PerformanceMeter(this.sceneMgr.renderer);

    // 9. Register tickers
    this.sceneMgr.addTicker((dt, t) => this._tick(dt, t));

    // Handle resize for PostFX
    bus.on('scene:resize', ({ width, height }) => {
      this.postfx.setSize(width, height);
    });

    state.set('scene.ready', true);
    bus.emit('app:ready');

    // Hide the loading screen
    const loaderEl = document.getElementById('loader');
    if (loaderEl) {
      setTimeout(() => loaderEl.classList.add('hide'), 300);
    }

    log('[App] ready');
  }

  _tick(dt, t) {
    // Update all subsystems
    this.cameraDir.update(dt);
    this.car.update(dt, t);
    this.particles.update(dt, t);
    this.floor.update(dt, t);
    this.underglow.update(dt, t);
    this.hud.updateRPM(t);
    this.perfMeter.update();

    // Render through PostFX pipeline instead of raw renderer
    this.postfx.render();
  }

  dispose() {
    this.sceneMgr.dispose();
    this.lighting.dispose();
    this.env.dispose();
    this.car.dispose();
    this.particles.dispose();
    this.floor.dispose();
    this.underglow.dispose();
    this.postfx.dispose();
    this.cameraDir.dispose();
    this.hud.dispose();
    this.perfMeter.dispose();
    matLib.dispose();
    bus.clear();
  }
}

// ---- Boot ----
const app = new App();

// Wait for DOM, then initialize
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => app.init().catch(console.error));
} else {
  app.init().catch(console.error);
}

// Expose for debugging
window.__NEXUS = app;

export default app;
