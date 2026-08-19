/**
 * Strips MDX comments ({/* ... * /}) from markdown content.
 * Respects code fences (```) and inline code (`) to avoid modifying code examples.
 *
 * When a comment occupies an entire line (with only optional whitespace around it),
 * the entire line is removed to avoid leaving blank lines.
 */
export function stripMdxComments(content: string): string {
    let result = "";
    let i = 0;
    const len = content.length;
    let inCodeFence = false;
    let inInlineCode = false;

    while (i < len) {
        // Track code fences at start of line — skip past the three backticks
        // so they aren't misinterpreted as inline code toggles
        if (
            (i === 0 || content[i - 1] === "\n") &&
            content[i] === "`" &&
            content[i + 1] === "`" &&
            content[i + 2] === "`"
        ) {
            inCodeFence = !inCodeFence;
            result += "```";
            i += 3;
            continue;
        }

        if (!inCodeFence) {
            // Track inline code
            if (content[i] === "`" && (i === 0 || content[i - 1] !== "\\")) {
                // Check if it's a double backtick (used to display backticks: `` `backtick` ``)
                const isDouble = content[i + 1] === "`" && content[i + 2] !== "`";
                if (isDouble) {
                    // Handle double backticks as a pair - skip to end of double backtick pair
                    const nextDouble = content.indexOf("``", i + 2);
                    if (nextDouble !== -1 && !inInlineCode) {
                        result += content.slice(i, nextDouble + 2);
                        i = nextDouble + 2;
                        continue;
                    }
                } else if (content[i + 1] !== "`") {
                    // Single backtick - toggle inline code
                    inInlineCode = !inInlineCode;
                }
            }

            // Detect MDX comment start: {/*
            if (!inInlineCode && content[i] === "{" && content[i + 1] === "/" && content[i + 2] === "*") {
                const endIdx = content.indexOf("*/}", i + 3);
                if (endIdx !== -1) {
                    const commentEnd = endIdx + 3;

                    // Check if the comment is on its own line(s)
                    // Find the start of the line containing the comment start
                    const lineStart = result.lastIndexOf("\n") + 1;
                    const beforeComment = result.slice(lineStart);

                    // Find the end of the line containing the comment end
                    const nextNewline = content.indexOf("\n", commentEnd);
                    const afterComment =
                        nextNewline === -1 ? content.slice(commentEnd) : content.slice(commentEnd, nextNewline);

                    if (beforeComment.trim() === "" && afterComment.trim() === "") {
                        // Comment is on its own line(s) - remove the entire line(s)
                        result = result.slice(0, lineStart);
                        i = nextNewline === -1 ? commentEnd : nextNewline + 1;
                    } else {
                        // Comment is inline with other content - just remove the comment
                        i = commentEnd;
                    }
                    continue;
                }
            }
        }

        result += content[i];
        i++;
    }

    return result;
}
