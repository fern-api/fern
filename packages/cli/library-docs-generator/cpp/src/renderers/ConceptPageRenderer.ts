/**
 * Renders a C++ concept page as MDX.
 *
 * Page structure:
 * 1. Frontmatter (title + description)
 * 2. Badge: <Badge intent="info">C++20 concept</Badge>
 * 3. Summary paragraphs
 * 4. Concept definition signature (CodeBlock)
 * 5. Template parameters (bold heading + ParamFields)
 * 6. ---
 * 7. ## Description (detailed explanation from docstring description blocks)
 * 8. ---
 * 9. ## Related concepts (table from seeAlso)
 */

import type { CppConceptIr, CppDocSegment } from "../../../src/types/CppLibraryDocsIr.js";
import type { CompoundMeta, RenderContext } from "../context.js";
import { buildLinkPath, getShortName } from "../context.js";
import {
    decodeDoxygenRefid,
    renderDescriptionBlocksDeduped,
    renderSegmentsPlainText,
    renderSegmentsTrimmed,
    setCurrentPagePath
} from "./DescriptionRenderer.js";
import { renderClassTemplateParams } from "./ParamRenderer.js";
import { renderCodeBlock } from "./SignatureRenderer.js";
import { formatTemplateParam, renderFrontmatter } from "./shared.js";
import { renderRelatedConceptsTable } from "./TableRenderer.js";

// ---------------------------------------------------------------------------
// Concept signature
// ---------------------------------------------------------------------------

/**
 * Build the concept definition signature string.
 *
 * Pattern:
 * template <class _Resource, class... _Properties>
 * concept concept_name = /* see description * /;
 */
function formatConceptSignature(concept: CppConceptIr): string {
    const parts: string[] = [];

    // Template prefix
    if (concept.templateParams.length > 0) {
        const params = concept.templateParams.map(formatTemplateParam);
        parts.push(`template <${params.join(", ")}>`);
    }

    // Concept definition
    const constraintDisplay = concept.constraintExpression ? concept.constraintExpression : "/* see description */";
    parts.push(`concept ${concept.name} = ${constraintDisplay};`);

    return parts.join("\n");
}

/**
 * Extract links from a concept for the CodeBlock links prop.
 *
 * Sources (in priority order):
 * 1. seeAlso entries (related concepts)
 * 2. Summary segments (codeRef/ref with resolvable refids)
 * 3. Constraint expression text (extract concept/type names)
 */
function extractConceptLinks(concept: CppConceptIr): Record<string, string> {
    const links: Record<string, string> = {};

    // Extract links from seeAlso (related concepts typically referenced in the constraint)
    if (concept.docstring?.seeAlso) {
        for (const sa of concept.docstring.seeAlso) {
            for (const seg of sa) {
                if (seg.type === "link") {
                    // Link segments have text and url
                    const name = seg.text.split("::").pop() ?? seg.text;
                    links[name] = seg.url;
                } else if (seg.type === "ref" || seg.type === "codeRef") {
                    // Ref segments reference other entities
                    const refText = seg.type === "ref" ? seg.text : seg.code;
                    const shortName = refText.split("::").pop() ?? refText;
                    const refLinkPath = buildLinkPath(refText);
                    if (refLinkPath) {
                        links[shortName] = refLinkPath;
                    }
                }
            }
        }
    }

    // Extract links from summary segments (codeRef/ref with resolvable refids)
    if (concept.docstring?.summary) {
        extractLinksFromSegments(concept.docstring.summary, links);
    }

    // Extract links from description block segments
    if (concept.docstring?.description) {
        for (const block of concept.docstring.description) {
            if (block.type === "paragraph") {
                extractLinksFromSegments(block.segments, links);
            }
        }
    }

    return links;
}

/**
 * Extract links from an array of doc segments.
 * Resolves codeRef and ref segments with refids using decodeDoxygenRefid.
 *
 * For member refs where the refid decodes to a namespace (not a full member path),
 * the segment's display text (code or text) is appended to form the full qualified name.
 */
