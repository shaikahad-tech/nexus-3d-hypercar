/**
 * HUD — static heads-up display overlay.
 * Renders the top bar (brand + live indicators), left panel (tech specs),
 * and bottom bar (performance strip + hints). Pure DOM, no framework.
 *
 * Reads spec data from carSpecs config and builds the DOM once on init.
 */
import { CAR_SPECS as S } from '../config/carSpecs.js';
import { log } from '../utils/debug.js';

class HUD {
  constructor() {
    this.el = null;
    this.rpmEl = null;
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
  }

  // ---- Top bar ----
  _buildTopBar() {
    const top = document.createElement('div');
    top.className = 'hud-topbar';
    top.innerHTML = `
      <div class="brand">
        <div class="brand-mark">N3</div>
        <div class="brand-text">
          <span class="name">NEXUS · 3D</span>
          <span class="model">${S.identity.name}</span>
        </div>
      </div>
      <div class="top-meta">
        <span class="meta-chip"><span class="dot-live"></span>Live Render</span>
        <span class="meta-chip">${S.identity.year} Concept</span>
        <span class="meta-chip">v${S.identity.version}</span>
      </div>
    `;
    this.el.appendChild(top);
  }

  // ---- Left panel — technical specs ----
  _buildLeftPanel() {
    const panel = document.createElement('div');
    panel.className = 'hud-left-panel';

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
      ${specRow('Powertrain', pt.type, '', true)}
      ${specRow('Peak Power', p.power.value.toLocaleString(), p.power.unit)}
      ${specRow('Torque', p.torque.value.toLocaleString(), p.torque.unit)}
      ${specRow('0–100 km/h', p.accel.value, p.accel.unit, true)}
      ${specRow('Top Speed', p.topSpeed.value, p.topSpeed.unit)}
      ${specRow('Battery', pt.battery.value, pt.battery.unit)}
      ${specRow('Range (WLTP)', pt.range.value, pt.range.unit)}
      ${specRow('Drag Coefficient', a.drag.value, a.drag.unit)}
      ${specRow('Chassis', a.chassis, '')}
      ${specRow('Downforce', a.downforce.value, a.downforce.unit)}
    `;
    this.el.appendChild(panel);
  }

  // ---- Bottom bar — performance + hints ----
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
        <div><kbd>Drag</kbd> orbit &nbsp; <kbd>Scroll</kbd> zoom &nbsp; <kbd>Right-Drag</kbd> pan</div>
        <div>Click swatches to repaint · toggle live systems</div>
      </div>
    `;
    this.el.appendChild(bottom);
    this.rpmEl = bottom.querySelector('#rpmDisplay');
  }

  /** Called each frame — updates the live RPM readout */
  updateRPM(t) {
    if (!this.rpmEl) return;
    const base = S.performance.rpm.base;
    const variance = S.performance.rpm.variance;
    const v = base + Math.floor(Math.sin(t) * variance);
    const thousands = Math.floor(v / 1000);
    const remainder = (v % 1000).toString().padStart(3, '0');
    this.rpmEl.innerHTML = `${thousands},<span style="color:var(--accent)">${remainder}</span>`;
  }

  dispose() {
    if (this.el) this.el.innerHTML = '';
  }
}

export default HUD;
