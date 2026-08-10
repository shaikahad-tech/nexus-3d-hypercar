/**
 * KeyboardController — handles keyboard shortcuts.
 * Binds key presses to EventBus actions via the KEY_BINDINGS config.
 */
import bus from '../core/EventBus.js';
import state from '../core/StateManager.js';
import { KEY_BINDINGS } from '../config/keybindings.js';
import matLib from '../materials/MaterialLibrary.js';
import { PAINT_COLORS } from '../config/paintColors.js';
import { VEHICLE_VARIANTS } from '../config/carSpecs.js';

class KeyboardController {
  constructor() {
    this._enabled = true;
    this._bound = false;
  }

  attach() {
    if (this._bound) return;
    window.addEventListener('keydown', this._onKey);
    this._bound = true;
  }

  detach() {
    if (!this._bound) return;
    window.removeEventListener('keydown', this._onKey);
    this._bound = false;
  }

  _onKey = (e) => {
    if (!this._enabled) return;
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

    const binding = KEY_BINDINGS[e.key];
    if (!binding) return;

    e.preventDefault();
    this._executeAction(binding);
  };

  _executeAction(binding) {
    const { action, value } = binding;

    switch (action) {
      case 'camera:preset':
        bus.emit('camera:preset', value);
        break;

      case 'paint:next':
        matLib.cyclePaint();
        break;

      case 'paint:prev': {
        const idx = matLib.getPaintIndex();
        const next = (idx - 1 + PAINT_COLORS.length) % PAINT_COLORS.length;
        matLib.setPaintIndex(next);
        break;
      }

      case 'toggle:lights':
        state.toggle('lightsOn');
        bus.emit('audio:click');
        break;

      case 'toggle:underglow':
        state.toggle('underglowOn');
        bus.emit('audio:click');
        break;

      case 'toggle:rotate':
        state.toggle('autoRotate');
        bus.emit('audio:click');
        break;

      case 'toggle:floor':
        state.toggle('floorVisible');
        bus.emit('audio:click');
        break;

      case 'scene:next':
        bus.emit('scene:next');
        bus.emit('audio:click');
        break;

      case 'scene:prev':
        bus.emit('scene:prev');
        bus.emit('audio:click');
        break;

      case 'vehicle:next': {
        const idx = state.get('activeVehicleIndex');
        const next = (idx + 1) % VEHICLE_VARIANTS.length;
        state.set('activeVehicleIndex', next);
        bus.emit('vehicle:change', next);
        bus.emit('audio:click');
        break;
      }

      case 'vehicle:prev': {
        const idx = state.get('activeVehicleIndex');
        const next = (idx - 1 + VEHICLE_VARIANTS.length) % VEHICLE_VARIANTS.length;
        state.set('activeVehicleIndex', next);
        bus.emit('vehicle:change', next);
        bus.emit('audio:click');
        break;
      }

      case 'toggle:cinematic':
        if (state.get('cinematicMode')) {
          bus.emit('cinematic:stop');
        } else {
          bus.emit('cinematic:start');
        }
        bus.emit('audio:click');
        break;

      case 'screenshot':
        bus.emit('screenshot');
        bus.emit('audio:click');
        break;

      case 'close:overlays':
        bus.emit('close:overlays');
        break;
    }
  }

  setEnabled(v) {
    this._enabled = v;
  }

  dispose() {
    this.detach();
  }
}

export default KeyboardController;
