/**
 * Removes a single trailing `/` from the string, if there is one.
 * Unlike `stripTrailingSlashes`, it does not remove repeated slashes: `"a//"` becomes `"a/"`.
 */
export function removeTrailingSlash(str: string): string {
    return str.endsWith("/") ? str.slice(0, -1) : str;
}
