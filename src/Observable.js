/**
 * Observable class for managing value changes and subscriptions.
 */
export class Observable {
  #val;
  #listeners = [];

  /**
   * @param {*} value - Initial value.
   */
  constructor(value) {
    this.#val = value;
  }

  /**
   * Set a new value and notify listeners if changed.
   * @param {*} val - New value.
   */
  set(val) {
    if (this.#val !== val) {
      this.#val = val;
      for (const listener of this.#listeners) {
        listener(val);
      }
    }
  }

  /**
   * Get the current value.
   * @returns {*}
   */
  get() {
    return this.#val;
  }

  /**
   * Subscribe to value changes.
   * @param {Function} listener - Callback to invoke on value change.
   * @returns {Function} Unsubscribe function.
   */
  subscribe(listener) {
    this.#listeners.push(listener);
    return () => {
      this.#listeners = this.#listeners.filter(l => l !== listener);
    };
  }
}
