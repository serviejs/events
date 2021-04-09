/**
 * Valid event listener args.
 */
export type ValidArgs<T> = T extends unknown[] ? T : never;

/**
 * Event listener type.
 */
export type EventListener<T, K extends keyof T> = (
  ...args: ValidArgs<T[K]>
) => void;

/**
 * Valid `each` listener args.
 */
export type EachValidArgs<T> = {
  [K in keyof T]: { type: K; args: ValidArgs<T[K]> };
}[keyof T];

/**
 * Wildcard event listener type.
 */
export type EachEventListener<T> = (arg: EachValidArgs<T>) => void;

/**
 * Wrap `fn` for uniqueness, avoids removing different `fn` in stack.
 */
export type $Wrap<T> = { fn: T };

/**
 * Create an `off` function given an input.
 */
function add<T>(stack: Set<T>, value: T): () => boolean {
  stack.add(value);
  return () => stack.delete(value);
}

/**
 * Type-safe event emitter.
 */
export class Emitter<T> {
  _: Set<$Wrap<EachEventListener<T>>> = new Set();
  $: { [K in keyof T]: Set<$Wrap<EventListener<T, K>>> } = Object.create(null);

  on<K extends keyof T>(type: K, fn: EventListener<T, K>) {
    const stack = (this.$[type] = this.$[type] || new Set());
    return add(stack, { fn });
  }

  each(fn: EachEventListener<T>) {
    return add(this._, { fn });
  }

  emit<K extends keyof T>(type: K, ...args: ValidArgs<T[K]>) {
    const stack = this.$[type];
    if (stack) for (const { fn } of stack) fn(...args);
    for (const { fn } of this._) fn({ type, args });
  }
}

/**
 * Helper to listen to an event once only.
 */
export function once<T, K extends keyof T>(
  events: Emitter<T>,
  type: K,
  callback: EventListener<T, K>
) {
  const off = events.on(type, (...args: ValidArgs<T[K]>) => {
    off();
    return callback(...args);
  });

  return off;
}
