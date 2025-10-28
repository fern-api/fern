const reservedKeywords = [
    "Any",
    "as",
    "associatedtype",
    "break",
    "case",
    "catch",
    "class",
    "continue",
    "default",
    "defer",
    "deinit",
    "do",
    "else",
    "fallthrough",
    "false",
    "for",
    "guard",
    "enum",
    "extension",
    "fileprivate",
    "func",
    "if",
    "import",
    "in",
    "init",
    "inout",
    "internal",
    "is",
    "let",
    "nil",
    "operator",
    "private",
    "precedencegroup",
    "Protocol",
    "protocol",
    "public",
    "repeat",
    "rethrows",
    "return",
    "Self",
    "self",
    "static",
    "struct",
    "subscript",
    "super",
    "switch",
    "throw",
    "throws",
    "true",
    "try",
    "Type",
    "typealias",
    "var",
    "where",
    "while"
] as const;

const reservedKeywordsSet = new Set(reservedKeywords);

export type ReservedKeyword = (typeof reservedKeywords)[number];

export function isReservedKeyword(word: string): word is ReservedKeyword {
    return reservedKeywordsSet.has(word as ReservedKeyword);
}

export function escapeReservedKeyword(word: string): string {
    return isReservedKeyword(word) ? `\`${word}\`` : word;
}

/**
 * The `self` keyword cannot be used as a property name in Swift, and unlike other
 * reserved keywords, it cannot be escaped with backticks.
 */
export function sanitizeSelf(name: string): string {
    return name === "self" ? "self_" : name;
}

/**
 * Checks if a string is a valid Swift identifier.
 * Valid identifiers must start with a letter or underscore, followed by letters, digits, or underscores.
 */
export function isValidSwiftIdentifier(name: string): boolean {
    return /^[A-Za-z_][A-Za-z0-9_]*$/.test(name);
}

/**
 * Escapes an identifier to make it valid Swift syntax.
 * - Reserved keywords are wrapped in backticks
 * - Identifiers starting with digits are prefixed with underscore
 * - The `self` keyword is suffixed with underscore (cannot be escaped with backticks)
 */
export function escapeSwiftIdentifier(name: string): string {
    if (name === "self") {
        return "self_";
    }
    
    if (isReservedKeyword(name)) {
        return `\`${name}\``;
    }
    
    if (/^[0-9]/.test(name)) {
        return `_${name}`;
    }
    
    return name;
}
