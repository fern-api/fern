/**
 * Prepends a `/` to the string unless it already starts with one.
 */
export function addLeadingSlash(str: string): string {
    return str.startsWith("/") ? str : `/${str}`;
}
