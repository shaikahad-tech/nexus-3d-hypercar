/**
 * ScreenshotManager — captures the current WebGL canvas as a
 * downloadable PNG image. Requires preserveDrawingBuffer: true
 * on the renderer.
 */
import bus from '../core/EventBus.js';

class ScreenshotManager {
  constructor(renderer, canvas) {
    this.renderer = renderer;
    this.canvas = canvas || renderer.domElement;
    this._bindEvents();
  }

  _bindEvents() {
    bus.on('screenshot', () => this.capture());
  }

  capture() {
    try {
      this.renderer.render(this.renderer.userData.scene, this.renderer.userData.camera);

      const dataURL = this.canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `nexus-3d-${Date.now()}.png`;
      link.href = dataURL;
      link.click();

      bus.emit('screenshot:saved');
    } catch (e) {
      console.error('[ScreenshotManager] capture failed:', e);
      try {
        const dataURL = this.canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = `nexus-3d-${Date.now()}.png`;
        link.href = dataURL;
        link.click();
        bus.emit('screenshot:saved');
      } catch (e2) {
        console.error('[ScreenshotManager] fallback failed:', e2);
      }
    }
  }

  dispose() {
    // Nothing to clean up
  }
}

export default ScreenshotManager;
