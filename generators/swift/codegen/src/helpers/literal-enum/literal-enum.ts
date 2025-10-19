import { camelCase } from "lodash-es";

import { pascalCase } from "../pascal-case";

/**
 * Generates a safe name for a string literal enum from the literal value.
 */
export function generateName(literalValue: string): string {
    const sanitizedLiteralValue = sanitizeLiteralValue(literalValue);
    return pascalCase(sanitizedLiteralValue);
}

/**
 * Generates a safe enum case label for a string literal enum from the literal value.
 */
export function generateEnumCaseLabel(literalValue: string): string {
    const sanitizedLiteralValue = sanitizeLiteralValue(literalValue);
    return camelCase(sanitizedLiteralValue);
}

/**
 * Sanitizes a literal value to produce a clean alphanumeric string suitable for Swift identifiers.
 * Uses "value" as fallback for anything that doesn't result in a clean identifier.
 */
export function sanitizeLiteralValue(originalValue: string): string {
    if (originalValue === "") {
        return "empty";
    }
    let sanitizedValue = originalValue;
    const isAlreadyValid = /^[a-zA-Z][a-zA-Z0-9]*$/.test(originalValue);
    if (!isAlreadyValid) {
        // Remove invalid characters from the left first to avoid unwanted capitalization
        sanitizedValue = sanitizedValue.replace(/^[^a-zA-Z0-9]+/, "");
        // Apply camelCase to preserve word boundaries
        sanitizedValue = camelCase(sanitizedValue);
    }
    // If it starts with a digit, use "value"
    if (/^\d/.test(sanitizedValue)) {
        return "value";
    }
    if (sanitizedValue === "") {
        return "value";
    }
    return sanitizedValue;
}
