/**
 * Configurator — right-side panel with paint swatches, rim finishes,
 * caliper colors, and toggle switches for all car systems.
 *
 * Mutates state via the StateManager; the EventBus propagates changes
 * to the MaterialLibrary, CarLights, UnderglowFX, StudioFloor, etc.
 */
import { PAINT_COLORS, RIM_FINISHES, CALIPER_COLORS } from '../config/paintColors.js';
import { SCENE_MODE_LIST } from '../config/sceneModes.js';
import { CAMERA_PRESET_LIST } from '../config/cameraPresets.js';
import { VEHICLE_VARIANTS } from '../config/carSpecs.js';
import state from '../core/StateManager.js';
import bus from '../core/EventBus.js';
import matLib from '../materials/MaterialLibrary.js';
import { log } from '../utils/debug.js';

class Configurator {
  constructor() {
    this.el = null;
    this.activeTab = 'paint';
  }

  init() {
    this.el = document.getElementById('hud');
    if (!this.el) return;
    this._buildPanel();
    this._bindEvents();
  }

  _buildPanel() {
    const panel = document.createElement('div');
    panel.className = 'hud-right-panel';
    panel.id = 'configurator';

    panel.innerHTML = `
      <div class="panel-label">Configurator</div>

      <div class="config-tabs">
        <button class="config-tab active" data-tab="paint">Paint</button>
        <button class="config-tab" data-tab="wheels">Wheels</button>
        <button class="config-tab" data-tab="scene">Scene</button>
        <button class="config-tab" data-tab="camera">Camera</button>
      </div>

      <!-- Paint tab -->
      <div class="config-tab-content active" data-content="paint">
        <div class="color-grid" id="colorGrid">${this._paintSwatches()}</div>

        <!-- Custom color picker -->
        <div class="config-section">
          <div class="config-section-label">Custom Color</div>
          <div class="custom-color-row">
            <input type="color" id="customColorPicker" value="#ff3d2e" class="color-input">
            <button class="action-btn compact" id="applyCustomColor">Apply</button>
          </div>
        </div>

        <div class="config-section">
          <div class="config-section-label">Toggles</div>
          ${this._toggleRow('lightsOn', 'Headlights')}
          ${this._toggleRow('underglowOn', 'Underglow')}
          ${this._toggleRow('autoRotate', 'Auto-Rotate')}
          ${this._toggleRow('floorVisible', 'Studio Floor')}
          ${this._toggleRow('particlesVisible', 'Particles')}
          ${this._toggleRow('hotspotsVisible', 'Hotspots')}
          ${this._toggleRow('physicsEnabled', 'Physics Sim')}
          ${this._toggleRow('audioEnabled', 'Audio Engine')}
        </div>
      </div>

      <!-- Wheels tab -->
      <div class="config-tab-content" data-content="wheels">
        <div class="config-section">
          <div class="config-section-label">Rim Finish</div>
          <div class="color-grid" id="rimGrid">${this._rimSwatches()}</div>
        </div>
        <div class="config-section">
          <div class="config-section-label">Brake Calipers</div>
          <div class="color-grid" id="caliperGrid">${this._caliperSwatches()}</div>
        </div>
      </div>

      <!-- Scene tab -->
      <div class="config-tab-content" data-content="scene">
        <div class="config-section">
          <div class="config-section-label">Environment</div>
          <div class="scene-grid" id="sceneGrid">${this._sceneButtons()}</div>
        </div>
        <div class="config-section">
          <div class="config-section-label">Vehicle</div>
          <div class="vehicle-list" id="vehicleList">${this._vehicleButtons()}</div>
        </div>
      </div>

      <!-- Camera tab -->
      <div class="config-tab-content" data-content="camera">
        <div class="config-section">
          <div class="config-section-label">Camera Presets</div>
          <div class="camera-grid" id="cameraGrid">${this._cameraButtons()}</div>
        </div>
        <div class="config-section">
          <div class="config-section-label">Quality</div>
          ${this._toggleRow('shadowsEnabled', 'Shadows')}
        </div>
        <div class="config-section">
          <button class="action-btn" id="cinematicBtn">Play Cinematic</button>
          <button class="action-btn" id="screenshotBtn">Take Screenshot</button>
        </div>
      </div>
    `;
    this.el.appendChild(panel);
  }

  _paintSwatches() {
    return PAINT_COLORS.map((c, i) => {
      const hex = '#' + c.hex.toString(16).padStart(6, '0');
      return `<div class="swatch${i === 0 ? ' active' : ''}" data-index="${i}" style="background:${hex}; color:${hex};" title="${c.name} (${c.category})"></div>`;
    }).join('');
  }

  _rimSwatches() {
    return RIM_FINISHES.map((c, i) => {
      const hex = '#' + c.hex.toString(16).padStart(6, '0');
      return `<div class="swatch${i === 0 ? ' active' : ''}" data-rim-index="${i}" style="background:${hex}; color:${hex};" title="${c.name}"></div>`;
    }).join('');
  }

  _caliperSwatches() {
    return CALIPER_COLORS.map((c, i) => {
      const hex = '#' + c.hex.toString(16).padStart(6, '0');
      return `<div class="swatch${i === 0 ? ' active' : ''}" data-caliper-index="${i}" style="background:${hex}; color:${hex};" title="${c.name}"></div>`;
    }).join('');
  }

  _sceneButtons() {
    return SCENE_MODE_LIST.map((m, i) => {
      return `<button class="scene-btn${i === 0 ? ' active' : ''}" data-scene="${m.id}" title="${m.name}">${m.name}</button>`;
    }).join('');
  }

