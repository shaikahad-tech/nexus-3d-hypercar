/**
 * PerformanceMeter — optional overlay showing real-time render stats.
 * Disabled by default; enabled via ?debug=1 URL parameter.
 */
import { DEBUG } from '../utils/debug.js';

class PerformanceMeter {
  constructor(renderer) {
    this.renderer = renderer;
    this.panel = null;
    this.frames = 0;
    this.lastTime = performance.now();
    this.minFps = Infinity;
    this.maxFps = 0;

    if (DEBUG) this._build();
  }

  _build() {
    this.panel = document.createElement('div');
    this.panel.id = 'perf-meter';
    this.panel.style.cssText = `
      position:fixed; bottom:100px; right:24px; z-index:50;
      font-family:'JetBrains Mono',monospace; font-size:11px;
      background:rgba(8,9,12,0.85); border:1px solid rgba(255,255,255,0.1);
      border-radius:8px; padding:10px 14px; color:#8b919e;
      pointer-events:none; min-width:180px; line-height:1.6;
    `;
    document.body.appendChild(this.panel);
  }

  update() {
    if (!this.panel) return;
    this.frames++;
    const now = performance.now();
    if (now < this.lastTime + 500) return;

    const fps = Math.round((this.frames * 1000) / (now - this.lastTime));
    this.minFps = Math.min(this.minFps, fps);
    this.maxFps = Math.max(this.maxFps, fps);
    const info = this.renderer.info;
    this.panel.innerHTML = `
      <div style="color:#22d39a;font-weight:bold">${fps} FPS</div>
      <div style="color:#8b919e;font-size:9px">min ${this.minFps} · max ${this.maxFps}</div>
      <hr style="border:0;border-top:1px solid rgba(255,255,255,0.1);margin:4px 0">
      <div>draws: <span style="color:#e8eaed">${info.render.calls}</span></div>
      <div>tris:  <span style="color:#e8eaed">${info.render.triangles.toLocaleString()}</span></div>
      <div>geom:  <span style="color:#e8eaed">${info.memory.geometries}</span></div>
      <div>tex:   <span style="color:#e8eaed">${info.memory.textures}</span></div>
      <div>prog:  <span style="color:#e8eaed">${info.render.programs?.length || 0}</span></div>
    `;
    this.frames = 0;
    this.lastTime = now;
  }

  dispose() {
    if (this.panel?.parentNode) this.panel.parentNode.removeChild(this.panel);
  }
}

export default PerformanceMeter;
