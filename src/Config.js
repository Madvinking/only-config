/**
 * Config manager based on Joi schema with subscription capabilities.
 */
import Joi from 'joi';
import { Observable } from './Observable';
import _ from 'lodash';
import deepMerge from 'deepmerge';

export class Config {
  #config;
  #schema;
  #observable;
  #observables;

  /**
   * @param {object} schema - Joi schema object.
   * @param {object} [config={}] - Initial config values.
   */
  constructor(schema = null, config = {}) {
    if (schema) this._validateJoi(schema);
    this.#schema = schema;
    this._initializeConfig(config);
  }

  /**
   * Initialize config and observables.
   * @param {object} [config={}]
   * @private
   */
  _initializeConfig(config = {}) {
    this.#config = {};
    this._merge(config);
    this.#observables = {};
    this.#observable = new Observable(this.#config);
  }

  /**
   * Validate that the schema is a Joi schema.
   * @param {object} schema
   * @throws {Error} If schema is not a Joi schema.
   * @private
   */
  _validateJoi(schema) {
    if (schema && !Joi.isSchema(schema)) {
      throw new Error('must pass Joi type schema');
    }
  }

  /**
   * Merge new values into the config, validating with the schema.
   * @param {object} newValue
   * @param {Function|boolean} [onError=false] - Error handler or false.
   * @private
   */
  _merge(newValue, onError = false) {
    const merged = deepMerge.all([this.#config, newValue]);
    const { error, value } = this.#schema.validate(merged, { abortEarly: false });
    if (!error) {
      this.#config = value;
    } else if (onError) {
      if (onError(error)) {
        const { value: fallbackValue } = this.#schema.validate(merged, {
          allowUnknown: true,
          abortEarly: false,
        });
        this.#config = fallbackValue;
      }
    } else {
      throw error;
    }
  }

  /**
   * Set a new schema and optionally a new config.
   * @param {object} newSchema - Joi schema.
   * @param {object} [config=this.#config]
   * @throws {Error} If new config does not validate against new schema.
   */
  setSchema(newSchema, config = this.#config) {
    this._validateJoi(newSchema);
    const { error } = newSchema.validate(config, { abortEarly: false });
    if (error) throw error;
    this.#config = {};
    this.#schema = newSchema;
    this._merge(config);
  }

  /**
   * Subscribe to config changes.
   * @param {object} options
   * @param {Function} options.onChange - Callback for changes.
   * @param {string} [options.key] - Key to subscribe to.
   * @returns {Function|undefined} Unsubscribe function.
   */
  subscribe({ onChange, key = null }) {
    if (!onChange) return;
    if (!key) {
      return this.#observable.subscribe(onChange);
    }
    if (!this.#observables[key]) {
      this.#observables[key] = new Observable(this.get(key));
    }
    return this.#observables[key].subscribe(onChange);
  }

  /**
   * Set a value in the config.
   * @param {object} options
   * @param {boolean} [options.override=false] - Whether to override config.
   * @param {*} [options.value=null] - Value to set.
   * @param {string} [options.key=null] - Key to set.
   * @param {Function|null} [options.onError=null] - Error handler.
   */
  set({ override = false, value = null, key = null, onError = null } = {}) {
    if (value === null) return;
    if (override) this._initializeConfig();
    let setValue = value;
    if (key) setValue = _.set({}, key, value);
    this._merge(setValue, onError);
    if (key && this.#observables[key]) {
      this.#observables[key].set(this.get(key));
    }
    this.#observable.set(this.#config);
  }

  /**
   * Get a value from the config.
   * @param {string} [key] - Key to get.
   * @returns {*} Value at key or the whole config.
   */
  get(key) {
    if (!key) return this.#config;
    return _.get(this.#config, key);
  }
}
