import { LOCATION_PROPERTY } from "./constants";
import type { SourcedObject } from "./Sourced";
import type { SourceLocation } from "./SourceLocation";
import type { SourceNodeWrapper } from "./SourceNodeWrapper";

/**
 * Creates a sourced proxy for an object that adds $loc and recursively wraps properties.
 */
export function createSourcedObject<T extends object>({
    value,
    wrapChild,
    location
}: {
    value: T;
    wrapChild: SourceNodeWrapper;
    location: SourceLocation;
}): SourcedObject<T> {
    const cache = new Map<string | symbol, unknown>();
    return new Proxy(value, {
        get(target, prop, receiver) {
            if (prop === LOCATION_PROPERTY) {
                return location;
            }

            if (cache.has(prop)) {
                return cache.get(prop);
            }

            // Don't wrap undefined for missing properties.
            const rawValue = Reflect.get(target, prop, receiver);
            if (rawValue === undefined && !(prop in target)) {
                return undefined;
            }

            const propKey = typeof prop === "symbol" ? String(prop) : prop;
            const wrapped = wrapChild(rawValue, propKey as string | number);
            cache.set(prop, wrapped);
            return wrapped;
        },

        has(target, prop) {
            if (prop === LOCATION_PROPERTY) {
                return true;
            }
            return Reflect.has(target, prop);
        },

        ownKeys(target) {
            return [...Reflect.ownKeys(target), "$loc"];
        },

        getOwnPropertyDescriptor(target, prop) {
            if (prop === LOCATION_PROPERTY) {
                return { configurable: true, enumerable: false, value: location };
            }
            return Reflect.getOwnPropertyDescriptor(target, prop);
        }
    }) as SourcedObject<T>;
}
