import { PHP_RESERVED_KEYWORDS } from "./constants";

/**
 * Returns a safe class name, adding a trailing underscore if the name
 * conflicts with a PHP reserved keyword.
 */
export function getSafeClassName(className: string): string {
    // Check if the class name is a reserved keyword (case-insensitive)
    if (PHP_RESERVED_KEYWORDS.has(className.toLowerCase())) {
        // Add trailing underscore to avoid collision
        return `${className}_`;
    }

    return className;
}
