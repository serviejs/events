/**
 * All events are emitted using this key.
 */
export const ALL_EVENTS = Symbol("ALL_EVENTS");

/**
 * Valid `ALL_EVENTS` listener args.
 */
export type AllEventsArg<T> = {
  [K in keyof T]: { type: K; args: T[K] };
}[keyof T];

/**
 * Internally defined emitter events.
 */
export interface EmitterEvents<T> {
  [ALL_EVENTS]: [AllEventsArg<T>];
}

/**
 * All possible events, user provided and built-in.
 */
export type Events<T> = T & EmitterEvents<T>;

/**
 * List of valid event args given `K`.
 */
export type ValidEventArgs<
  T,
  K extends keyof Events<T>
> = K extends keyof EmitterEvents<T>
  ? EmitterEvents<T>[K]
  : K extends keyof T
  ? ValidArgs<T[K]>
  : never;

/**
 * Valid event listener args from `T`.
 */
export type ValidArgs<T> = T extends unknown[] ? T : never;

/**
 * Event listener type.
 */
export type EventListener<T, K extends keyof Events<T>> = (
  ...args: ValidEventArgs<T, K>
) => void;

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
 * Emit an event.
 */
function emit<T, K extends keyof Events<T>>(
  stack: Set<$Wrap<EventListener<T, K>>>,
  ...args: ValidEventArgs<T, K>
): void {
  if (stack) for (const { fn } of stack) fn(...args);
}

/**
 * Type-safe event emitter.
 */
export class Emitter<T> {
  $: {
    [K in keyof Events<T>]: Set<$Wrap<EventListener<T, K>>>;
  } = Object.create(null);

  on<K extends keyof Events<T>>(type: K, fn: EventListener<T, K>) {
    const stack = (this.$[type] = this.$[type] || new Set());
    return add(stack, { fn });
  }

  emit<K extends keyof T>(type: K, ...args: ValidEventArgs<T, K>) {
    emit(this.$[type], ...args);
    emit(this.$[ALL_EVENTS], { type, args });
  }
}

/**
 * Helper to listen to an event once only.
 */
export function once<T, K extends keyof Events<T>>(
  events: Emitter<T>,
  type: K,
  callback: EventListener<T, K>
) {
  const off = events.on(type, (...args) => {
    off();
    return callback(...args);
  });

  return off;
}
