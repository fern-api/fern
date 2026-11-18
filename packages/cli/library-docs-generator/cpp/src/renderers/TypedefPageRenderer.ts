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
import { getShortName, getTypedefSyntax } from "../context.js";
import {
    renderDescriptionBlocksDeduped,
    renderSeeAlso,
    renderSegmentsPlainText,
    renderSegmentsTrimmed,
    setCurrentPagePath
} from "./DescriptionRenderer.js";
import {
    isSfinaeParam,
    parseFunctionPointerType,
    renderClassTemplateParams,
    renderTypedefParams
} from "./ParamRenderer.js";
import {
    buildTypeInfoLinks,
    normalizeAngleBracketSpacing,
    renderBareCodeBlock,
    renderLinkedCodeBlock
} from "./SignatureRenderer.js";
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

    const shortName = getShortName(typedef.path);
    const underlyingType = typedef.typeInfo?.display
        ? normalizeAngleBracketSpacing(typedef.typeInfo.display)
        : "/* unspecified */";
    // Parsers that record the declared syntax win; older IR falls back to the library-wide guess
    const isCTypedef = typedef.isUsingAlias != null ? !typedef.isUsingAlias : getTypedefSyntax() === "c";
    if (isCTypedef && renderableParams.length === 0 && hasCSpelling(underlyingType)) {
        parts.push(formatCTypedef(shortName, underlyingType));
    } else {
        parts.push(`using ${shortName} = ${underlyingType};`);
    }

    return parts.join("\n");
}

/**
 * Plain-C declaration syntax:
 *   typedef void *cuOptOptimizationProblem;
 *   typedef void (*cuOptCallback)(const float *solution, void *user_data);
 */
/**
 * Whether `formatCTypedef` can spell the type: not a member pointer (`int Widget::*`,
 * `void (Widget::*)(int)`; a `::*` inside a parameter list does not count), and any
 * function type must be a plain function pointer (`noexcept` and friends keep `using`).
 */
function hasCSpelling(type: string): boolean {
    if (/^[^()]*::\*/.test(type) || /^[^()]*\(\s*[\w:<>, ]+::\*\s*\)/.test(type)) {
        return false;
    }
    // Other parentheses must belong to a call-like operator (`__typeof__(sizeof(0))`); a bare `(`
    // starts a declarator (`void (int)`, `int (*)[4]`) whose name would have to go inside it
    return parseFunctionPointerType(type) != null || !/(^|[^\w\s])\s*\(|\s\(/.test(type);
}

function formatCTypedef(name: string, underlyingType: string): string {
    const fnPtr = parseFunctionPointerType(underlyingType);
    if (fnPtr) {
        return `typedef ${fnPtr.returnType} (*${name})(${fnPtr.params.join(", ")});`;
    }
    // `int[4]` is declared `typedef int name[4];`
    const array = /^(.*?)\s*((?:\[[^\]]*\])+)$/.exec(underlyingType);
    if (array?.[1] && array[2]) {
        return `typedef ${array[1]} ${name}${array[2]};`;
    }
    const separator = /[*&]$/.test(underlyingType) ? "" : " ";
    return `typedef ${underlyingType}${separator}${name};`;
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
        const links = buildTypeInfoLinks(typedef.typeInfo, [typedef.name, getShortName(typedef.path)]);
        sections.push(renderLinkedCodeBlock(signature, links));

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

        // Function-pointer parameters
        const params = renderTypedefParams(typedef, docstring);
        if (params) {
            sections.push("");
            sections.push(params);
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
