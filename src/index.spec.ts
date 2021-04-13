import { ALL_EVENTS, Emitter, once } from "./index";

interface Events {
  test: [boolean];
  other: [string];
}

describe("events", () => {
  it("should emit events", () => {
    const events = new Emitter<Events>();
    const spy = jest.fn();

    const off = events.on("test", spy);
    events.emit("test", true);

    off();
    events.emit("test", false);

    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenLastCalledWith(true);
  });

  it("should remove function only once", () => {
    const events = new Emitter<Events>();
    const spy = jest.fn();

    const off1 = events.on("test", spy);
    const off2 = events.on("test", spy);
    events.emit("test", true);
    expect(spy).toHaveBeenCalledTimes(2);

    expect(off1()).toEqual(true);
    expect(off1()).toEqual(false);

    events.emit("test", true);
    expect(spy).toHaveBeenCalledTimes(3);

    off2();

    events.emit("test", false);
    expect(spy).toHaveBeenCalledTimes(3);
  });

  it("should emit `ALL_EVENTS` event", () => {
    const events = new Emitter<Events>();
    const spy = jest.fn();

    events.emit("test", false);
    expect(spy).not.toHaveBeenCalled();

    const off = events.on(ALL_EVENTS, spy);
    events.emit("test", true);
    expect(spy).toHaveBeenCalledTimes(1);

    off();
    events.emit("test", false);
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it("should forward `ALL_EVENTS` events easily", () => {
    const events1 = new Emitter<Events>();
    const events2 = new Emitter<Pick<Events, "test">>();
    const spy = jest.fn();

    events2.on(ALL_EVENTS, ({ type, args }) => {
      events1.emit(type, ...args);
    });

    events1.on("test", spy);
    events2.emit("test", true);

    expect(spy).toHaveBeenLastCalledWith(true);
  });

  it("should filter `ALL_EVENTS` events easily", () => {
    const events1 = new Emitter<Events>();
    const events2 = new Emitter<Pick<Events, "test">>();
    const spy = jest.fn();

    events1.on(ALL_EVENTS, (e) => {
      if (e.type === "test") {
        events2.emit(e.type, ...e.args);
      }
    });

    events2.on("test", spy);
    events1.emit("test", true);
    events1.emit("other", "");

    expect(spy).toHaveBeenLastCalledWith(true);
  });
});

describe("once", () => {
  it("should support a once listener", () => {
    const events = new Emitter<Events>();
    const spy = jest.fn();

    once(events, "test", spy);

    events.emit("test", true);
    events.emit("test", false);

    expect(spy).toHaveBeenCalledTimes(1);
  });

  it("should not break emitter by removing element within listener", () => {
    const events = new Emitter<Events>();
    const onSpy = jest.fn();
    const onceSpy = jest.fn();

    once(events, "test", onceSpy);
    events.on("test", onSpy);

    events.emit("test", true);

    expect(onSpy).toHaveBeenCalledTimes(1);
    expect(onceSpy).toHaveBeenCalledTimes(1);
  });
});
