/**
 * Shared utility functions extracted from renderer modules to eliminate code
 * duplication. All functions here are output-preserving -- they produce
 * exactly the same strings as the inlined versions they replace.
 */

import type { CppDocstringIr, CppFunctionIr, CppTemplateParamIr } from "../../../src/types/CppLibraryDocsIr.js";
import { needsQuoting } from "../context.js";

// ---------------------------------------------------------------------------
// Template parameter formatting (3a)
// ---------------------------------------------------------------------------

/**
 * Format a single C++ template parameter for display in a template<...> prefix.
 *
 * Handles:
 * - Variadic params where the name may be separate from the type
 * - Types that already contain the name (no duplication)
 * - Unnamed params (type only)
 * - Default values (e.g., "int N = 5", "Algorithm = BLOCK_SCAN_RAKING")
 */
export function formatTemplateParam(tp: CppTemplateParamIr): string {
    let result: string;

    if (tp.name) {
        // Check if the type already contains the name as a complete word
        // e.g., "typename T" contains "T", "class... _Properties" contains "_Properties"
        // but "BlockScanAlgorithm" should not be considered as containing "Algorithm"
        const typeEndsWithName = tp.type.endsWith(` ${tp.name}`) || tp.type === tp.name;

        if (typeEndsWithName) {
            result = tp.type;
        } else {
            result = `${tp.type} ${tp.name}`;
        }
    } else {
        result = tp.type;
    }

    // Add default value if present
    if (tp.defaultValue?.display) {
        result += ` = ${tp.defaultValue.display}`;
    }

    return result;
}

// ---------------------------------------------------------------------------
// Callout rendering (3b)
// ---------------------------------------------------------------------------

/**
 * Render a callout MDX component (Warning, Note, Error, Info).
 *
 * Returns an array of lines representing the callout block, including a
 * trailing blank line for spacing.
 *
 * @param tag - The MDX component name (e.g., "Warning", "Note", "Error", "Info")
 * @param content - The text content of the callout
 * @param title - Optional title attribute (e.g., "Deprecated", "Preconditions")
 */
export function renderCallout(tag: string, content: string, title?: string): string[] {
    const openTag = title ? `<${tag} title="${title}">` : `<${tag}>`;
    return [openTag, content, `</${tag}>`, ""];
}

// ---------------------------------------------------------------------------
// Trailing blank line trimming (3c)
// ---------------------------------------------------------------------------

/**
 * Remove trailing empty strings from a lines array (in-place).
 *
 * Common pattern at the end of section renderers to avoid extra blank lines
 * when joining with "\n".
 */
export function trimTrailingBlankLines(lines: string[]): void {
    while (lines.length > 0 && lines[lines.length - 1] === "") {
        lines.pop();
    }
}

// ---------------------------------------------------------------------------
// Frontmatter rendering (3d)
// ---------------------------------------------------------------------------

/**
 * Generate YAML frontmatter lines for a page.
 *
 * Quotes the title when it contains special YAML characters, and escapes
 * double quotes in the description.
 */
export function renderFrontmatter(title: string, description: string): string[] {
    const quotedTitle = needsQuoting(title) ? `"${title}"` : title;
    return ["---", `title: ${quotedTitle}`, `description: "${description.replace(/"/g, '\\"')}"`, "---"];
}

// ---------------------------------------------------------------------------
// Deleted function detection (3e)
// ---------------------------------------------------------------------------

/**
 * Check whether a function is effectively deleted, using both the IR field
 * and a signature heuristic.
 *
 * The IR's isDeleted field is sometimes false even when the signature
 * contains "=delete".
 */
export function isEffectivelyDeleted(func: CppFunctionIr): boolean {
    if (func.isDeleted) {
        return true;
    }
    // Check signature for =delete (the IR field is unreliable for some parsers)
    return /=\s*delete\s*$/.test(func.signature);
}

// ---------------------------------------------------------------------------
// Docstring callouts (3f) — shared across all page renderers
// ---------------------------------------------------------------------------

/**
 * Render all standard callout sections from a docstring: deprecated, warnings,
 * notes, preconditions, postconditions. Appends to the provided lines array.
 *
 * Extracted to avoid identical callout rendering code across page renderers.
 */
