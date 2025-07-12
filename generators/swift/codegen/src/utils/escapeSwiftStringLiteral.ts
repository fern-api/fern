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
