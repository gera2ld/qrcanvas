export default class EventEmitter {
  constructor() {
    this.events = {};
  }

  on(type, listener) {
    let listeners = this.events[type];
    if (!listeners) {
      listeners = [];
      this.events[type] = listeners;
    }
    listeners.push(listener);
    return () => this.off(type, listener);
  }

  off(type, listener) {
    const listeners = this.events[type];
    if (listeners) {
      const i = listeners.indexOf(listener);
      if (i >= 0) listeners.splice(i, 1);
    }
  }

  emit(type, data) {
    const listeners = this.events[type];
    const evt = {
      data,
      defaultPrevented: false,
      preventDefault() {
        evt.defaultPrevented = true;
      },
    };
    if (listeners) {
      listeners.forEach(listener => {
        listener(evt);
      });
    }
    return evt;
  }
}