  _vehicleButtons() {
    return VEHICLE_VARIANTS.map((v, i) => {
      return `<button class="vehicle-btn${i === 0 ? ' active' : ''}" data-vehicle="${i}" title="${v.name} — ${v.tagline}"><span class="vehicle-name">${v.name}</span><span class="vehicle-cat">${v.category}</span></button>`;
    }).join('');
  }

  _cameraButtons() {
    return CAMERA_PRESET_LIST.map((p) => {
      return `<button class="camera-btn" data-preset="${p.id}" title="${p.name}">${p.name}</button>`;
    }).join('');
  }

  _toggleRow(key, label) {
    return `
      <div class="toggle-row">
        <span class="toggle-label">${label}</span>
        <div class="toggle${state.get(key) ? ' on' : ''}" data-toggle="${key}"></div>
      </div>
    `;
  }

  _bindEvents() {
    // Tab switching
    document.querySelectorAll('.config-tab').forEach((tab) => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.config-tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.config-tab-content').forEach(c => c.classList.remove('active'));
        tab.classList.add('active');
        document.querySelector(`[data-content="${tab.dataset.tab}"]`)?.classList.add('active');
        this.activeTab = tab.dataset.tab;
      });
    });

    // Paint swatch clicks
    const grid = document.getElementById('colorGrid');
    if (grid) {
      grid.addEventListener('click', (e) => {
        const sw = e.target.closest('.swatch');
        if (!sw || !sw.dataset.index) return;
        const index = parseInt(sw.dataset.index, 10);
        grid.querySelectorAll('.swatch').forEach(s => s.classList.remove('active'));
        sw.classList.add('active');
        state.set('activeColorIndex', index);
        matLib.setPaintIndex(index);
        bus.emit('audio:click');
      });
    }

    // Custom color picker
    const applyBtn = document.getElementById('applyCustomColor');
    const colorInput = document.getElementById('customColorPicker');
    if (applyBtn && colorInput) {
      applyBtn.addEventListener('click', () => {
        const hexStr = colorInput.value;
        const hex = parseInt(hexStr.replace('#', ''), 16);
        bus.emit('paint:change', {
          hex,
          metalness: 0.9,
          roughness: 0.25,
          clearcoat: 1.0,
          category: 'custom',
          flakeIntensity: 0.7,
        });
        bus.emit('audio:click');
      });
    }

    // Rim swatch clicks
    const rimGrid = document.getElementById('rimGrid');
    if (rimGrid) {
      rimGrid.addEventListener('click', (e) => {
        const sw = e.target.closest('.swatch');
        if (!sw || !sw.dataset.rimIndex) return;
        const index = parseInt(sw.dataset.rimIndex, 10);
        rimGrid.querySelectorAll('.swatch').forEach(s => s.classList.remove('active'));
        sw.classList.add('active');
        state.set('activeRimIndex', index);
        matLib.setRimIndex(index);
        bus.emit('audio:click');
      });
    }

    // Caliper swatch clicks
    const caliperGrid = document.getElementById('caliperGrid');
    if (caliperGrid) {
      caliperGrid.addEventListener('click', (e) => {
        const sw = e.target.closest('.swatch');
        if (!sw || !sw.dataset.caliperIndex) return;
        const index = parseInt(sw.dataset.caliperIndex, 10);
        caliperGrid.querySelectorAll('.swatch').forEach(s => s.classList.remove('active'));
        sw.classList.add('active');
        state.set('activeCaliperIndex', index);
        matLib.setCaliperIndex(index);
        bus.emit('audio:click');
      });
    }

    // Scene mode buttons
    document.querySelectorAll('.scene-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.scene-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        bus.emit('scene:set', btn.dataset.scene);
        bus.emit('audio:click');
      });
    });

    // Vehicle buttons
    document.querySelectorAll('.vehicle-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.vehicle-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const index = parseInt(btn.dataset.vehicle, 10);
        state.set('activeVehicleIndex', index);
        bus.emit('vehicle:change', index);
        bus.emit('audio:click');
      });
    });

    // Camera preset buttons
    document.querySelectorAll('.camera-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        bus.emit('camera:preset', btn.dataset.preset);
        bus.emit('audio:click');
      });
    });

    // Cinematic button
    const cinBtn = document.getElementById('cinematicBtn');
    if (cinBtn) {
      cinBtn.addEventListener('click', () => {
        if (state.get('cinematicMode')) {
          bus.emit('cinematic:stop');
          cinBtn.textContent = 'Play Cinematic';
        } else {
          bus.emit('cinematic:start');
          cinBtn.textContent = 'Stop Cinematic';
        }
        bus.emit('audio:click');
      });
    }

    // Screenshot button
    document.getElementById('screenshotBtn')?.addEventListener('click', () => {
      bus.emit('screenshot');
      bus.emit('audio:click');
    });

    // Toggle clicks (including new hotspotsVisible and shadowsEnabled)
    document.querySelectorAll('.toggle').forEach((t) => {
      t.addEventListener('click', () => {
        const key = t.dataset.toggle;
        const newVal = !state.get(key);
        state.set(key, newVal);
        t.classList.toggle('on', newVal);
        log(`[Configurator] ${key} → ${newVal}`);
        bus.emit('audio:click');
      });
    });

    // Listen for cinematic mode state changes
    bus.on('state:change:cinematicMode', (v) => {
      const btn = document.getElementById('cinematicBtn');
      if (btn) btn.textContent = v ? 'Stop Cinematic' : 'Play Cinematic';
    });
  }

  dispose() {
    // Panel is part of #hud, cleared by HUD.dispose()
  }
}

export default Configurator;
