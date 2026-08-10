/**
 * PerformanceMeter — optional overlay showing real-time render stats.
 * Disabled by default; enabled via ?debug=1 URL parameter.
 * Draws call count, triangle count, and memory usage from renderer.info.
 */
import { DEBUG } from '../utils/debug.js';

class PerformanceMeter {
  constructor(renderer) {
    this.renderer = renderer;
    this.panel = null;
    this.frames = 0;
    this.lastTime = performance.now();

    if (DEBUG) this._build();
  }

  _build() {
    this.panel = document.createElement('div');
    this.panel.id = 'perf-meter';
    this.panel.style.cssText = `
      position:fixed; bottom:80px; right:24px; z-index:50;
      font-family:'JetBrains Mono',monospace; font-size:11px;
      background:rgba(8,9,12,0.85); border:1px solid rgba(255,255,255,0.1);
      border-radius:8px; padding:10px 14px; color:#8b919e;
      pointer-events:none; min-width:160px;
    `;
    document.body.appendChild(this.panel);
  }

  update() {
    if (!this.panel) return;
    this.frames++;
    const now = performance.now();
    if (now < this.lastTime + 500) return;

    const fps = Math.round((this.frames * 1000) / (now - this.lastTime));
    const info = this.renderer.info;
    this.panel.innerHTML = `
      <div style="color:#22d39a">${fps} FPS</div>
      <div>draws: ${info.render.calls}</div>
      <div>tris:  ${info.render.triangles.toLocaleString()}</div>
      <div>geom:  ${info.memory.geometries}</div>
      <div>tex:   ${info.memory.textures}</div>
    `;
    this.frames = 0;
    this.lastTime = now;
  }

  dispose() {
    if (this.panel && this.panel.parentNode) {
      this.panel.parentNode.removeChild(this.panel);
    }
  }
}

export default PerformanceMeter;
