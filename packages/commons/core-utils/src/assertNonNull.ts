export function assertNonNull<T>(val: T, message?: string): asserts val is Exclude<T, null> {
    if (val === null) {
        throw new Error(message ?? "Expected value to be non-null but got null.");
    }
}
