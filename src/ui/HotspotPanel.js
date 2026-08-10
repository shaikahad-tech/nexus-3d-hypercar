/**
 * HotspotPanel — info panel that appears when clicking a hotspot.
 * Shows the hotspot title, specification list, and description text.
 */
import bus from '../core/EventBus.js';

class HotspotPanel {
  constructor() {
    this.el = null;
    this._build();
    this._bindEvents();
  }

  _build() {
    this.el = document.createElement('div');
    this.el.className = 'hotspot-panel';
    this.el.id = 'hotspotPanel';
    this.el.style.cssText = `
      position:fixed; bottom:100px; left:50%; transform:translateX(-50%) translateY(20px);
      width:min(500px, 90vw); z-index:30;
      background:rgba(14,17,23,0.92); backdrop-filter:blur(20px);
      border:1px solid rgba(255,255,255,0.1); border-radius:16px;
      padding:24px 28px; box-shadow:0 20px 60px rgba(0,0,0,0.6);
      opacity:0; pointer-events:none; transition:all 0.4s cubic-bezier(0.16,1,0.3,1);
    `;
    document.body.appendChild(this.el);
  }

  _bindEvents() {
    bus.on('hotspot:show', (hotspot) => this.show(hotspot));
    bus.on('hotspot:hide', () => this.hide());
    bus.on('close:overlays', () => this.hide());
  }

  show(hotspot) {
    if (!hotspot || !hotspot.info) return;
    const info = hotspot.info;
    const specsHTML = info.specs.map(s => `
      <div class="hotspot-spec-row">
        <span class="hotspot-spec-label">${s.label}</span>
        <span class="hotspot-spec-value">${s.value}</span>
      </div>
    `).join('');

    this.el.innerHTML = `
      <div class="hotspot-header">
        <h3 class="hotspot-title">${info.title}</h3>
        <button class="hotspot-close" id="hotspotClose">×</button>
      </div>
      <div class="hotspot-specs">${specsHTML}</div>
      <p class="hotspot-desc">${info.description}</p>
    `;
    this.el.style.opacity = '1';
    this.el.style.pointerEvents = 'auto';
    this.el.style.transform = 'translateX(-50%) translateY(0)';

    document.getElementById('hotspotClose')?.addEventListener('click', () => this.hide());
  }

  hide() {
    this.el.style.opacity = '0';
    this.el.style.pointerEvents = 'none';
    this.el.style.transform = 'translateX(-50%) translateY(20px)';
  }

  dispose() {
    this.el?.remove();
  }
}

export default HotspotPanel;
