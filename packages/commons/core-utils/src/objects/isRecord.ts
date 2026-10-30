/**
 * Returns true for any non-null object that is not an array, including class instances.
 *
 * This is deliberately looser than `isPlainObject`, which follows lodash and rejects values
 * with a custom prototype.
 */
export function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value != null && !Array.isArray(value);
}
