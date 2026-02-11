/**
 * Render DocstringIr to MDX sections.
 *
 * Ported from servers/fdr/src/services/library-docs/renderer/base/DocstringRenderer.ts
 * Adapted to use @fern-api/fdr-sdk types and improved escaping for code-block-containing text.
 */

import type { FdrAPI } from "@fern-api/fdr-sdk";
import { escapeMdx, escapeMdxPreservingCodeBlocks, formatTypeAnnotation } from "../utils/mdx.js";

/**
 * Sanitize description text and wrap its code blocks for MDX rendering.
 *
 * 1. Sanitizes: escapes JSX chars outside code blocks, normalizes language tags, repairs unclosed fences
 * 2. Renders: wraps fenced code blocks in <CodeBlock showLineNumbers={false}> components
 */
function renderDescriptionText(text: string): string {
    const sanitized = escapeMdxPreservingCodeBlocks(text);
    // Only wrap top-level (unindented) code blocks in <CodeBlock>.
    // Indented code blocks (inside list items) stay as plain fences because
    // block-level JSX components break MDX parsing within list items.
    return sanitized.replace(
        /^```(\w*)\n([\s\S]*?)\n```/gm,
        "<CodeBlock showLineNumbers={false}>\n\n```$1\n$2\n```\n\n</CodeBlock>"
    );
}

/**
 * Render a full docstring to MDX, including all structured sections:
 * description, parameters, returns, raises, examples, notes, warnings.
 *
 * @param paramAnnotations - Fallback type annotations from the function signature,
 *   keyed by parameter name. Used when the docstring param entry has no type.
 * @param returnAnnotation - Fallback return type from the function signature.
 */
export function renderDocstring(
    docstring: FdrAPI.libraryDocs.DocstringIr | null | undefined,
    paramAnnotations?: Record<string, string>,
    returnAnnotation?: string
): string {
    if (!docstring) {
        return "";
    }

    const lines: string[] = [];

    // Description (full text — summary is only used for tables/tooltips)
    if (docstring.description) {
        lines.push(renderDescriptionText(docstring.description), "");
    }

    // Parameters
    if (docstring.params.length > 0) {
        lines.push("**Parameters:**", "");
        for (const param of docstring.params) {
            const type = param.type || paramAnnotations?.[param.name] || "";
            const typeStr = type ? formatTypeAnnotation(type) : "";

            const attrs: string[] = [`path="${param.name}"`];
            if (typeStr) {
                attrs.push(`type="${typeStr}"`);
            }
            if (param.default) {
                attrs.push(`default="${escapeMdx(param.default)}"`);
            }

            // ParamField is a JSX context — use escapeMdx (code blocks inside JSX are unreliable)
            lines.push(
                `<ParamField ${attrs.join(" ")}>`,
                param.description ? escapeMdx(param.description) : "",
                "</ParamField>",
                ""
            );
        }
    }

    // Returns
    if (docstring.returns) {
        const type = docstring.returns.type || returnAnnotation || "";
        const typeStr = type ? ` \`${formatTypeAnnotation(type)}\`` : "";
        lines.push(`**Returns:**${typeStr}`, "");
        if (docstring.returns.description) {
            lines.push(renderDescriptionText(docstring.returns.description), "");
        }
    }

    // Raises
    if (docstring.raises.length > 0) {
        lines.push("**Raises:**", "");
        for (const exc of docstring.raises) {
            const desc = exc.description ? `: ${escapeMdx(exc.description)}` : "";
            lines.push(`- \`${escapeMdx(exc.type)}\`${desc}`);
        }
        lines.push("");
    }

    // Examples
    if (docstring.examples.length > 0) {
        lines.push("**Examples:**", "");
        for (const example of docstring.examples) {
            if (example.description) {
                lines.push(renderDescriptionText(example.description), "");
            }
            lines.push(
                "<CodeBlock showLineNumbers={false}>",
                "",
                "```python",
                example.code,
                "```",
                "",
                "</CodeBlock>",
                ""
            );
        }
    }

    // Notes — rendered as standalone MDX so preserve code blocks
    if (docstring.notes.length > 0) {
        lines.push("<Note>", "");
        for (const note of docstring.notes) {
            lines.push(renderDescriptionText(note));
        }
        lines.push("", "</Note>", "");
    }

    // Warnings — same treatment as notes
    if (docstring.warnings.length > 0) {
        lines.push("<Warning>", "");
        for (const warning of docstring.warnings) {
            lines.push(renderDescriptionText(warning));
        }
        lines.push("", "</Warning>", "");
    }

    return lines.join("\n");
}

/**
 * Render just the prose text of a docstring (no structured sections).
 * Used for module-level and attribute-level documentation.
 */
export function renderSimpleDocstring(docstring: FdrAPI.libraryDocs.DocstringIr | null | undefined): string {
    if (!docstring?.description) {
        return "";
    }
    return renderDescriptionText(docstring.description);
}
