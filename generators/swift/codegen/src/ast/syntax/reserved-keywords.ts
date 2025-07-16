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
] as const

const reservedKeywordsSet = new Set(reservedKeywords)

export type ReservedKeyword = (typeof reservedKeywords)[number]

export function isReservedKeyword(word: string): word is ReservedKeyword {
    return reservedKeywordsSet.has(word as ReservedKeyword)
}

export function escapeReservedKeyword(word: string): string {
    return isReservedKeyword(word) ? `\`${word}\`` : word
}
