/**
 * Configurator — right-side panel with paint swatches and toggle switches.
 * Mutates state via the StateManager; the EventBus propagates changes
 * to the MaterialLibrary, CarLights, UnderglowFX, and StudioFloor.
 */
import { PAINT_COLORS } from '../config/carSpecs.js';
import state from '../core/StateManager.js';
import bus from '../core/EventBus.js';
import matLib from '../materials/MaterialLibrary.js';
import { log } from '../utils/debug.js';

class Configurator {
  constructor() {
    this.el = null;
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

    // Color swatches
    const swatchHTML = PAINT_COLORS.map((c, i) => {
      const hex = '#' + c.hex.toString(16).padStart(6, '0');
      return `<div class="swatch${i === 0 ? ' active' : ''}"
        data-index="${i}"
        style="background:${hex}; color:${hex};"
        title="${c.name}"></div>`;
    }).join('');

    const toggles = [
      { key: 'lightsOn',     label: 'Headlights' },
      { key: 'underglowOn', label: 'Underglow' },
      { key: 'autoRotate',  label: 'Auto-Rotate' },
      { key: 'floorVisible',label: 'Studio Floor' },
    ];

    const toggleHTML = toggles.map(t => `
      <div class="toggle-row">
        <span class="toggle-label">${t.label}</span>
        <div class="toggle${state.get(t.key) ? ' on' : ''}" data-toggle="${t.key}"></div>
      </div>
    `).join('');

    panel.innerHTML = `
      <div class="panel-label">Configurator</div>
      <div class="color-grid" id="colorGrid">${swatchHTML}</div>
      ${toggleHTML}
    `;
    this.el.appendChild(panel);
  }

  _bindEvents() {
    // Swatch clicks
    const grid = document.getElementById('colorGrid');
    if (grid) {
      grid.addEventListener('click', (e) => {
        const sw = e.target.closest('.swatch');
        if (!sw) return;
        const index = parseInt(sw.dataset.index, 10);
        document.querySelectorAll('.swatch').forEach((s) => s.classList.remove('active'));
        sw.classList.add('active');
        state.set('activeColorIndex', index);
        matLib.setPaintIndex(index);
      });
    }

    // Toggle clicks
    document.querySelectorAll('.toggle').forEach((t) => {
      t.addEventListener('click', () => {
        const key = t.dataset.toggle;
        const newVal = !state.get(key);
        state.set(key, newVal);
        t.classList.toggle('on', newVal);
        log(`[Configurator] ${key} → ${newVal}`);
      });
    });
  }

  dispose() {
    // Panel is part of #hud, cleared by HUD.dispose()
  }
}

export default Configurator;
