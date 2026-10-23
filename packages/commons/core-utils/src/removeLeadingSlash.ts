/**
 * Removes a single leading `/` from the string, if there is one.
 * Unlike `stripLeadingSlash`, it does not remove repeated slashes: `"//a"` becomes `"/a"`.
 */
export function removeLeadingSlash(str: string): string {
    return str.startsWith("/") ? str.slice(1) : str;
}
