/**
 * Main generator for C++ library documentation.
 *
 * Orchestrates the full pipeline:
 * 1. Collect compounds (classes, concepts, functions, enums, typedefs, variables) from the namespace tree
 * 2. Compute page keys, resolving filename collisions for template specializations
 * 3. Render each compound page and stream to disk via MdxFileWriter
 * 4. Generate hierarchical index pages (namespace → category folders → entity pages)
 *
 * Designed for sequential rendering: global state in the renderers (nameToPathMap,
 * currentPagePath) requires that pages are rendered one at a time.
 */

import type { CompoundMeta } from "../cpp/src/context.js";
import { getShortName, stripTemplateArgs } from "../cpp/src/context.js";
import type { CppCompoundIr } from "../cpp/src/renderers/CompoundPageRenderer.js";
import { renderCompoundPage } from "../cpp/src/renderers/CompoundPageRenderer.js";
import { renderSegmentsPlainText } from "../cpp/src/renderers/DescriptionRenderer.js";
import type { CategoryWithEntries } from "../cpp/src/renderers/IndexPageRenderer.js";
import {
    ENTITY_CATEGORIES,
    namespaceHasEntities,
    renderCategoryIndexPage,
    renderNamespaceIndexPage,
    renderNamespacesIndexPage
} from "../cpp/src/renderers/IndexPageRenderer.js";
import { groupFunctionsByName } from "../cpp/src/renderers/MethodRenderer.js";
import type { CppDocstringIr, CppLibraryDocsIr, CppNamespaceIr } from "./types/CppLibraryDocsIr.js";
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

const OPERATOR_SYMBOL_MAP: Array<[string, string]> = [
    ["operator<<=", "operator_lshift_assign"],
    ["operator>>=", "operator_rshift_assign"],
    ["operator<=>", "operator_spaceship"],
    ["operator<<", "operator_lshift"],
    ["operator>>", "operator_rshift"],
    ["operator->*", "operator_arrow_star"],
    ["operator->", "operator_arrow"],
    ["operator+=", "operator_plus_assign"],
    ["operator-=", "operator_minus_assign"],
    ["operator*=", "operator_mul_assign"],
    ["operator/=", "operator_div_assign"],
    ["operator%=", "operator_mod_assign"],
    ["operator^=", "operator_xor_assign"],
    ["operator&=", "operator_and_assign"],
    ["operator|=", "operator_or_assign"],
    ["operator&&", "operator_logical_and"],
    ["operator||", "operator_logical_or"],
    ["operator++", "operator_inc"],
    ["operator--", "operator_dec"],
    ["operator<=", "operator_le"],
    ["operator>=", "operator_ge"],
    ["operator==", "operator_eq"],
    ["operator!=", "operator_ne"],
    ["operator()", "operator_call"],
    ["operator[]", "operator_subscript"],
    ["operator<", "operator_lt"],
    ["operator>", "operator_gt"],
    ["operator+", "operator_plus"],
    ["operator-", "operator_minus"],
    ["operator*", "operator_mul"],
    ["operator/", "operator_div"],
    ["operator%", "operator_mod"],
    ["operator^", "operator_xor"],
    ["operator&", "operator_and"],
    ["operator|", "operator_or"],
    ["operator~", "operator_bitnot"],
    ["operator!", "operator_not"],
    ["operator=", "operator_assign"],
    ["operator,", "operator_comma"]
];

function sanitizeForFilename(name: string): string {
    for (const [symbol, safeName] of OPERATOR_SYMBOL_MAP) {
        if (name === symbol) {
            return safeName;
        }
    }
    return name.replace(/[^a-zA-Z0-9_-]/g, "_");
}

/** Intermediate collected compound before page-key assignment. */
interface CollectedCompound {
    compound: CppCompoundIr;
    path: string;
    namespacePath: string[];
    docstring: CppDocstringIr | undefined;
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

