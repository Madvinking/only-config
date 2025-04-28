// Type definitions for only-config

export type Listener<T = any> = (value: T) => void;
export type Unsubscriber = () => void;

/**
 * Observable class for managing value changes and subscriptions.
 */
export declare class Observable<T = any> {
  constructor(value: T);
  set(val: T): void;
  get(): T;
  subscribe(listener: Listener<T>): Unsubscriber;
}

export interface SubscribeOptions {
  onChange: VoidFunction;
  key?: string;
}

export interface SetOptions {
  value: any;
  key?: string;
  onError?: VoidFunction;
  override?: boolean;
}

/**
 * Config manager based on Joi schema with subscription capabilities.
 */
export declare class Config {
  constructor(schema: any, config?: any);
  subscribe(subscribeOptions: SubscribeOptions): Unsubscriber | undefined;
  setSchema(schema: any, config?: any): void;
  set(setOptions: SetOptions): void;
  get(key?: string): any;
}
