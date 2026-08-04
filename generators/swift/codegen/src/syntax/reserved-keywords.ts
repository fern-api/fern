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
 * Escapes reserved keywords within a possibly-qualified type reference (e.g.
 * `Outer.Type`), backtick-escaping each dot-separated segment individually so
 * that names such as `Type` are emitted as valid Swift identifiers.
 */
export function escapeReservedKeywordTypeReference(reference: string): string {
    return reference
        .split(".")
        .map((segment) => escapeReservedKeyword(segment))
        .join(".");
}

/**
 * The `self` keyword cannot be used as a property name in Swift, and unlike other
 * reserved keywords, it cannot be escaped with backticks.
 */
export function sanitizeSelf(name: string): string {
    return name === "self" ? "self_" : name;
}

/**
 * Produces a valid Swift identifier from an arbitrary name. Swift identifiers
 * cannot begin with a digit, and unlike reserved keywords this cannot be worked
 * around with backticks, so such names are prefixed with an underscore. The
 * `self` keyword is also handled since it cannot be used as a property name.
 */
export function sanitizeSwiftIdentifier(name: string): string {
    const sanitized = sanitizeSelf(name);
    if (sanitized.length > 0 && /^[0-9]/.test(sanitized)) {
        return `_${sanitized}`;
    }
    return sanitized;
}
