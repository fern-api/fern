/**
 * Wraps type references containing angle brackets (e.g., `Optional<String>`,
 * `Map<String, Object>`) in inline code fences (backticks) so they are not
 * parsed as HTML/JSX tags by MDX compilers.
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
            // Wrap type references containing angle brackets in backticks.
            // Matches patterns like: Optional<String>, Map<String, Object>,
            // CompletableFuture<List<Integer>>, etc.
            // Supports up to two levels of nesting.
            return part.replace(/\b([A-Za-z]\w*<(?:[^<>]*(?:<[^<>]*>)?[^<>]*)>)/g, "`$1`");
        })
        .join("");
}
