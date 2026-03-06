/**
 * Renders a standalone C++ variable/constant page as MDX.
 *
 * Page structure:
 * 1. Frontmatter (title + description)
 * 2. Summary paragraphs
 * 3. Signature (CodeBlock with variable declaration)
 * 4. Description blocks
 * 5. Callouts (deprecated, warnings, notes)
 * 6. Template parameters (if any)
 * 7. See also
 */

import type { CppVariableIr } from "../../../src/types/CppLibraryDocsIr.js";
import type { CompoundMeta } from "../context.js";
import {
    renderDescriptionBlocksDeduped,
    renderSeeAlso,
    renderSegmentsPlainText,
    renderSegmentsTrimmed,
    setCurrentPagePath
} from "./DescriptionRenderer.js";
import { isSfinaeParam, renderClassTemplateParams } from "./ParamRenderer.js";
import { normalizeAngleBracketSpacing, renderBareCodeBlock } from "./SignatureRenderer.js";
import {
    formatTemplateParam,
    renderDocstringCallouts,
    renderDocstringExamples,
    renderFrontmatter,
    trimTrailingBlankLines
} from "./shared.js";

// ---------------------------------------------------------------------------
// Signature
// ---------------------------------------------------------------------------

/**
 * Build the variable declaration signature string.
 *
 * Examples:
 *   constexpr auto cuda::allocation_alignment = allocation_alignment_t{}
 *   constexpr __all_devices cuda::devices{}
 *   static constexpr int cuda::some_value = 42
 */
function formatVariableSignature(variable: CppVariableIr): string {
    const parts: string[] = [];

    // Template prefix (filter SFINAE params)
    const renderableParams = variable.templateParams.filter((tp) => !isSfinaeParam(tp));
    if (renderableParams.length > 0) {
        const params = renderableParams.map(formatTemplateParam);
        const joined = params.join(", ");
        if (joined.length > 80) {
            parts.push(`template <${params.join(",\n          ")}>`);
        } else {
            parts.push(`template <${joined}>`);
        }
    }

    // Build qualifiers
    const qualifiers: string[] = [];
    if (variable.isStatic) {
        qualifiers.push("static");
    }
    if (variable.isConstexpr) {
        qualifiers.push("constexpr");
    }
    if (variable.isMutable) {
        qualifiers.push("mutable");
    }

    // Type
    const typeDisplay = variable.typeInfo?.display ? normalizeAngleBracketSpacing(variable.typeInfo.display) : "auto";

    // Build declaration line: qualifiers + type + qualified name
    const prefix = qualifiers.length > 0 ? qualifiers.join(" ") + " " : "";
    let declaration = `${prefix}${typeDisplay} ${variable.path}`;

    // Initializer
    const initializer = formatInitializer(variable.initializer);
    if (initializer) {
        declaration += initializer;
    }

    parts.push(declaration);
    return parts.join("\n");
}

/**
 * Format a variable initializer for display.
 *
 * Handles:
 * - `= value` (already has `=` prefix) -> use as-is (trimmed)
 * - `{}` or `{value}` (bare braces) -> prepend nothing, use as-is
 * - `= ` (equals sign with only whitespace) -> skip entirely
 * - undefined/null -> skip
 */
function formatInitializer(initializer: string | undefined): string {
    if (initializer == null) {
        return "";
    }

    // If the initializer is just `= ` (equals with trailing whitespace), skip it
    if (/^=\s*$/.test(initializer)) {
        return "";
    }

    // If it starts with `=`, use as-is (already has the prefix)
    if (initializer.startsWith("=")) {
        return ` ${initializer.trimEnd()}`;
    }

    // Bare initializer like `{}` or `{value}` -- prepend ` = `
    const trimmed = initializer.trim();
    if (trimmed) {
        return ` = ${trimmed}`;
    }

    return "";
}

// ---------------------------------------------------------------------------
// Main variable page renderer
// ---------------------------------------------------------------------------

/**
 * Render a full variable page as MDX.
 */
export function renderVariablePage(variable: CppVariableIr, meta: CompoundMeta): string {
    setCurrentPagePath(variable.path);

    try {
        const sections: string[] = [];
        const docstring = variable.docstring;

        // Frontmatter
        const description = meta.description ?? (docstring ? renderSegmentsPlainText(docstring.summary) : "");
        sections.push(...renderFrontmatter(variable.path, description));

        // Summary
        if (docstring?.summary && docstring.summary.length > 0) {
            const summary = renderSegmentsTrimmed(docstring.summary);
            if (summary) {
                sections.push("");
                sections.push(summary);
            }
        }

        // Signature
        const signature = formatVariableSignature(variable);
        sections.push("");
        sections.push(renderBareCodeBlock(signature));

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

        // Template parameters
        if (variable.templateParams.length > 0) {
            const tplParams = renderClassTemplateParams(variable.templateParams, docstring);
            if (tplParams) {
                sections.push("");
                sections.push(tplParams);
            }
        }

        // See also
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
