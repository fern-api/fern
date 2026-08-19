import { camelCase as lodashCamelCase } from "lodash-es";

/**
 * Converts a string to camelCase with special handling for OAuth.
 *
 * Examples:
 * - "Bearer" -> "bearer"
 * - "OAuth" -> "oauth" (not "oAuth")
 * - "magical_auth" -> "magicalAuth"
 * - "my-api-key" -> "myApiKey"
 *
 * @param str The string to convert to camelCase
 * @returns The camelCase version of the string
 */
export function toCamelCase(str: string): string {
    const camelCased = lodashCamelCase(str);
    // Special case: "OAuth" should become "oauth" not "oAuth"
    if (camelCased === "oAuth") {
        return "oauth";
    }
    return camelCased;
}
