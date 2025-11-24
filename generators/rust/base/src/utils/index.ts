import { camelCase, snakeCase } from "lodash-es";
import { RUST_KEYWORDS, RUST_RESERVED_TYPES } from "../constants";

export function convertToSnakeCase(str: string): string {
    return snakeCase(str);
}

export function convertToCamelCase(str: string): string {
    return camelCase(str);
}

export function convertToPascalCase(str: string): string {
    return str.charAt(0).toUpperCase() + camelCase(str).slice(1);
}

export function convertPascalToSnakeCase(pascalCase: string): string {
    return pascalCase
        .replace(/([A-Z])/g, "_$1")
        .toLowerCase()
        .replace(/^_/, "");
}

export function escapeRustKeyword(name: string): string {
    // Handle identifiers starting with numbers by prefixing with underscore
    if (/^[0-9]/.test(name)) {
        return `_${name}`;
    }
    return RUST_KEYWORDS.has(name) ? `r#${name}` : name;
}

export function escapeRustReservedType(name: string): string {
    return RUST_RESERVED_TYPES.has(name) ? `r#${name}` : name;
}

export function getName(name: string): string {
    if (RUST_KEYWORDS.has(name)) {
        return `${name}_`;
    }
    return name;
}

export function validateAndSanitizeCrateName(crateName: string): string {
    let sanitized = crateName
        .toLowerCase()
        .replace(/[^a-z0-9_-]/g, "_")
        .replace(/^[0-9]/, "_$&");

    sanitized = sanitized.replace(/[_-]+/g, "_");
    sanitized = sanitized.replace(/^_+|_+$/g, "");

    if (!sanitized) {
        sanitized = "rust_sdk";
    }

    return sanitized;
}

export function generateDefaultCrateName(organization: string, apiName: string): string {
    return `${organization}_${apiName}`.toLowerCase();
}
