import {
    CasingOptions,
    SafeAndUnsafe,
    toCamelCase,
    toPascalCase,
    toScreamingSnakeCase,
    toSnakeCase
} from "@fern-api/casings-generator";

/**
 * Python-specific casing options.
 * Uses Python reserved keywords and smart casing for proper name generation.
 */
const PYTHON_CASING_OPTIONS: CasingOptions = {
    generationLanguage: "python",
    smartCasing: true
};

/**
 * Converts a string to camelCase with Python-specific options.
 */
export function pythonToCamelCase(str: string): SafeAndUnsafe {
    return toCamelCase(str, PYTHON_CASING_OPTIONS);
}

/**
 * Converts a string to PascalCase with Python-specific options.
 */
export function pythonToPascalCase(str: string): SafeAndUnsafe {
    return toPascalCase(str, PYTHON_CASING_OPTIONS);
}

/**
 * Converts a string to snake_case with Python-specific options.
 */
export function pythonToSnakeCase(str: string): SafeAndUnsafe {
    return toSnakeCase(str, PYTHON_CASING_OPTIONS);
}

/**
 * Converts a string to SCREAMING_SNAKE_CASE with Python-specific options.
 */
export function pythonToScreamingSnakeCase(str: string): SafeAndUnsafe {
    return toScreamingSnakeCase(str, PYTHON_CASING_OPTIONS);
}
