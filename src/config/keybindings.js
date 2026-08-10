/**
 * keybindings.js — keyboard shortcut definitions.
 * Inspired by 3D-Car-Viewing's keyboard shortcut system.
 */
export const KEY_BINDINGS = {
  // Camera presets
  '1': { action: 'camera:preset', value: 'hero' },
  '2': { action: 'camera:preset', value: 'front' },
  '3': { action: 'camera:preset', value: 'side' },
  '4': { action: 'camera:preset', value: 'rear' },
  '5': { action: 'camera:preset', value: 'top' },
  '6': { action: 'camera:preset', value: 'low' },

  // Color cycling
  'c': { action: 'paint:next', value: null },
  'C': { action: 'paint:prev', value: null },

  // Toggle systems
  'h': { action: 'toggle:lights', value: null },
  'g': { action: 'toggle:underglow', value: null },
  'r': { action: 'toggle:rotate', value: null },
  'f': { action: 'toggle:floor', value: null },

  // Scene modes
  'q': { action: 'scene:prev', value: null },
  'w': { action: 'scene:next', value: null },

  // Vehicle cycling
  'v': { action: 'vehicle:next', value: null },
  'V': { action: 'vehicle:prev', value: null },

  // Special
  ' ': { action: 'toggle:cinematic', value: null },
  's': { action: 'screenshot', value: null },
  'Escape': { action: 'close:overlays', value: null },
};

export default KEY_BINDINGS;
