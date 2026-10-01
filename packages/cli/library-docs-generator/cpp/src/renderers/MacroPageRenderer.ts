/**
 * Renders a standalone preprocessor macro (#define) page as MDX.
 *
 * Page structure:
 * 1. Frontmatter (title + description)
 * 2. Summary paragraphs
 * 3. Signature (CodeBlock with the #define line)
 * 4. Description blocks
 * 5. Callouts (deprecated, warnings, notes)
 * 6. Parameters (function-like macros only)
 * 7. See also
 */

import type { CppMacroIr } from "../../../src/types/CppLibraryDocsIr.js";
import type { CompoundMeta } from "../context.js";
import {
    renderDescriptionBlocksDeduped,
    renderSeeAlso,
    renderSegmentsPlainText,
    renderSegmentsTrimmed,
    setCurrentPagePath
} from "./DescriptionRenderer.js";
import { renderMacroParams } from "./ParamRenderer.js";
import { renderBareCodeBlock } from "./SignatureRenderer.js";
import {
    renderDocstringCallouts,
    renderDocstringExamples,
    renderFrontmatter,
    trimTrailingBlankLines
} from "./shared.js";

/**
 * Build the `#define` line.
 *
 * Examples:
 *   #define LIB_SUCCESS 0
 *   #define LIB_MAX(a, b) ((a) > (b) ? (a) : (b))
 *   #define LIB_EXPORT
 */
export function formatMacroSignature(macro: CppMacroIr): string {
    const params = macro.parameters != null ? `(${macro.parameters.join(", ")})` : "";
    const initializer = macro.initializer?.trim();
    return `#define ${macro.name}${params}${initializer ? ` ${initializer}` : ""}`;
}

/**
 * Render a full macro page as MDX.
 */
export function renderMacroPage(macro: CppMacroIr, meta: CompoundMeta): string {
    setCurrentPagePath(macro.path);

    try {
        const sections: string[] = [];
        const docstring = macro.docstring;

        const description = meta.description ?? (docstring ? renderSegmentsPlainText(docstring.summary) : "");
        sections.push(...renderFrontmatter(macro.path, description));

        if (docstring?.summary && docstring.summary.length > 0) {
            const summary = renderSegmentsTrimmed(docstring.summary);
            if (summary) {
                sections.push("");
                sections.push(summary);
            }
        }

        sections.push("");
        sections.push(renderBareCodeBlock(formatMacroSignature(macro)));

        if (docstring?.description && docstring.description.length > 0) {
            const desc = renderDescriptionBlocksDeduped(docstring.description, docstring.summary);
            if (desc) {
                sections.push("");
                sections.push(desc);
            }
        }

        renderDocstringCallouts(docstring, sections, renderSegmentsTrimmed);
        renderDocstringExamples(docstring, sections, renderBareCodeBlock);

        const params = renderMacroParams(macro, docstring);
        if (params) {
            sections.push("");
            sections.push(params);
        }

        if (docstring?.seeAlso && docstring.seeAlso.length > 0) {
            const seeAlsoBlock = renderSeeAlso(docstring.seeAlso);
            if (seeAlsoBlock) {
                sections.push("");
                sections.push(seeAlsoBlock);
            }
        }

        trimTrailingBlankLines(sections);
        return sections.join("\n") + "\n";
    } finally {
        setCurrentPagePath(undefined);
    }
}
