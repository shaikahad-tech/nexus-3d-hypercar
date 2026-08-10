/**
 * EventBus — lightweight pub/sub system for decoupled communication.
 * Supports on/once/off/emit with error isolation per handler.
 * Each handler is wrapped in try/catch so one failing listener
 * cannot break the notification chain for others.
 *
 * @example
 *   bus.emit('paint:change', { hex: 0xff0000 });
 *   const unsub = bus.on('paint:change', (payload) => { ... });
 *   unsub(); // later: remove handler
 */
class EventBus {
  constructor() {
    this._handlers = new Map();
    this._history = [];
    this._maxHistory = 100;
  }

  on(event, handler) {
    if (!this._handlers.has(event)) {
      this._handlers.set(event, new Set());
    }
    this._handlers.get(event).add(handler);
    return () => this.off(event, handler);
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
    // Record in history for debugging / late subscriptions
    this._history.push({ event, payload, time: Date.now() });
    if (this._history.length > this._maxHistory) {
      this._history.shift();
    }

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

  /** Get recent events for debugging */
  getHistory(event) {
    if (!event) return [...this._history];
    return this._history.filter(h => h.event === event);
  }

  /** Remove all handlers for a specific event, or everything */
  clear(event) {
    if (event) {
      this._handlers.delete(event);
    } else {
      this._handlers.clear();
    }
  }

  /** Count active subscribers for an event */
  listenerCount(event) {
    const set = this._handlers.get(event);
    return set ? set.size : 0;
  }
}

export const bus = new EventBus();
export default bus;
