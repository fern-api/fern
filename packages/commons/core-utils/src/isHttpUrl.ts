/**
 * Returns true if the value starts with `http://` or `https://`.
 *
 * This is a cheap prefix check, not a validation. Use `isURL` from `@fern-api/fs-utils` to check that
 * a value parses as a URL of any scheme.
 */
export function isHttpUrl(value: string): boolean {
    return value.startsWith("http://") || value.startsWith("https://");
}
