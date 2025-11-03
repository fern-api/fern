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
