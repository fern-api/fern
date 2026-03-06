/**
 * Renders a standalone C++ typedef/using page as MDX.
 *
 * Page structure:
 * 1. Frontmatter (title + description)
 * 2. Summary paragraphs
 * 3. Signature (CodeBlock with using declaration)
 * 4. Description blocks
 * 5. Callouts (deprecated, warnings, notes)
 * 6. Template parameters (if any)
 * 7. See also
 */

import type { CppTypedefIr } from "../../../src/types/CppLibraryDocsIr.js";
import type { CompoundMeta } from "../context.js";
import { getShortName } from "../context.js";
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
 * Build the typedef signature string.
 *
 * Examples:
 *   using universal_vector = thrust::system::__THRUST_DEVICE_SYSTEM_NAMESPACE::universal_vector<T, Allocator>;
 *
 *   template <typename T, typename Allocator = universal_allocator<T>>
 *   using universal_vector = thrust::system::__THRUST_DEVICE_SYSTEM_NAMESPACE::universal_vector<T, Allocator>;
 */
function formatTypedefSignature(typedef: CppTypedefIr): string {
    const parts: string[] = [];

    // Template prefix (filter SFINAE params)
    const renderableParams = typedef.templateParams.filter((tp) => !isSfinaeParam(tp));
    if (renderableParams.length > 0) {
        const params = renderableParams.map(formatTemplateParam);
        const joined = params.join(", ");
        if (joined.length > 80) {
            parts.push(`template <${params.join(",\n          ")}>`);
        } else {
            parts.push(`template <${joined}>`);
        }
    }

    // Using declaration
    const shortName = getShortName(typedef.path);
    const underlyingType = typedef.typeInfo?.display
        ? normalizeAngleBracketSpacing(typedef.typeInfo.display)
        : "/* unspecified */";
    parts.push(`using ${shortName} = ${underlyingType};`);

    return parts.join("\n");
}

// ---------------------------------------------------------------------------
// Main typedef page renderer
// ---------------------------------------------------------------------------

/**
 * Render a full typedef page as MDX.
 */
export function renderTypedefPage(typedef: CppTypedefIr, meta: CompoundMeta): string {
    setCurrentPagePath(typedef.path);

    try {
        const sections: string[] = [];
        const docstring = typedef.docstring;

        // Frontmatter
        const description = meta.description ?? (docstring ? renderSegmentsPlainText(docstring.summary) : "");
        sections.push(...renderFrontmatter(typedef.path, description));

        // Summary
        if (docstring?.summary && docstring.summary.length > 0) {
            const summary = renderSegmentsTrimmed(docstring.summary);
            if (summary) {
                sections.push("");
                sections.push(summary);
            }
        }

        // Signature
        const signature = formatTypedefSignature(typedef);
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
        if (typedef.templateParams.length > 0) {
            const tplParams = renderClassTemplateParams(typedef.templateParams, docstring);
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
