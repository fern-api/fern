// Pre-computed escape sequences for common characters
const ESCAPE_MAP: Record<string, string> = {
    "\\": "\\\\", // Backslash
    '"': '\\"', // Double quote
    "\n": "\\n", // Newline (LF)
    "\r": "\\r", // Carriage return (CR)
    "\t": "\\t", // Tab
    "\0": "\\0", // Null
    "\f": "\\f", // Form feed
    "\u0008": "\\b", // Backspace
    "\v": "\\v", // Vertical tab
    "\u0007": "\\a" // Bell/alert
};

// Single regex that matches all characters that need escaping
// eslint-disable-next-line
const ESCAPE_REGEX = /[\\\"\n\r\t\0\f\u0007\u0008\v\u0001-\u0006\u000E-\u001F\u007F-\u009F]/g;

export function escapeForCSharpString(input: string): string {
    return input.replace(ESCAPE_REGEX, (match) => {
        const escaped = ESCAPE_MAP[match];
        if (escaped !== undefined) {
            return escaped;
        }

        // Fall back to Unicode escape for other control characters
        return `\\u${match.charCodeAt(0).toString(16).padStart(4, "0")}`;
    });
}
