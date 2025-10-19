import { camelCase } from "lodash-es";
import { toWords } from "number-to-words";

import { pascalCase } from "../pascal-case";

/**
 * Generates a PascalCase name from a value (for type/struct names).
 */
export function sanitizeToPascalCase(value: string): string {
    const sanitized = sanitizeForIdentifier(value);
    return pascalCase(sanitized);
}

/**
 * Generates a camelCase name from a value (for property/case names).
 */
export function sanitizeToCamelCase(value: string): string {
    const sanitized = sanitizeForIdentifier(value);
    return camelCase(sanitized);
}

export function sanitizeForIdentifier(originalValue: string): string {
    if (originalValue === "") {
        return "empty";
    }

    let sanitizedValue = originalValue;

    // Convert leading numbers to words first
    if (/^\d/.test(sanitizedValue)) {
        sanitizedValue = convertLeadingNumberToWords(sanitizedValue);
    }

    const isAlreadyValid = /^[a-zA-Z][a-zA-Z0-9]*$/.test(sanitizedValue);
    if (!isAlreadyValid) {
        // Remove invalid characters from the left first to avoid unwanted capitalization
        sanitizedValue = sanitizedValue.replace(/^[^a-zA-Z0-9]+/, "");
        // Apply camelCase to preserve word boundaries
        sanitizedValue = camelCase(sanitizedValue);
    }

    // Double-check if it still starts with a digit (shouldn't happen, but safety check)
    if (/^\d/.test(sanitizedValue)) {
        sanitizedValue = "value" + sanitizedValue;
    }

    if (sanitizedValue === "") {
        return "value";
    }

    return sanitizedValue;
}

function convertLeadingNumberToWords(value: string): string {
    // Extract leading digits
    const match = value.match(/^(\d+)/);
    if (!match || !match[1]) {
        return value;
    }

    const leadingNumber = match[1];
    const rest = value.slice(leadingNumber.length);

    try {
        // Convert the number to words and remove spaces/hyphens
        const numberAsWords = toWords(parseInt(leadingNumber, 10))
            .replace(/[\s-]+/g, "")
            .toLowerCase();
        return numberAsWords + rest;
    } catch {
        // If conversion fails, fall back to digit-by-digit
        const digitWords: Record<string, string> = {
            "0": "zero",
            "1": "one",
            "2": "two",
            "3": "three",
            "4": "four",
            "5": "five",
            "6": "six",
            "7": "seven",
            "8": "eight",
            "9": "nine"
        };
        const words = leadingNumber
            .split("")
            .map((digit) => digitWords[digit] || digit)
            .join("");
        return words + rest;
    }
}