    // Stage 4: Generate index pages for namespaces
    const slugBaseName = slug.includes("/") ? (slug.split("/").pop() ?? slug) : slug;
    const libraryNs = ir.rootNamespace.namespaces.find((child) => child.name === slugBaseName);
    if (libraryNs) {
        const title = LIBRARY_TITLES[libraryNs.name] ?? `${libraryNs.name} API Reference`;
        generateIndexPages(libraryNs, slug, title, writer);
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

    // Group free functions by name so overloads share a single page
    const functionGroups = groupFunctionsByName(ns.functions);
    for (const [, overloads] of functionGroups) {
        if (overloads.length === 0) {
            continue;
        }
        const representative = overloads[0];
        if (representative == null) {
            continue;
        }
        if (rootPrefix && !representative.path.startsWith(rootPrefix)) {
            continue;
        }
        result.push({
            compound: { kind: "function", data: overloads },
            path: representative.path,
            namespacePath: stripTemplateArgs(representative.path).split("::").slice(0, -1),
            docstring: representative.docstring
        });
    }

    for (const enumIr of ns.enums) {
        if (rootPrefix && !enumIr.path.startsWith(rootPrefix)) {
            continue;
        }
        result.push({
            compound: { kind: "enum", data: enumIr },
            path: enumIr.path,
            namespacePath: stripTemplateArgs(enumIr.path).split("::").slice(0, -1),
            docstring: enumIr.docstring
        });
    }

    for (const typedef of ns.typedefs) {
        if (rootPrefix && !typedef.path.startsWith(rootPrefix)) {
            continue;
        }
        result.push({
            compound: { kind: "typedef", data: typedef },
            path: typedef.path,
            namespacePath: stripTemplateArgs(typedef.path).split("::").slice(0, -1),
            docstring: typedef.docstring
        });
    }

    for (const variable of ns.variables) {
        if (rootPrefix && !variable.path.startsWith(rootPrefix)) {
            continue;
        }
        result.push({
            compound: { kind: "variable", data: variable },
            path: variable.path,
            namespacePath: stripTemplateArgs(variable.path).split("::").slice(0, -1),
            docstring: variable.docstring
        });
    }

    for (const childNs of ns.namespaces) {
        result.push(...collectCompounds(childNs, rootPrefix));
    }

    return result;
}

// ---------------------------------------------------------------------------
// Filesystem path helpers
// ---------------------------------------------------------------------------

/**
 * Map a CollectedCompound to its category folder name.
 *
 * For "class" compounds, inspects the underlying CppClassIr.kind to distinguish
 * "class" -> "classes" vs "struct" -> "structs". Other kinds map directly.
 */
function categoryFolderForCompound(collected: CollectedCompound): string {
    switch (collected.compound.kind) {
        case "class": {
            const classKind = collected.compound.data.kind;
            return classKind === "struct" ? "structs" : "classes";
        }
        case "concept":
            return "concepts";
        case "function":
            return "functions";
        case "enum":
            return "enums";
        case "typedef":
            return "typedefs";
        case "variable":
            return "variables";
        default: {
            const _exhaustive: never = collected.compound;
            throw new Error(`Unknown compound kind: ${JSON.stringify(_exhaustive)}`);
        }
    }
}

/**
 * Convert namespace path parts to a filesystem path, inserting "namespaces/"
 * between levels.
 *
 * Examples:
 *   ["thrust"]                   -> "thrust"
 *   ["thrust", "mr"]            -> "thrust/namespaces/mr"
 *   ["thrust", "system", "cuda"] -> "thrust/namespaces/system/namespaces/cuda"
 */
function namespacePathToFilesystem(nsParts: string[]): string {
    const [first, ...rest] = nsParts;
    if (first === undefined) {
        return "";
    }
    const segments: string[] = [first];
    for (const part of rest) {
        segments.push("namespaces", part);
    }
    return segments.join("/");
}

// ---------------------------------------------------------------------------
// Page key computation (collision resolution for template specializations)
// ---------------------------------------------------------------------------

interface PageEntry {
    pageKey: string;
    collected: CollectedCompound;
}

function computePageKeys(compounds: CollectedCompound[], slug: string): PageEntry[] {
    // Group by directory + category + base filename to detect collisions
    const groups = new Map<string, CollectedCompound[]>();
    for (const c of compounds) {
        const stripped = stripTemplateArgs(c.path);
        const nsParts = stripped.split("::").slice(0, -1);
        const baseFilename = sanitizeForFilename(stripped.split("::").pop() ?? "");
        const dir = namespacePathToFilesystem(nsParts);
        const category = categoryFolderForCompound(c);
        const groupKey = dir ? `${dir}/${category}/${baseFilename}` : `${category}/${baseFilename}`;
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
            const single = group[0];
            if (single === undefined) {
                continue;
            }
            result.push({
                pageKey: `${slug}/${groupKey}.mdx`,
                collected: single
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
        description = renderSegmentsPlainText(collected.docstring.summary);
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

// ---------------------------------------------------------------------------
// Index page generation (Stage 4)
// ---------------------------------------------------------------------------

const LIBRARY_TITLES: Record<string, string> = {
    cub: "CUB API Reference",
    thrust: "Thrust API Reference",
    cuda: "libcudacxx API Reference"
};

/**
 * Recursively generate index pages for a namespace and all its descendants.
 *
 * For each namespace with entities, writes:
 * - Namespace index page (links to category folders and namespaces/)
 * - Category index pages for each non-empty category
 * - namespaces/index.mdx if child namespaces with entities exist
 */
function generateIndexPages(ns: CppNamespaceIr, slug: string, title: string, writer: MdxFileWriter): void {
    if (!namespaceHasEntities(ns)) {
        return;
    }

    const nsDir = `${slug}/${namespacePathToFilesystem(ns.path.split("::"))}`;

    // Pre-compute non-empty categories (single pass)
    const nonEmptyCategories: CategoryWithEntries[] = [];
    for (const category of ENTITY_CATEGORIES) {
        const entries = category.collectEntries(ns);
        if (entries.length > 0) {
            nonEmptyCategories.push({ category, entries });
        }
    }

    // Pre-compute child namespaces with entities
    const childrenWithEntities = ns.namespaces
        .filter((child) => namespaceHasEntities(child))
        .sort((a, b) => a.path.localeCompare(b.path));

    // 1. Namespace index page
    const indexContent = renderNamespaceIndexPage(title, nonEmptyCategories, childrenWithEntities.length > 0);
    writer.writePage(`${nsDir}/index.mdx`, indexContent);

    // 2. Category index pages for non-empty categories
    for (const categoryWithEntries of nonEmptyCategories) {
        const categoryContent = renderCategoryIndexPage(ns.path, categoryWithEntries, title);
        writer.writePage(`${nsDir}/${categoryWithEntries.category.folderName}/index.mdx`, categoryContent);
    }

    // 3. namespaces/index.mdx if child namespaces with entities exist
    if (childrenWithEntities.length > 0) {
        const namespacesContent = renderNamespacesIndexPage(ns.path, childrenWithEntities, title);
        writer.writePage(`${nsDir}/namespaces/index.mdx`, namespacesContent);
    }

    // 4. Recurse into child namespaces
    for (const child of ns.namespaces) {
        generateIndexPages(child, slug, `Namespace ${child.path}`, writer);
    }
}
