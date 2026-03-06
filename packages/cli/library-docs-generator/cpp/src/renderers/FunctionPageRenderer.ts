/**
 * Renders a standalone C++ namespace-level function page as MDX.
 *
 * Page structure:
 * 1. Frontmatter (title + description)
 * 2. For single function: signature, summary, description, params, returns, etc.
 * 3. For multiple overloads: tabbed view with one tab per overload
 *
 * Delegates all heavy lifting to MethodRenderer functions which already
 * support `ownerClass: undefined` for standalone functions.
 */

import type { CppFunctionIr } from "../../../src/types/CppLibraryDocsIr.js";
import type { CompoundMeta, RenderContext } from "../context.js";
import { renderSegmentsPlainText, setCurrentPagePath } from "./DescriptionRenderer.js";
import { renderMethodContent, renderOverloadedMethod } from "./MethodRenderer.js";
import { renderFrontmatter, trimTrailingBlankLines } from "./shared.js";

// ---------------------------------------------------------------------------
// Main function page renderer
// ---------------------------------------------------------------------------

/**
 * Render a full standalone function page as MDX.
 *
 * @param overloads - All overloads of this function (grouped by name)
 * @param meta - Compound metadata for frontmatter and context
 */
export function renderFunctionPage(overloads: CppFunctionIr[], meta: CompoundMeta): string {
    if (overloads.length === 0) {
        return "";
    }

    const representative = overloads[0];
    if (representative == null) {
        return "";
    }

    // Set current page path so self-referential links render as plain code
    setCurrentPagePath(representative.path);

    try {
        const ctx: RenderContext = { meta };
        const sections: string[] = [];

        // Frontmatter
        const description =
            meta.description ??
            (representative.docstring ? renderSegmentsPlainText(representative.docstring.summary) : "");
        sections.push(...renderFrontmatter(representative.path, description));

        // Function content — renderMethodContent/renderOverloadedMethod handle
        // summary, signature, description, params, returns, callouts, examples, etc.
        if (overloads.length === 1) {
            // Single function: render content directly (no heading needed, page title suffices)
            sections.push("");
            sections.push(renderMethodContent(representative, undefined, ctx));
        } else {
            // Multiple overloads: render tabbed view
            sections.push("");
            sections.push(renderOverloadedMethod(overloads, undefined, ctx, { skipHeading: true }));
        }

        trimTrailingBlankLines(sections);

        return sections.join("\n") + "\n";
    } finally {
        // Clear current page path after rendering
        setCurrentPagePath(undefined);
    }
}
