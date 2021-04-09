# Events

[![NPM version][npm-image]][npm-url]
[![NPM downloads][downloads-image]][downloads-url]
[![Build status][build-image]][build-url]
[![Build coverage][coverage-image]][coverage-url]
[![Bundle size][bundlephobia-image]][bundlephobia-url]

> Tiny type-safe event emitter.

## Installation

```
npm install @servie/events --save
```

## Usage

```ts
import { Emitter, once } from "@servie/events";

// Define an events interface using keys & argument tuples.
interface Events {
  test: [boolean];
  other: [string];
}

// Initialize an `Emitter` using your `Events` interface.
const events = new Emitter<Events>();

// Add or remove listeners.
const listener = (...args) => console.log(args);
const off = events.on("test", listener);

// Emit an event.
events.emit("test", true);

// Listen to _all_ events, i.e. for debugging.
const eachListener = ({ type, args }) => console.log(type, args);
const off = events.each(eachListener);

// "Once" utility.
const runOnce = (...args) => console.log(args);
once(events, "test", runOnce);

// Remove the listener.
off();
```

## TypeScript

This project is written using [TypeScript](https://github.com/Microsoft/TypeScript) and publishes the definitions directly to NPM.

## License

MIT

[npm-image]: https://img.shields.io/npm/v/@servie/events
[npm-url]: https://npmjs.org/package/@servie/events
[downloads-image]: https://img.shields.io/npm/dm/@servie/events
[downloads-url]: https://npmjs.org/package/@servie/events
[build-image]: https://img.shields.io/github/workflow/status/serviejs/events/CI/main
[build-url]: https://github.com/serviejs/events/actions/workflows/ci.yml?query=branch%3Amain
[coverage-image]: https://img.shields.io/codecov/c/gh/serviejs/events
[coverage-url]: https://codecov.io/gh/serviejs/events
[bundlephobia-image]: https://img.shields.io/bundlephobia/minzip/@servie/events.svg
[bundlephobia-url]: https://bundlephobia.com/result?p=@servie/events
