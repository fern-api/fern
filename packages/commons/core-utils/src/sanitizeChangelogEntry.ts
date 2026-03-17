/**
 * Wraps type references containing angle brackets (e.g., `Optional<String>`,
 * `Map<String, Object>`) in inline code fences (backticks) so they are not
 * parsed as HTML/JSX tags by MDX compilers.
 *
 * Uses a balanced-bracket parser to support arbitrary nesting depth
 * (e.g., `Map<String, Map<String, List<Integer>>>`).
 *
 * Already-backticked spans are left untouched.
 */
export function sanitizeChangelogEntry(entry: string): string {
    // Split the text into alternating segments: plain text and backtick-delimited code spans.
    // Odd-indexed segments are inside backticks and must be preserved as-is.
    const parts = entry.split(/(`[^`]+`)/g);
    return parts
        .map((part) => {
            // If this part is a code span, leave it as-is
            if (part.startsWith("`") && part.endsWith("`")) {
                return part;
            }
            return wrapAngleBracketTypes(part);
        })
        .join("");
}

/**
 * Finds identifier-prefixed angle-bracket type references (e.g., Optional<String>)
 * and wraps each one in backticks. Handles arbitrary nesting depth by counting
 * balanced `<` / `>` pairs.
 */
function wrapAngleBracketTypes(text: string): string {
    let result = "";
    let i = 0;
    while (i < text.length) {
        // Check if we're at a word boundary followed by an identifier + '<'
        const ch = text[i];
        const prev = i > 0 ? text[i - 1] : undefined;
        if (ch != null && /[A-Za-z]/.test(ch) && (i === 0 || (prev != null && /\W/.test(prev)))) {
            // Try to match an identifier (e.g., Optional, Map, List)
            const identMatch = /^[A-Za-z]\w*/.exec(text.slice(i));
            if (
                identMatch != null &&
                i + identMatch[0].length < text.length &&
                text[i + identMatch[0].length] === "<"
            ) {
                const angleStart = i + identMatch[0].length;
                // Find balanced closing '>'
                let depth = 0;
                let j = angleStart;
                let balanced = false;
                while (j < text.length) {
                    if (text[j] === "<") {
                        depth++;
                    } else if (text[j] === ">") {
                        depth--;
                        if (depth === 0) {
                            balanced = true;
                            break;
                        }
                    }
                    j++;
                }
                if (balanced) {
                    result += "`" + text.slice(i, j + 1) + "`";
                    i = j + 1;
                    continue;
                }
            }
        }
        result += text[i];
        i++;
    }
    return result;
}
