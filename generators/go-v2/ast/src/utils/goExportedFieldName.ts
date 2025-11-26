/**
 * Go keywords and predeclared types that should be avoided as struct field names.
 * We check case-insensitively since PascalCase versions like "String" should also be prefixed.
 * Note: We intentionally exclude predeclared functions (append, len, make, etc.) and
 * constants (true, false, nil, iota) as they don't typically cause issues as field names.
 */
const GO_RESERVED_IDENTIFIERS = new Set([
    // Keywords
    "break",
    "case",
    "chan",
    "const",
    "continue",
    "default",
    "defer",
    "else",
    "fallthrough",
    "for",
    "func",
    "go",
    "goto",
    "if",
    "import",
    "interface",
    "map",
    "package",
    "range",
    "return",
    "select",
    "struct",
    "switch",
    "type",
    "var",
    // Predeclared types
    "bool",
    "byte",
    "complex64",
    "complex128",
    "error",
    "float32",
    "float64",
    "int",
    "int8",
    "int16",
    "int32",
    "int64",
    "rune",
    "string",
    "uint",
    "uint8",
    "uint16",
    "uint32",
    "uint64",
    "uintptr"
]);

/**
 * Converts a name to a valid Go exported identifier.
 * Go exported identifiers must start with an uppercase letter.
 * This function handles edge cases like:
 * - Names that are empty or only underscores (e.g., "_") -> "Underscore"
 * - Names that start with a digit (e.g., "1") -> "Field1"
 * - Names that start with underscore followed by digit (e.g., "_1") -> "Field1"
 * - Names that match Go reserved words/predeclared identifiers (e.g., "String") -> "FieldString"
 */
export function goExportedFieldName(name: string): string {
    if (name === "") {
        return "Underscore";
    }

    // Strip leading underscores
    let stripped = name;
    while (stripped.startsWith("_")) {
        stripped = stripped.slice(1);
    }
    if (stripped === "") {
        // Name was all underscores
        return "Underscore";
    }

    // Check if the first character is a digit
    if (stripped.length > 0 && /^\d/.test(stripped)) {
        return "Field" + stripped;
    }

    // Ensure the first letter is uppercase for export
    let result = stripped;
    const firstChar = stripped[0];
    if (stripped.length > 0 && firstChar != null && firstChar !== firstChar.toUpperCase()) {
        result = firstChar.toUpperCase() + stripped.slice(1);
    }

    // Check if the name matches a Go reserved word or predeclared identifier (case-insensitive)
    if (GO_RESERVED_IDENTIFIERS.has(result.toLowerCase())) {
        return "Field" + result;
    }

    return result;
}
