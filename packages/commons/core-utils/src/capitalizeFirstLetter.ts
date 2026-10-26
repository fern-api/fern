/**
 * Uppercases the first character of the string and leaves the rest untouched.
 * Returns an empty string unchanged.
 */
export function capitalizeFirstLetter(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
}
