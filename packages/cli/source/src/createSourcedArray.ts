import { LOCATION_PROPERTY } from "./constants";
import type { SourcedArray } from "./Sourced";
import type { SourceLocation } from "./SourceLocation";
import type { SourceNodeWrapper } from "./SourceNodeWrapper";

/**
 * Creates a sourced proxy for an array that adds $loc and recursively wraps elements.
 */
export function createSourcedArray<T>({
    value,
    wrapChild,
    location
}: {
    value: T[];
    wrapChild: SourceNodeWrapper;
    location: SourceLocation;
}): SourcedArray<T> {
    const cache = new Map<number, unknown>();
    return new Proxy(value, {
        get(target, prop, receiver) {
            if (prop === LOCATION_PROPERTY) {
                return location;
            }

            // Handle array index access.
            const index = typeof prop === "string" ? parseInt(prop, 10) : undefined;
            if (index !== undefined && !isNaN(index) && index >= 0 && index < target.length) {
                if (cache.has(index)) {
                    return cache.get(index);
                }

                const rawValue = target[index];
                const wrapped = wrapChild(rawValue, index);
                cache.set(index, wrapped);
                return wrapped;
            }

            // Forward other property access (length, methods, etc).
            return Reflect.get(target, prop, receiver);
        },

        has(target, prop) {
            if (prop === LOCATION_PROPERTY) {
                return true;
            }
            return Reflect.has(target, prop);
        }
    }) as unknown as SourcedArray<T>;
}
