import { is } from "./type-guards";

/**
 * Capitalizes the first character of a string.
 *
 * @param str - The input string to transform
 * @returns A new string with the first character uppercased and the rest unchanged
 *
 * @example
 * ```ts
 * upperFirst("hello") // returns "Hello"
 * upperFirst("WORLD") // returns "WORLD"
 * upperFirst("") // returns ""
 * ```
 */
export function upperFirst(str: string): string {
    return `${str.charAt(0).toUpperCase()}${str.slice(1)}`;
}

/**
 * Converts a string to camelCase format.
 *
 * This function handles various input formats including:
 * - Snake_case
 * - kebab-case
 * - PascalCase
 * - camelCase
 * - Space separated words
 * - Mixed formats with acronyms
 *
 * @param str - The input string to transform
 * @returns A camelCase version of the input string, with the first word lowercased
 *          and subsequent words capitalized. Returns an empty string if the input
 *          contains no valid words.
 *
 * @example
 * ```ts
 * camelCase("hello world") // returns "helloWorld"
 * camelCase("snake_case_string") // returns "snakeCaseString"
 * camelCase("kebab-case-string") // returns "kebabCaseString"
 * camelCase("PascalCaseString") // returns "pascalCaseString"
 * camelCase("XMLParser") // returns "xmlParser"
 * camelCase("") // returns ""
 * ```
 */
export function camelCase(str: string): string {
    // Remove leading and trailing whitespace
    str = str.trim();

    // Split on whitespace, hyphens, underscores, and transitions from lowercase to uppercase
    const words = str
        .replace(/([a-z])([A-Z])/g, "$1 $2") // Add space between camelCase
        .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2") // Handle acronyms like "XMLParser" -> "XML Parser"
        .split(/[\s_-]+/) // Split on whitespace, underscores, and hyphens
        .filter((word) => word.length > 0);

    if (words.length === 0) {
        return "";
    }

    // First word is lowercase, rest are capitalized
    return words
        .map((word, index) => {
            word = word.toLowerCase();
            if (index === 0) {
                return word;
            }
            return `${word.charAt(0).toUpperCase()}${word.slice(1)}`;
        })
        .join("");
}

/**
 * Hashes a string to a number.
 * @param input - The input string to hash
 * @returns A number generated from the input string
 *
 * @example
 * ```ts
 * hash("hello") // returns 1000000
 * hash("WORLD") // returns 1000000
 * hash("") // returns 0
 * ```
 */
export function hash(input: string): number {
    let hash = 0;
    for (const char of input) {
        hash = (hash << 5) - hash + char.charCodeAt(0);
    }
    return hash;
}

/**
 * Generates a deterministic unique id from a string.
 * @param input - The input string to generate a unique id for
 * @returns A unique id generated from the input string
 *
 * @example
 * ```ts
 * uniqueId("hello") // returns "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx"
 * uniqueId("WORLD") // returns "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx"
 * uniqueId("") // returns "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx"
 * ```
 */
export function uniqueId(input: string): string {
    // create a unique guid without using thecrypto library.
    // Seeded pseudo-random number generator
    function iterate(seed: number): number {
        const x = Math.sin(seed++) * 10000;
        return x - Math.floor(x);
    }

    let seed = hash(input);

    // Generate UUID v4 format using seeded random
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
        const r = (iterate(seed++) * 16) | 0;
        const v = c === "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
}
/**
 * This normalized date strings to ISO 8601 format so that they can be matched in wire tests.
 *
 * This can be used as a replacer function for JSON.stringify.
 *
 * @example
 * ```ts
 * JSON.stringify({ a: "2025-01-01T00:00:00.000" }, normalizeDates, 2);
 * ```
 */
export function normalizeDates(key: string, value: unknown): unknown {
    return is.isIsoDateTimeString(value) // reformat date time to ISO 8601 format
        ? new Date(value).toISOString()
        : is.isIsoDateString(value) // reformat date to ISO 8601 format
          ? new Date(value).toISOString().slice(0, 10)
          : value; // return value as is
}