export function renderDocstringCallouts(
    docstring: CppDocstringIr | undefined,
    lines: string[],
    renderSegments: (segments: import("../../../src/types/CppLibraryDocsIr.js").CppDocSegment[]) => string
): void {
    if (!docstring) {
        return;
    }

    if (docstring.deprecated) {
        const depText = renderSegments(docstring.deprecated);
        if (depText) {
            lines.push("");
            lines.push(...renderCallout("Error", depText, "Deprecated"));
        }
    }
    if (docstring.warnings) {
        for (const warning of docstring.warnings) {
            const text = renderSegments(warning);
            if (text) {
                lines.push(...renderCallout("Warning", text));
            }
        }
    }
    if (docstring.notes) {
        for (const note of docstring.notes) {
            const text = renderSegments(note);
            if (text) {
                lines.push(...renderCallout("Note", text));
            }
        }
    }
    if (docstring.preconditions) {
        for (const pre of docstring.preconditions) {
            const text = renderSegments(pre);
            if (text) {
                lines.push(...renderCallout("Note", text, "Preconditions"));
            }
        }
    }
    if (docstring.postconditions) {
        for (const post of docstring.postconditions) {
            const text = renderSegments(post);
            if (text) {
                lines.push(...renderCallout("Note", text, "Postconditions"));
            }
        }
    }
}

// ---------------------------------------------------------------------------
// Docstring examples (3g)
// ---------------------------------------------------------------------------

/**
 * Render example code blocks from a docstring. Appends to the provided lines array.
 */
export function renderDocstringExamples(
    docstring: CppDocstringIr | undefined,
    lines: string[],
    renderCodeBlock: (code: string, language?: string) => string
): void {
    if (!docstring?.examples || docstring.examples.length === 0) {
        return;
    }
    lines.push("");
    lines.push("## Example");
    lines.push("");
    for (const example of docstring.examples) {
        const lang = example.language || "cpp";
        lines.push(renderCodeBlock(example.code, lang));
        lines.push("");
    }
}

// ---------------------------------------------------------------------------
// Safe HTML tag protection (shared by escapeTableCell and DescriptionRenderer)
// ---------------------------------------------------------------------------

/**
 * Regex matching known safe HTML tags that should pass through MDX escaping
 * untouched. Covers opening, closing, and self-closing forms.
 */
export const SAFE_TAG_PATTERN = /<(\/?)(?:sub|sup|br|em|strong|code)(\s[^>]*)?\/?>/gi;

/**
 * Replace safe HTML tags with null-byte placeholders so that subsequent
 * escaping does not mangle them.
 *
 * Returns the modified text and the list of original tags (in order).
 */
export function protectSafeTags(text: string): { text: string; tags: string[] } {
    const tags: string[] = [];
    const replaced = text.replace(SAFE_TAG_PATTERN, (match) => {
        const placeholder = `\x00SAFE${tags.length}\x00`;
        tags.push(match);
        return placeholder;
    });
    return { text: replaced, tags };
}

/**
 * Restore null-byte placeholders back to the original safe HTML tags.
 */
export function restoreSafeTags(text: string, tags: string[]): string {
    let result = text;
    for (let i = 0; i < tags.length; i++) {
        const tag = tags[i];
        if (tag != null) {
            result = result.replace(`\x00SAFE${i}\x00`, tag);
        }
    }
    return result;
}

// ---------------------------------------------------------------------------
// MDX text escaping (angle brackets)
// ---------------------------------------------------------------------------

/**
 * Escape angle brackets in raw IR strings entering MDX prose context
 * (headings, bold text, table cells, etc.) to prevent MDX from
 * interpreting C++ template syntax like `<int>` as JSX tags.
 */
export function escapeMdxText(text: string): string {
    return text.replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\{/g, "&#123;").replace(/\}/g, "&#125;");
}

// ---------------------------------------------------------------------------
// Markdown table escaping (3h)
// ---------------------------------------------------------------------------

/**
 * Escape content for use inside a markdown table cell.
 *
 * Handles all table-cell hazards: angle brackets (`<`, `>`), curly braces
 * (`{`, `}`), pipe characters (`|`), and newlines.
 *
 * Backtick-wrapped spans (inline code) are left untouched so that type
 * names like `vector<int>` render correctly inside code formatting.
 */
export function escapeTableCell(content: string): string {
    // Split on backtick-delimited spans (double then single) to preserve code spans.
    const parts = content.split(/(``[^`]*``|`[^`]*`)/);
    return parts
        .map((part, i) => {
            // Odd-indexed parts are inside backticks -- only escape pipe and newline
            if (i % 2 === 1) {
                return part.replace(/\|/g, "\\|").replace(/\n/g, " ");
            }
            // Even-indexed parts are outside backticks -- escape all hazards.
            // Preserve known safe HTML tags (sub, sup, br, em, strong, code)
            // by temporarily replacing them, escaping everything else, then restoring.
            const protected_ = protectSafeTags(part);

            const escaped = protected_.text
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/\{/g, "&#123;")
                .replace(/\}/g, "&#125;")
                .replace(/\|/g, "\\|")
                .replace(/\n/g, " ");

            return restoreSafeTags(escaped, protected_.tags);
        })
        .join("");
}
