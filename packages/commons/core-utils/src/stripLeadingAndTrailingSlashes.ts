/**
 * Removes every leading and trailing `/` from the string. Slashes inside the string are kept.
 */
export function stripLeadingAndTrailingSlashes(str: string): string {
    return str.replace(/^\/+|\/+$/g, "");
}