function extractLinksFromSegments(segments: CppDocSegment[], links: Record<string, string>): void {
    for (const seg of segments) {
        if (seg.type === "codeRef" && seg.refid) {
            const decodedPath = decodeDoxygenRefid(seg.refid);
            if (decodedPath) {
                // If the decoded path is a namespace and the code text is a member name,
                // combine them. E.g., decoded="cuda::mr" + code="resource" -> "cuda::mr::resource"
                const shortName = getShortName(seg.code);
                let qualifiedName = decodedPath;
                if (!decodedPath.endsWith("::" + shortName) && !decodedPath.endsWith(shortName)) {
                    qualifiedName = decodedPath + "::" + shortName;
                }
                if (!links[shortName]) {
                    const codeRefLinkPath = buildLinkPath(qualifiedName);
                    if (codeRefLinkPath) {
                        links[shortName] = codeRefLinkPath;
                    }
                }
            }
        } else if (seg.type === "ref" && seg.refid) {
            const decodedPath = decodeDoxygenRefid(seg.refid);
            if (decodedPath) {
                const shortName = getShortName(seg.text.trim());
                let qualifiedName = decodedPath;
                if (!decodedPath.endsWith("::" + shortName) && !decodedPath.endsWith(shortName)) {
                    qualifiedName = decodedPath + "::" + shortName;
                }
                if (!links[shortName]) {
                    const refLinkPath = buildLinkPath(qualifiedName);
                    if (refLinkPath) {
                        links[shortName] = refLinkPath;
                    }
                }
            }
        }
    }
}

// ---------------------------------------------------------------------------
// Main concept page renderer
// ---------------------------------------------------------------------------

/**
 * Render a full concept page as MDX.
 */
export function renderConceptPage(concept: CppConceptIr, meta: CompoundMeta): string {
    // Set current page path so self-referential links render as plain code
    setCurrentPagePath(concept.path);

    const ctx: RenderContext = { meta };
    const sections: string[] = [];

    // Frontmatter
    // Description is expected to be provided by the caller (pipeline/Lambda); fallback extracts from docstring summary
    const description =
        meta.description ?? (concept.docstring ? renderSegmentsPlainText(concept.docstring.summary) : "");

    sections.push(...renderFrontmatter(concept.path, description));

    // Badge
    sections.push("");
    sections.push(`<Badge intent="info">C++20 concept</Badge>`);

    // Summary
    if (concept.docstring) {
        if (concept.docstring.summary.length > 0) {
            const summary = renderSegmentsTrimmed(concept.docstring.summary);
            if (summary) {
                sections.push("");
                sections.push(summary);
            }
        }
    }

    // Concept signature CodeBlock
    const signature = formatConceptSignature(concept);
    const links = extractConceptLinks(concept);
    sections.push("");
    sections.push(renderCodeBlock(signature, links));

    // Template parameters
    if (concept.templateParams.length > 0) {
        const tplParams = renderClassTemplateParams(concept.templateParams, concept.docstring);
        if (tplParams) {
            sections.push("");
            sections.push(tplParams);
        }
    }

    // Description section
    if (concept.docstring?.description && concept.docstring.description.length > 0) {
        const desc = renderDescriptionBlocksDeduped(concept.docstring.description, concept.docstring.summary);
        if (desc) {
            sections.push("");
            sections.push("---");
            sections.push("");
            sections.push("## Description");
            sections.push("");
            sections.push(desc);
        }
    }

    // Related concepts table (from seeAlso)
    if (concept.docstring?.seeAlso && concept.docstring.seeAlso.length > 0) {
        const table = renderRelatedConceptsTable(concept.docstring.seeAlso);
        if (table) {
            sections.push("");
            sections.push("---");
            sections.push("");
            sections.push("## Related concepts");
            sections.push("");
            sections.push(table);
        }
    }

    // Clear current page path after rendering
    setCurrentPagePath(undefined);

    return sections.join("\n") + "\n";
}
