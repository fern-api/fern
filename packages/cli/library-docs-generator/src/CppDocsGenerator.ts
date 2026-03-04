/**
 * Main generator for C++ library documentation.
 *
 * Orchestrates the full pipeline:
 * 1. Collect compounds (classes/concepts) from the recursive namespace tree
 * 2. Compute page keys, resolving filename collisions for template specializations
 * 3. Render each compound page and stream to disk via MdxFileWriter
 *
 * Designed for sequential rendering: global state in the renderers (nameToPathMap,
 * currentPagePath) requires that pages are rendered one at a time.
 */

import type { CompoundMeta } from "../cpp/src/context.js";
import { getShortName, stripTemplateArgs } from "../cpp/src/context.js";
import type { CppCompoundIr } from "../cpp/src/renderers/CompoundPageRenderer.js";
import { renderCompoundPage } from "../cpp/src/renderers/CompoundPageRenderer.js";
import { renderSegmentsTrimmed } from "../cpp/src/renderers/DescriptionRenderer.js";
import type { CppClassIr, CppConceptIr, CppLibraryDocsIr, CppNamespaceIr } from "./types/CppLibraryDocsIr.js";
import { MdxFileWriter } from "./writers/MdxFileWriter.js";

export interface CppGenerateOptions {
    /** Parsed C++ library IR */
    ir: CppLibraryDocsIr;
    /** Directory to write MDX files to */
    outputDir: string;
    /** Base slug prefix for page URLs (e.g., "reference/cub") */
    slug: string;
}

export interface CppGenerateResult {
    /** Absolute paths of all written files */
    writtenFiles: string[];
    /** Total number of MDX pages generated */
    pageCount: number;
}

/** Intermediate collected compound before page-key assignment. */
interface CollectedCompound {
    compound: CppCompoundIr;
    path: string;
    namespacePath: string[];
    docstring: CppClassIr["docstring"] | CppConceptIr["docstring"];
}

/**
 * Generate MDX documentation from a C++ library IR.
 *
 * Writes MDX files to `outputDir` and returns metadata about written files.
 */
export function generateCpp(options: CppGenerateOptions): CppGenerateResult {
    const { ir, outputDir, slug } = options;

    // Derive root prefix from the IR's root namespace path (e.g., "cub" -> "cub::")
    const rootPrefix = ir.rootNamespace.path ? `${ir.rootNamespace.path}::` : "";
    const repo = ir.metadata.packageName;

    // Stage 1: Collect all compounds from namespace tree
    const collected = collectCompounds(ir.rootNamespace, rootPrefix);

    // Stage 2: Compute page keys (resolve collisions for template specializations)
    const pageEntries = computePageKeys(collected, slug);

    // Stage 3: Render & write sequentially (global state requires sequential processing)
    const writer = new MdxFileWriter(outputDir);
    for (const entry of pageEntries) {
        const meta = deriveCompoundMeta(entry.collected, repo);
        const content = renderCompoundPage(entry.collected.compound, meta);
        writer.writePage(entry.pageKey, content);
    }

    return writer.result();
}

// ---------------------------------------------------------------------------
// Compound collection (recursive namespace walk)
// ---------------------------------------------------------------------------

function collectCompounds(ns: CppNamespaceIr, rootPrefix: string): CollectedCompound[] {
    const result: CollectedCompound[] = [];

    for (const cls of ns.classes) {
        if (rootPrefix && !cls.path.startsWith(rootPrefix)) {
            continue;
        }
        result.push({
            compound: { kind: "class", data: cls },
            path: cls.path,
            namespacePath: stripTemplateArgs(cls.path).split("::").slice(0, -1),
            docstring: cls.docstring
        });
    }

    for (const concept of ns.concepts) {
        if (rootPrefix && !concept.path.startsWith(rootPrefix)) {
            continue;
        }
        result.push({
            compound: { kind: "concept", data: concept },
            path: concept.path,
            namespacePath: stripTemplateArgs(concept.path).split("::").slice(0, -1),
            docstring: concept.docstring
        });
    }

    for (const childNs of ns.namespaces) {
        result.push(...collectCompounds(childNs, rootPrefix));
    }

    return result;
}

// ---------------------------------------------------------------------------
// Page key computation (collision resolution for template specializations)
// ---------------------------------------------------------------------------

interface PageEntry {
    pageKey: string;
    collected: CollectedCompound;
}

function computePageKeys(compounds: CollectedCompound[], slug: string): PageEntry[] {
    // Group by directory + base filename to detect collisions
    const groups = new Map<string, CollectedCompound[]>();
    for (const c of compounds) {
        const stripped = stripTemplateArgs(c.path);
        const parts = stripped.split("::");
        const baseFilename = parts.at(-1) ?? "";
        const dir = parts.slice(0, -1).join("/");
        const groupKey = dir ? `${dir}/${baseFilename}` : baseFilename;
        const existing = groups.get(groupKey);
        if (existing) {
            existing.push(c);
        } else {
            groups.set(groupKey, [c]);
        }
    }

    const result: PageEntry[] = [];
    for (const [groupKey, group] of groups) {
        if (group.length === 1) {
            result.push({
                pageKey: `${slug}/${groupKey}.mdx`,
                collected: group[0] as CollectedCompound
            });
        } else {
            // Collision: append sanitized template suffix to disambiguate
            for (const c of group) {
                const suffix = sanitizeTemplateSuffix(c.path);
                const pageKey = suffix ? `${slug}/${groupKey}_${suffix}.mdx` : `${slug}/${groupKey}.mdx`;
                result.push({ pageKey, collected: c });
            }
        }
    }

    return result;
}

/**
 * Extract and sanitize the template portion of a C++ name for use in filenames.
 * e.g., "thrust::pair<T, U>" -> "T_U"
 * e.g., "cuda::std::atomic<T*>" -> "Tptr"
 */
function sanitizeTemplateSuffix(name: string): string {
    const openIdx = name.indexOf("<");
    if (openIdx === -1) {
        return "";
    }
    const templatePart = name.substring(openIdx);
    return templatePart
        .replace(/[<>]/g, "")
        .replace(/\*/g, "ptr")
        .replace(/[\s,]+/g, "_")
        .replace(/[^a-zA-Z0-9_]/g, "")
        .replace(/_+/g, "_")
        .replace(/^_|_$/g, "");
}

// ---------------------------------------------------------------------------
// Meta derivation
// ---------------------------------------------------------------------------

function deriveCompoundMeta(collected: CollectedCompound, repo: string): CompoundMeta {
    const stripped = stripTemplateArgs(collected.path);
    const compoundName = getShortName(stripped);

    let description: string | undefined;
    if (collected.docstring?.summary && collected.docstring.summary.length > 0) {
        description = renderSegmentsTrimmed(collected.docstring.summary);
    }

    return {
        compoundName,
        qualifiedName: collected.path,
        repo,
        compoundKind: collected.compound.kind,
        namespacePath: collected.namespacePath,
        description
    };
}
