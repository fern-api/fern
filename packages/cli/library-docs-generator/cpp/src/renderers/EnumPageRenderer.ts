/**
 * Renders a standalone C++ enum page as MDX.
 *
 * Page structure:
 * 1. Frontmatter (title + description)
 * 2. Summary paragraphs
 * 3. Signature (bare code block)
 * 4. Description blocks
 * 5. Callouts (deprecated, warnings, notes)
 * 6. See also
 * 7. --- (separator)
 * 8. ## Values (adaptive: table or expanded H3 mode)
 */

import type { CppEnumIr, CppEnumValueIr } from "../../../src/types/CppLibraryDocsIr.js";
import type { CompoundMeta } from "../context.js";
import {
    renderDescriptionBlocks,
    renderDescriptionBlocksDeduped,
    renderSeeAlso,
    renderSegmentsPlainText,
    renderSegmentsTrimmed,
    setCurrentPagePath
} from "./DescriptionRenderer.js";
import { renderBareCodeBlock } from "./SignatureRenderer.js";
import {
    escapeMdxText,
    escapeTableCell,
    renderDocstringCallouts,
    renderDocstringExamples,
    renderFrontmatter,
    trimTrailingBlankLines
} from "./shared.js";

// ---------------------------------------------------------------------------
// Signature
// ---------------------------------------------------------------------------

/**
 * Build the enum declaration signature string.
 *
 * Examples:
 *   enum cub::BlockHistogramAlgorithm
 *   enum class cuda::arch_id : int
 */
function formatEnumSignature(enumIr: CppEnumIr): string {
    const keyword = enumIr.isScoped ? "enum class" : "enum";
    const typeSuffix = enumIr.underlyingType ? ` : ${enumIr.underlyingType}` : "";
    return `${keyword} ${enumIr.path}${typeSuffix}`;
}

// ---------------------------------------------------------------------------
// Values: adaptive rendering
// ---------------------------------------------------------------------------

/**
 * Check whether any enumerator has rich description blocks
 * (as opposed to summary-only or no docs).
 */
function hasRichValueDocs(values: CppEnumValueIr[]): boolean {
    return values.some((v) => v.docstring?.description !== undefined && v.docstring.description.length > 0);
}

/**
 * Render the values section in table mode.
 *
 * Columns are adaptive:
 * - Name is always present
 * - Value column is omitted if no enumerator has an initializer
 * - Description column is omitted if no enumerator has a docstring
 */
function renderValuesTable(values: CppEnumValueIr[]): string {
    const hasAnyInitializer = values.some((v) => v.initializer != null && v.initializer.trim() !== "");
    const hasAnyDescription = values.some((v) => {
        if (!v.docstring) {
            return false;
        }
        const summary = renderSegmentsTrimmed(v.docstring.summary);
        return summary.length > 0;
    });

    // Build header
    const headers: string[] = ["Name"];
    if (hasAnyInitializer) {
        headers.push("Value");
    }
    if (hasAnyDescription) {
        headers.push("Description");
    }

    const lines: string[] = [];
    lines.push(`| ${headers.join(" | ")} |`);
    lines.push(`| ${headers.map(() => "---").join(" | ")} |`);

    for (const v of values) {
        const cells: string[] = [`\`${v.name}\``];
        if (hasAnyInitializer) {
            const init = v.initializer?.trim() ?? "";
            cells.push(init ? escapeTableCell(`\`${init}\``) : "");
        }
        if (hasAnyDescription) {
            const desc = v.docstring ? renderSegmentsTrimmed(v.docstring.summary) : "";
            cells.push(escapeTableCell(desc));
        }
        lines.push(`| ${cells.join(" | ")} |`);
    }

    return lines.join("\n");
}

/**
 * Render the values section in expanded H3 mode.
 * Each enumerator gets its own H3 heading with full description rendering.
 */
function renderValuesExpanded(values: CppEnumValueIr[]): string {
    const sections: string[] = [];

    for (const v of values) {
        sections.push(`### ${escapeMdxText(v.name)}`);
        sections.push("");

        // Summary
        if (v.docstring?.summary) {
            const summary = renderSegmentsTrimmed(v.docstring.summary);
            if (summary) {
                sections.push(summary);
                sections.push("");
            }
        }

        // Description blocks
        if (v.docstring?.description && v.docstring.description.length > 0) {
            const desc = renderDescriptionBlocks(v.docstring.description);
            if (desc) {
                sections.push(desc);
                sections.push("");
            }
        }
    }

    trimTrailingBlankLines(sections);
    return sections.join("\n");
}

// ---------------------------------------------------------------------------
// Main enum page renderer
// ---------------------------------------------------------------------------

/**
 * Render a full enum page as MDX.
 */
export function renderEnumPage(enumIr: CppEnumIr, meta: CompoundMeta): string {
    setCurrentPagePath(enumIr.path);

    try {
        const sections: string[] = [];
        const docstring = enumIr.docstring;

        // Frontmatter
        const description = meta.description ?? (docstring ? renderSegmentsPlainText(docstring.summary) : "");
        sections.push(...renderFrontmatter(enumIr.path, description));

        // Summary
        if (docstring?.summary && docstring.summary.length > 0) {
            const summary = renderSegmentsTrimmed(docstring.summary);
            if (summary) {
                sections.push("");
                sections.push(summary);
            }
        }

        // Signature
        sections.push("");
        sections.push(renderBareCodeBlock(formatEnumSignature(enumIr)));

        // Description blocks
        if (docstring?.description && docstring.description.length > 0) {
            const desc = renderDescriptionBlocksDeduped(docstring.description, docstring.summary);
            if (desc) {
                sections.push("");
                sections.push(desc);
            }
        }

        // Callouts
        renderDocstringCallouts(docstring, sections, renderSegmentsTrimmed);

        // Examples
        renderDocstringExamples(docstring, sections, renderBareCodeBlock);

        // See also
        if (docstring?.seeAlso && docstring.seeAlso.length > 0) {
            const seeAlsoBlock = renderSeeAlso(docstring.seeAlso);
            if (seeAlsoBlock) {
                sections.push("");
                sections.push(seeAlsoBlock);
            }
        }

        // Values section
        if (enumIr.values.length > 0) {
            sections.push("");
            sections.push("---");
            sections.push("");
            sections.push("## Values");
            sections.push("");

            if (hasRichValueDocs(enumIr.values)) {
                sections.push(renderValuesExpanded(enumIr.values));
            } else {
                sections.push(renderValuesTable(enumIr.values));
            }
        }

        trimTrailingBlankLines(sections);
        return sections.join("\n") + "\n";
    } finally {
        setCurrentPagePath(undefined);
    }
}
