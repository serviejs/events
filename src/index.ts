/**
 * Valid event listener args.
 */
export type ValidArgs<T> = T extends any[] ? T : never;

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
export type _Wrapper<T> = { fn: T };

/**
 * Create an `off` function given an input.
 */
function add<T>(stack: Array<T>, value: T): () => void {
  stack.push(value);
  return () => void stack.splice(stack.indexOf(value) >>> 0, 1);
}

/**
 * Type-safe event emitter.
 */
export class Emitter<T> {
  _: Array<_Wrapper<EachEventListener<T>>> = [];
  $: { [K in keyof T]: Array<_Wrapper<EventListener<T, K>>> } = Object.create(
    null
  );

  on<K extends keyof T>(type: K, fn: EventListener<T, K>) {
    const stack = (this.$[type] = this.$[type]! || []);
    return add(stack, { fn });
  }

  each(fn: EachEventListener<T>) {
    return add(this._, { fn });
  }

  emit<K extends keyof T>(type: K, ...args: ValidArgs<T[K]>) {
    const stack = this.$[type];
    if (stack) for (const { fn } of stack.slice()) fn(...args);
    for (const { fn } of this._.slice()) fn({ type, args });
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
