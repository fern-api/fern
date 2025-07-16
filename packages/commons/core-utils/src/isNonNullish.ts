export function isNonNullish<T>(x: T | null | undefined): x is T {
    return x != null;
}
