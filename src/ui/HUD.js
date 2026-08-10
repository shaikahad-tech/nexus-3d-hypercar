/**
 * HUD — static heads-up display overlay.
 * Renders the top bar (brand + live indicators), left panel (tech specs),
 * bottom bar (performance strip + RPM gauge + hints), and
 * the cinematic mode indicator.
 *
 * Reads spec data from carSpecs config and builds the DOM once on init.
 * The RPM readout updates live each frame from the physics simulator.
 */
import { CAR_SPECS as S } from '../config/carSpecs.js';
import { log } from '../utils/debug.js';
import bus from '../core/EventBus.js';

class HUD {
  constructor() {
    this.el = null;
    this.rpmEl = null;
    this.speedEl = null;
    this.modeEl = null;
  }

  init() {
    this.el = document.getElementById('hud');
    if (!this.el) {
      log('[HUD] #hud container not found');
      return;
    }
    this._buildTopBar();
    this._buildLeftPanel();
    this._buildBottomBar();
    this._buildCinematicIndicator();
    this._bindEvents();
  }

  _buildTopBar() {
    const top = document.createElement('div');
    top.className = 'hud-topbar';
    top.innerHTML = `
      <div class="brand">
        <div class="brand-mark">N3</div>
        <div class="brand-text">
          <span class="name">NEXUS · 3D</span>
          <span class="model" id="modelName">${S.name}</span>
        </div>
      </div>
      <div class="top-meta">
        <span class="meta-chip" id="modeChip"><span class="dot-live"></span><span id="modeText">Studio</span></span>
        <span class="meta-chip">${S.year} Concept</span>
        <span class="meta-chip">v${S.version}</span>
      </div>
    `;
    this.el.appendChild(top);
  }

  _buildLeftPanel() {
    const panel = document.createElement('div');
    panel.className = 'hud-left-panel';
    panel.id = 'specsPanel';

    const p = S.performance;
    const pt = S.powertrain;
    const a = S.aero;

    const specRow = (label, val, unit, accent) => `
      <div class="spec-row">
        <span class="spec-label">${label}</span>
        <span class="spec-val${accent ? ' accent' : ''}">${val}${unit ? `<span class="unit">${unit}</span>` : ''}</span>
      </div>
    `;

    panel.innerHTML = `
      <div class="panel-label">Technical Sheet</div>
      <div class="spec-section">
        <div class="spec-section-title">Performance</div>
        ${specRow('Powertrain', pt.type, '', true)}
        ${specRow('Peak Power', p.power.value.toLocaleString(), p.power.unit)}
        ${specRow('Torque', p.torque.value.toLocaleString(), p.torque.unit)}
        ${specRow('0–100 km/h', p.accel.value, p.accel.unit, true)}
        ${specRow('Top Speed', p.topSpeed.value, p.topSpeed.unit)}
        ${specRow('Power/Weight', p.powerToWeight.value, p.powerToWeight.unit)}
        ${specRow('Braking', p.braking.value, p.braking.unit)}
        ${specRow('Lateral G', p.lateral.value, p.lateral.unit)}
      </div>
      <div class="spec-section">
        <div class="spec-section-title">Powertrain</div>
        ${specRow('Motors', pt.motors, '')}
        ${specRow('Drivetrain', pt.drivetrain, '')}
        ${specRow('Battery', pt.battery.value, pt.battery.unit)}
        ${specRow('Range (WLTP)', pt.range.value, pt.range.unit)}
        ${specRow('Fast Charge', pt.charging.value, pt.charging.unit)}
        ${specRow('Regen', pt.regen.value, pt.regen.unit)}
      </div>
      <div class="spec-section">
        <div class="spec-section-title">Aerodynamics</div>
        ${specRow('Drag Cd', a.drag.value, a.drag.unit)}
        ${specRow('Downforce', a.downforce.value, a.downforce.unit)}
        ${specRow('Chassis', a.chassis, '')}
        ${specRow('Frontal Area', a.frontal.value, a.frontal.unit)}
      </div>
    `;
    this.el.appendChild(panel);
  }

