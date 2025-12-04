export function addJsonSerializer<T>(obj: T, toJsonFn: () => unknown): T {
    Object.defineProperty(obj, "toJSON", {
        value: toJsonFn,
        enumerable: false,
        writable: true,
        configurable: true
    });
    return obj;
}
