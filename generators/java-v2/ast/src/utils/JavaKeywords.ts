// Java reserved words (keywords + reserved literals). Mirrors the v1 generator's
// KeyWordUtils so that v1 and v2 escape identifiers and package segments the same way.
const JAVA_RESERVED_WORDS = new Set([
    "abstract",
    "assert",
    "boolean",
    "break",
    "byte",
    "case",
    "catch",
    "char",
    "class",
    "const",
    "continue",
    "default",
    "do",
    "double",
    "else",
    "enum",
    "extends",
    "final",
    "finally",
    "float",
    "for",
    "goto",
    "if",
    "implements",
    "import",
    "instanceof",
    "int",
    "interface",
    "long",
    "native",
    "new",
    "package",
    "private",
    "protected",
    "public",
    "return",
    "short",
    "static",
    "strictfp",
    "super",
    "switch",
    "synchronized",
    "this",
    "throw",
    "throws",
    "transient",
    "try",
    "void",
    "volatile",
    "while",
    "true",
    "false",
    "null",
    "_"
]);

export function isJavaReservedWord(value: string): boolean {
    return JAVA_RESERVED_WORDS.has(value.toLowerCase());
}

// Returns a keyword-safe version of the given identifier/package segment by
// prefixing reserved words with an underscore (e.g. "enum" -> "_enum").
export function escapeJavaKeyword(name: string): string {
    return isJavaReservedWord(name) ? "_" + name : name;
}
