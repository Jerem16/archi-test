// src/entities/models/userName/bus.ts
type Unsub = () => void;

const BUS_EVENT = "username-updated";

export function emitUserNameUpdated() {
    window.dispatchEvent(new Event(BUS_EVENT));
}

export function onUserNameUpdated(cb: () => void): Unsub {
    const handler = () => cb();
    window.addEventListener(BUS_EVENT, handler);
    return () => window.removeEventListener(BUS_EVENT, handler);
}
