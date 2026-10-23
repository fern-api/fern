/**
 * Returns a shallow copy of the object without the properties whose value is `undefined`.
 * Properties set to `null` are kept.
 */
export function removeUndefinedProperties<T extends object>(value: T): T {
    return Object.fromEntries(Object.entries(value).filter(([, entry]) => entry !== undefined)) as T;
}
