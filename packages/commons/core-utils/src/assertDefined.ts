export function assertDefined<T>(val: T, message?: string): asserts val is Exclude<T, undefined> {
    if (val === undefined) {
        throw new Error(message ?? "Expected value to be defined but got undefined.");
    }
}
