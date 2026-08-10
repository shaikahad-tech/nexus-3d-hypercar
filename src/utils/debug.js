/**
 * debug.js — optional debug overlay and logging.
 * Toggle via URL param ?debug=1
 * Adds a lightweight FPS counter, draw-call stats, and
 * event history viewer.
 */
export const DEBUG = new URLSearchParams(window.location.search).has('debug');

const logBuffer = [];
const MAX_LOG = 200;

export function log(...args) {
  if (!DEBUG) return;
  const entry = { time: Date.now(), msg: args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ') };
  logBuffer.push(entry);
  if (logBuffer.length > MAX_LOG) logBuffer.shift();
  console.log('[NEXUS]', ...args);
}

export function getLogBuffer() {
  return [...logBuffer];
}

export function attachDebugPanel(renderer, scene, camera) {
  if (!DEBUG) return null;

  const panel = document.createElement('div');
  panel.id = 'debug-panel';
  panel.style.cssText = `
    position:fixed; bottom:80px; right:24px; z-index:50;
    font-family:'JetBrains Mono',monospace; font-size:11px;
    background:rgba(8,9,12,0.85); border:1px solid rgba(255,255,255,0.1);
    border-radius:8px; padding:10px 14px; color:#8b919e;
    pointer-events:none; min-width:180px; line-height:1.6;
  `;
  document.body.appendChild(panel);

  let frames = 0, lastTime = performance.now(), fps = 0;
  let minFps = Infinity, maxFps = 0;

  function update() {
    frames++;
    const now = performance.now();
    if (now >= lastTime + 500) {
      fps = Math.round((frames * 1000) / (now - lastTime));
      minFps = Math.min(minFps, fps);
      maxFps = Math.max(maxFps, fps);
      const info = renderer.info;
      const mem = info.memory;
      const render = info.render;
      panel.innerHTML = `
        <div style="color:#22d39a;font-weight:bold">${fps} FPS</div>
        <div style="color:#8b919e;font-size:9px;letter-spacing:0.5px">min ${minFps} · max ${maxFps}</div>
        <hr style="border:0;border-top:1px solid rgba(255,255,255,0.1);margin:4px 0">
        <div>draws: <span style="color:#e8eaed">${render.calls}</span></div>
        <div>tris:  <span style="color:#e8eaed">${render.triangles.toLocaleString()}</span></div>
        <div>lines: <span style="color:#e8eaed">${render.lines.toLocaleString()}</span></div>
        <div>geom:  <span style="color:#e8eaed">${mem.geometries}</span></div>
        <div>tex:   <span style="color:#e8eaed">${mem.textures}</span></div>
        <div>prog:  <span style="color:#e8eaed">${render.programs?.length || 0}</span></div>
      `;
      frames = 0;
      lastTime = now;
    }
    requestAnimationFrame(update);
  }
  update();
  return panel;
}

export default { DEBUG, log, getLogBuffer, attachDebugPanel };
