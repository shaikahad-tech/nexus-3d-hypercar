/**
 * debug.js — optional debug overlay. Toggle via URL param ?debug=1
 * Adds a lightweight FPS counter and draw-call stats panel.
 */
export const DEBUG = new URLSearchParams(window.location.search).has('debug');

export function log(...args) {
  if (DEBUG) console.log('[NEXUS]', ...args);
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
    pointer-events:none; min-width:160px;
  `;
  document.body.appendChild(panel);

  let frames = 0, lastTime = performance.now(), fps = 0;

  function update() {
    frames++;
    const now = performance.now();
    if (now >= lastTime + 500) {
      fps = Math.round((frames * 1000) / (now - lastTime));
      const info = renderer.info;
      panel.innerHTML = `
        <div style="color:#22d39a">${fps} FPS</div>
        <div>draws: ${info.render.calls}</div>
        <div>tris:  ${info.render.triangles.toLocaleString()}</div>
        <div>geom:  ${info.memory.geometries}</div>
        <div>tex:   ${info.memory.textures}</div>
      `;
      frames = 0;
      lastTime = now;
    }
    requestAnimationFrame(update);
  }
  update();
  return panel;
}

export default { DEBUG, log, attachDebugPanel };
