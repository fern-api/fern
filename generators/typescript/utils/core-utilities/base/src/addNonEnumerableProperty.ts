export function addNonEnumerableProperty<T, K extends string, V>(object: T, key: K, value: V): T & Record<K, V> {
    const copy = { ...object };
    Object.defineProperty(copy, key, {
        enumerable: false,
        writable: true
    });
    (copy as any)[key] = value;
    return copy as T & Record<K, V>;
}
