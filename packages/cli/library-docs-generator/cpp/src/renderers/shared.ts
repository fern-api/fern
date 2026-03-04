/**
 * Shared utility functions extracted from renderer modules to eliminate code
 * duplication. All functions here are output-preserving -- they produce
 * exactly the same strings as the inlined versions they replace.
 */

import type { CppFunctionIr, CppTemplateParamIr } from "../../../src/types/CppLibraryDocsIr.js";
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
 */
export function formatTemplateParam(tp: CppTemplateParamIr): string {
    if (tp.name) {
        // For variadic params, the name may be separate from the type
        // e.g., type="class...", name="_Properties" -> "class... _Properties"
        if (tp.isVariadic) {
            if (tp.type.includes(tp.name)) {
                return tp.type;
            }
            return `${tp.type} ${tp.name}`;
        }
        if (tp.type.includes(tp.name)) {
            return tp.type;
        }
        return `${tp.type} ${tp.name}`;
    }
    return tp.type;
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
