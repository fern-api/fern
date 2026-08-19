/**
 * Translates a string that is already in a JSON/JS source-style escaped form
 * (e.g. a literal backslash followed by `n` to mean a newline) into the
 * equivalent Swift double-quoted string literal contents.
 *
 * Use this when the input has already been escape-encoded by some other
 * producer (for example, a value emitted by `JSON.stringify` or copied
 * verbatim from a JSON document) and you just need to bridge the few
 * sequences where Swift's syntax differs from JSON's:
 *   - `\uXXXX`           → `\u{XXXX}` (Swift's unicode escape syntax)
 *   - `\f`, `\v`, `\0`   → `\u{000C}`, `\u{000B}`, `\u{0000}` (Swift has no short forms)
 *   - unescaped `"`      → `\"`
 *
 * Sequences that are valid in both JSON and Swift (`\n`, `\r`, `\t`, `\\`)
 * are left as-is. The input must NOT contain real control characters; for
 * raw runtime strings (e.g. values produced by `JSON.parse`), use
 * {@link escapeSwiftStringLiteralContent} instead.
 */
export function escapeSwiftStringLiteral(rawValue: string): string {
    return rawValue
        .replace(/\\u([0-9a-fA-F]{4})/g, "\\u{$1}")
        .replace(/(?<!\\)\\f/g, "\\u{000C}")
        .replace(/(?<!\\)\\v/g, "\\u{000B}")
        .replace(/(?<!\\)\\0/g, "\\u{0000}")
        .replace(/(?<!\\)"/g, '\\"');
}

/**
 * Escapes an arbitrary runtime string so it can be safely embedded as the
 * contents of a Swift double-quoted (`"..."`) string literal.
 *
 * Unlike {@link escapeSwiftStringLiteral}, this operates on raw string values
 * that may contain real control characters (e.g. an actual newline byte from
 * a `JSON.parse`d example value). Every character that cannot appear
 * unescaped inside a Swift `"..."` literal is converted to its Swift escape
 * sequence:
 *   - `\`, `"`                                 → `\\`, `\"`
 *   - real `\n`, `\r`, `\t`, `\0`              → `\n`, `\r`, `\t`, `\0`
 *   - other C0 / DEL control chars (< 0x20, 0x7F) → `\u{XX}`
 *
 * Note: this also escapes backslashes, so callers MUST NOT use this for
 * strings that intentionally contain Swift-level escapes or interpolation
 * (e.g. `\(foo)`) — those would be double-escaped and emitted as literal
 * text.
 */
export function escapeSwiftStringLiteralContent(value: string): string {
    let result = "";
    for (const ch of value) {
        switch (ch) {
            case "\\":
                result += "\\\\";
                break;
            case '"':
                result += '\\"';
                break;
            case "\n":
                result += "\\n";
                break;
            case "\r":
                result += "\\r";
                break;
            case "\t":
                result += "\\t";
                break;
            case "\0":
                result += "\\0";
                break;
            default: {
                const code = ch.charCodeAt(0);
                if (code < 0x20 || code === 0x7f) {
                    result += `\\u{${code.toString(16).toUpperCase()}}`;
                } else {
                    result += ch;
                }
            }
        }
    }
    return result;
}
