/**
 * main.js — Application entry point / bootstrap.
 *
 * Architecture flow:
 *   1. Create SceneManager (owns renderer, scene, camera, RAF loop)
 *   2. Create AssetLoader + Environment (procedural env map)
 *   3. Create LightingRig (cinematic 5-point studio lighting)
 *   4. Create CarBuilder (component-based vehicle assembly)
 *   5. Create effects (Particles, StudioFloor, UnderglowFX)
 *   6. Create PostFX (bloom + SMAA + vignette pipeline)
 *   7. Create CameraDirector (orbit controls + 12 cinematic presets)
 *   8. Create PhysicsSimulator (engine RPM, suspension, braking)
 *   9. Create AudioEngine (procedural Web Audio sound synthesis)
 *  10. Create SceneModeManager (studio/day/sunset/night/cyberpunk)
 *  11. Create Interaction systems (Keyboard, Hotspots, Screenshot)
 *  12. Init UI (HUD + Configurator + HotspotPanel + PerformanceMeter)
 *  13. Register tickers on SceneManager → start render loop
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
  }

  async init() {
    log('[App] initializing...');

    const container = document.getElementById('canvas-wrap');
    this.sceneMgr = new SceneManager(container);

    const loader = new AssetLoader(this.sceneMgr.renderer);
    this.env = new Environment(this.sceneMgr.scene, this.sceneMgr.renderer, loader);
    await this.env.load();

    this.lighting = new LightingRig(this.sceneMgr.scene);

    this.car = new CarBuilder();
    this.sceneMgr.scene.add(this.car.group);

    this.particles = new ParticleSystem({ count: 250 });
    this.sceneMgr.scene.add(this.particles.object);

    this.floor = new StudioFloor();
    this.sceneMgr.scene.add(this.floor.group);

    this.underglow = new UnderglowFX();
    this.sceneMgr.scene.add(this.underglow.object);
    this.sceneMgr.scene.add(this.underglow.light);

    this.postfx = new PostFX(this.sceneMgr.renderer, this.sceneMgr.scene, this.sceneMgr.camera);

    this.cameraDir = new CameraDirector(this.sceneMgr.camera, this.sceneMgr.domElement);

    this.physics = new PhysicsSimulator();

    this.sceneModeMgr = new SceneModeManager(
      this.sceneMgr, this.lighting, this.env, this.postfx, this.floor
    );

    this.keyboard = new KeyboardController();
    this.keyboard.attach();

    this.hotspots = new HotspotSystem(this.sceneMgr.camera, this.sceneMgr.domElement);
    this.sceneMgr.scene.add(this.hotspots.group);

    this.screenshot = new ScreenshotManager(this.sceneMgr.renderer);
    this.sceneMgr.renderer.userData.scene = this.sceneMgr.scene;
    this.sceneMgr.renderer.userData.camera = this.sceneMgr.camera;

    this.hud = new HUD();
    this.hud.init();

    this.configurator = new Configurator();
    this.configurator.init();

    this.hotspotPanel = new HotspotPanel();

    this.perfMeter = new PerformanceMeter(this.sceneMgr.renderer);

    this.sceneMgr.addTicker((dt, t) => this._tick(dt, t));

    bus.on('scene:resize', ({ width, height }) => {
      this.postfx.setSize(width, height);
    });

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

  _tick(dt, t) {
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

    this.postfx.render();
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

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => app.init().catch(console.error));
} else {
  app.init().catch(console.error);
}

window.__NEXUS = app;

export default app;