  _buildBottomBar() {
    const p = S.performance;
    const bottom = document.createElement('div');
    bottom.className = 'hud-bottombar';
    bottom.innerHTML = `
      <div class="perf-strip">
        <div class="perf-cell">
          <div class="perf-num" id="rpmDisplay">8,<span style="color:var(--accent)">200</span></div>
          <div class="perf-lbl">RPM</div>
        </div>
        <div class="perf-cell">
          <div class="perf-num" id="speedDisplay">0<span class="u">km/h</span></div>
          <div class="perf-lbl">Speed</div>
        </div>
        <div class="perf-cell">
          <div class="perf-num">${p.accel.value}<span class="u">${p.accel.unit}</span></div>
          <div class="perf-lbl">0–100 km/h</div>
        </div>
        <div class="perf-cell">
          <div class="perf-num">${p.topSpeed.value}<span class="u">${p.topSpeed.unit}</span></div>
          <div class="perf-lbl">Top Speed</div>
        </div>
        <div class="perf-cell">
          <div class="perf-num">${p.power.value.toLocaleString()}<span class="u">${p.power.unit}</span></div>
          <div class="perf-lbl">Peak Output</div>
        </div>
      </div>
      <div class="hints">
        <div><kbd>Drag</kbd> orbit · <kbd>Scroll</kbd> zoom · <kbd>Right-Drag</kbd> pan</div>
        <div><kbd>1-6</kbd> camera · <kbd>C</kbd> color · <kbd>H</kbd> lights · <kbd>Space</kbd> cinematic</div>
      </div>
    `;
    this.el.appendChild(bottom);
    this.rpmEl = bottom.querySelector('#rpmDisplay');
    this.speedEl = bottom.querySelector('#speedDisplay');
  }

  _buildCinematicIndicator() {
    const indicator = document.createElement('div');
    indicator.className = 'cinematic-indicator';
    indicator.id = 'cinematicIndicator';
    indicator.style.cssText = `
      position:fixed; top:50%; left:50%; transform:translate(-50%,-50%);
      font-family:'JetBrains Mono',monospace; font-size:14px; letter-spacing:4px;
      color:var(--accent); text-transform:uppercase; z-index:20;
      opacity:0; transition:opacity 0.5s; pointer-events:none;
      text-shadow:0 0 20px var(--accent);
    `;
    indicator.textContent = 'Cinematic Mode';
    document.body.appendChild(indicator);
    this.cinematicEl = indicator;
  }

  _bindEvents() {
    bus.on('sceneMode:change', (mode) => {
      const text = document.getElementById('modeText');
      if (text) text.textContent = mode.name;
    });
    bus.on('vehicle:swapped', (variant) => {
      const nameEl = document.getElementById('modelName');
      if (nameEl) nameEl.textContent = variant.name;
    });
    bus.on('state:change:cinematicMode', (v) => {
      if (this.cinematicEl) {
        this.cinematicEl.style.opacity = v ? '1' : '0';
      }
    });
  }

  updateRPM(t, rpm, speed) {
    if (this.rpmEl && rpm !== undefined) {
      const v = Math.round(rpm);
      const thousands = Math.floor(v / 1000);
      const remainder = (v % 1000).toString().padStart(3, '0');
      this.rpmEl.innerHTML = `${thousands},<span style="color:var(--accent)">${remainder}</span>`;
    }
    if (this.speedEl && speed !== undefined) {
      const s = Math.round(speed);
      this.speedEl.innerHTML = `${s}<span class="u">km/h</span>`;
    }
  }

  dispose() {
    if (this.el) this.el.innerHTML = '';
    if (this.cinematicEl) this.cinematicEl.remove();
  }
}

export default HUD;
