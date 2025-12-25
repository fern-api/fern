import { kebabCase } from "lodash-es";

/**
 * Converts a human-readable title to a URL-safe slug.
 *
 * This function lowercases the input before applying kebabCase to avoid
 * incorrect word splitting for acronyms like "SDKs" or "APIs".
 *
 * Without lowercasing first:
 * - kebabCase("SDKs") -> "sd-ks" (incorrect)
 * - kebabCase("APIs") -> "ap-is" (incorrect)
 *
 * With lowercasing first:
 * - titleToSlug("SDKs") -> "sdks" (correct)
 * - titleToSlug("APIs") -> "apis" (correct)
 *
 * @param title - The human-readable title to convert
 * @returns A URL-safe slug
 */
export function titleToSlug(title: string): string {
    return kebabCase(title.toLowerCase());
}
