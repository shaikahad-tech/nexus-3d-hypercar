/**
 * EventBus — lightweight pub/sub system for decoupled communication
 * between subsystems (UI, Car, Effects, Camera) without direct imports.
 *
 * @example
 *   bus.emit('paint:change', { color: 0xff0000 });
 *   bus.on('paint:change', (payload) => { ... });
 */
class EventBus {
  constructor() {
    this._handlers = new Map();
  }

  on(event, handler) {
    if (!this._handlers.has(event)) {
      this._handlers.set(event, new Set());
    }
    this._handlers.get(event).add(handler);
    return () => this.off(event, handler); // unsubscribe function
  }

  once(event, handler) {
    const unsub = this.on(event, (payload) => {
      unsub();
      handler(payload);
    });
    return unsub;
  }

  off(event, handler) {
    const set = this._handlers.get(event);
    if (set) set.delete(handler);
  }

  emit(event, payload) {
    const set = this._handlers.get(event);
    if (!set) return;
    for (const handler of set) {
      try {
        handler(payload);
      } catch (err) {
        console.error(`[EventBus] handler error for "${event}":`, err);
      }
    }
  }

  clear() {
    this._handlers.clear();
  }
}

export const bus = new EventBus();
export default bus;
