export function escapeSwiftStringLiteral(rawValue: string): string {
    return (
        rawValue
            // First handle unicode escapes - convert \uXXXX to \u{XXXX}
            .replace(/\\u([0-9a-fA-F]{4})/g, "\\u{$1}")
            // Handle special escape sequences that are invalid in Swift
            // Use negative lookbehind to ensure the backslash isn't already escaped
            .replace(/(?<!\\)\\f/g, "\\u{000C}") // form feed
            .replace(/(?<!\\)\\v/g, "\\u{000B}") // vertical tab
            .replace(/(?<!\\)\\0/g, "\\u{0000}") // null character
            // Escape double quotes (but not if already escaped)
            .replace(/(?<!\\)"/g, '\\"')
        // \n, \r, \t, \\ are already valid in Swift and don't need conversion
    );
}

/**
 * Escape a raw JavaScript string for use as the contents of a Swift double-quoted
 * string literal. Unlike `escapeSwiftStringLiteral`, which assumes its input is
 * pre-escaped with literal backslash sequences, this function operates on raw
 * string values that may contain real control characters (e.g. values produced
 * by `JSON.parse`). All characters that cannot appear unescaped inside a Swift
 * `"..."` literal are converted to their corresponding Swift escape sequences.
 */
export function escapeSwiftStringLiteralContent(value: string): string {
    let result = "";
    for (let i = 0; i < value.length; i++) {
        const ch = value[i];
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
                if (ch == null) {
                    continue;
                }
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
