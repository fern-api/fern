/**
 * MDX utility functions for rendering library documentation.
 *
 * Ported from servers/fdr/src/services/library-docs/renderer/base/utils.ts
 */

/**
 * Escape only JSX/HTML characters (not code block markers).
 * Used by both escapeMdx and escapeMdxForDescription.
 */
function escapeJsxChars(text: string): string {
    return text.replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/{/g, "&#123;").replace(/}/g, "&#125;");
}

/**
 * Escape special MDX characters in text.
 *
 * Use this for short text like identifiers, types, and parameter values
 * where code blocks are not expected.
 *
 * Handles:
 * - HTML/JSX brackets: < > { }
 * - Code block markers: ``` (prevents unclosed code blocks)
 */
export function escapeMdx(text: string): string {
    return escapeJsxChars(text.replace(/```/g, "\\`\\`\\`"));
}

/**
 * Escape JSX/HTML characters in text that may contain code blocks.
 *
 * Only escapes characters OUTSIDE fenced code blocks. Code blocks are
 * preserved as-is since their content should render literally.
 *
 * Sanitization performed on code blocks:
 * - Language tags containing JSX-unsafe chars are normalized to "python"
 *   (e.g., ```{doctest} → ```python — the braces would break MDX parsing)
 * - Unclosed code blocks get a closing fence appended
 *   (prevents the block from swallowing all subsequent content)
 */
export function escapeMdxPreservingCodeBlocks(text: string): string {
    const result: string[] = [];
    let lastIndex = 0;

    // Match code blocks: ```optional-lang\n...content...\n``` OR unclosed ```...to end
    const codeBlockRegex = /```[\w{}-]*\n[\s\S]*?(?:\n```|$)/g;

    let match;
    while ((match = codeBlockRegex.exec(text)) !== null) {
        // Escape text before this code block
        if (match.index > lastIndex) {
            result.push(escapeJsxChars(text.slice(lastIndex, match.index)));
        }

        let codeBlock = match[0];

        // Normalize language tags containing JSX-unsafe chars ({, }) to "python"
        codeBlock = codeBlock.replace(/^```\{?\w*\}?\n/, "```python\n");

        // Repair unclosed fence — if the regex matched via $ instead of \n```,
        // the block has no closing fence and would swallow all subsequent content
        if (!codeBlock.endsWith("```")) {
            codeBlock += "\n```";
        }

        result.push(codeBlock);
        lastIndex = match.index + match[0].length;
    }

    // Escape remaining text after last code block
    if (lastIndex < text.length) {
        result.push(escapeJsxChars(text.slice(lastIndex)));
    }

    return result.join("");
}

/**
 * Generate an anchor ID from a dotted path.
 * e.g., "requests.models.Response" -> "requests-models-Response"
 */
export function generateAnchorId(path: string): string {
    return path.replace(/\./g, "-");
}

/**
 * Format a type annotation for display, escaping MDX characters.
 */
export function formatTypeAnnotation(type: string | null | undefined): string {
    if (!type) {
        return "";
    }
    return escapeMdx(type);
}

/**
 * Create MDX frontmatter.
 */
export function createFrontmatter(slug: string, title?: string): string {
    const parts = ["---", "layout: overview", `slug: ${slug}`];
    if (title) {
        parts.push(`title: ${title}`);
    }
    parts.push("---");
    return parts.join("\n");
}

/**
 * Escape content for use inside markdown table cells.
 * Pipe characters break table structure and need to be escaped.
 */
export function escapeTableCell(text: string): string {
    return text.replace(/\|/g, "\\|").replace(/\n/g, " ");
}
