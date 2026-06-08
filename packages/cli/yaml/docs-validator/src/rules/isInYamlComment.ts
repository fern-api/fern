/**
 * Checks whether a regex match at the given index falls inside a YAML comment.
 * Strips quoted strings from the text preceding the match on the same line,
 * then returns true if a bare '#' remains — indicating a comment.
 */
export function isInYamlComment(contents: string, matchIndex: number): boolean {
    const lineStart = contents.lastIndexOf("\n", matchIndex - 1) + 1;
    const textBeforeMatch = contents.substring(lineStart, matchIndex);
    const withoutQuotes = textBeforeMatch.replace(/"[^"]*"|'[^']*'/g, "");
    return withoutQuotes.includes("#");
}
