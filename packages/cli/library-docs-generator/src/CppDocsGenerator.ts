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

import { CliError } from "@fern-api/task-context";
import type { CompoundMeta } from "../cpp/src/context.js";
import {
    clearEntityRegistry,
    getShortName,
    OPERATOR_SYMBOL_MAP,
    setCurrentPageSlugPath,
    setEntityRegistry,
    stripTemplateArgs
} from "../cpp/src/context.js";
import type { CppCompoundIr } from "../cpp/src/renderers/CompoundPageRenderer.js";
import { renderCompoundPage } from "../cpp/src/renderers/CompoundPageRenderer.js";
import { renderSegmentsPlainText } from "../cpp/src/renderers/DescriptionRenderer.js";
import type {
    CategoryDefinition,
    CategoryWithEntries,
    NamespaceListEntry
} from "../cpp/src/renderers/IndexPageRenderer.js";
import {
    ENTITY_CATEGORIES,
    namespaceHasEntities,
    renderCategoryIndexPage,
    renderNamespaceIndexPage,
    renderNamespacesIndexPage
} from "../cpp/src/renderers/IndexPageRenderer.js";
import { groupFunctionsByName, methodAnchorId } from "../cpp/src/renderers/MethodRenderer.js";
import type { CppClassIr, CppDocstringIr, CppLibraryDocsIr, CppNamespaceIr } from "./types/CppLibraryDocsIr.js";
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
    const rootNsName = slug.includes("/") ? slug.split("/").pop() : slug;
    const repo = ir.metadata.packageName;

    // Stage 1: Collect all compounds from namespace tree
    const collected = collectCompounds(ir.rootNamespace, rootPrefix);

    // Stage 2: Compute page keys (resolve collisions for template specializations)
    const pageEntries = computePageKeys(collected, rootNsName);

    // Build entity registry for cross-reference link resolution
    const registry = buildEntityRegistry(pageEntries);
    setEntityRegistry(registry);
    try {
        // Stage 3: Render & write sequentially (global state requires sequential processing)
        const writer = new MdxFileWriter(outputDir);
        for (const entry of pageEntries) {
            const slugPath = pageKeyToSlugPath(entry.pageKey);
            setCurrentPageSlugPath(slugPath);
            const meta = deriveCompoundMeta(entry.collected, repo);
            const content = renderCompoundPage(entry.collected.compound, meta);
            writer.writePage(entry.pageKey, content);
        }

        // Stage 4: Generate index pages for namespaces
        const slugBaseName = slug.includes("/") ? (slug.split("/").pop() ?? slug) : slug;
        const libraryNs = ir.rootNamespace.namespaces.find((child) => child.name === slugBaseName);
        if (libraryNs) {
            const title = LIBRARY_TITLES[libraryNs.name] ?? `${libraryNs.name} API Reference`;
            const outputFolderSlug = slugifySegment(outputDir.split("/").pop() || slug);
            generateIndexPages(libraryNs, title, writer, rootNsName, outputFolderSlug);
        }

        return writer.result();
    } finally {
        clearEntityRegistry();
        setCurrentPageSlugPath(undefined);
    }
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
            throw new CliError({
                message: `Unknown compound kind: ${JSON.stringify(_exhaustive)}`,
                code: CliError.Code.InternalError
            });
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
// Entity registry construction (maps qualified C++ names to URL paths)
// ---------------------------------------------------------------------------

/**
 * Slugify a single path segment using Fern's `nameToSlug()` rules:
 * lowercase, spaces to hyphens, strip everything except a-z 0-9 and hyphens.
 */
function slugifySegment(seg: string): string {
    return seg
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");
}

/**
 * Convert a page key (filesystem path with .mdx extension) to a URL slug path.
 *
 * Mirrors Fern's `nameToSlug()` behavior per-segment:
 * - Remove `.mdx` extension
 * - Lowercase each segment
 * - Replace spaces with hyphens
 * - Remove all characters except a-z, 0-9, and hyphens
 */
function pageKeyToSlugPath(pageKey: string): string {
    return pageKey
        .replace(/\.mdx$/, "")
        .split("/")
        .map(slugifySegment)
        .filter((seg) => seg.length > 0)
        .join("/");
}

/**
 * Build the entity registry from all page entries.
 *
 * Maps stripped qualified C++ names to their raw slugified page keys
 * (no slug prefix, no leading slash) so that cross-reference links
 * can be resolved as relative paths during rendering.
 */
function buildEntityRegistry(entries: PageEntry[]): Map<string, string> {
    const registry = new Map<string, string>();

    for (const entry of entries) {
        const slugPath = pageKeyToSlugPath(entry.pageKey);
        const qualifiedName = stripTemplateArgs(entry.collected.path);
        const fullPath = entry.collected.path;

        // Register stripped name. Base templates (where fullPath === qualifiedName)
        // always win the stripped-name slot; specializations only claim it if unclaimed.
        const isBaseTemplate = fullPath === qualifiedName;
        if (isBaseTemplate || !registry.has(qualifiedName)) {
            registry.set(qualifiedName, slugPath);
        }

        // Also register the full path (with template args) for specializations
        if (fullPath !== qualifiedName && !registry.has(fullPath)) {
            registry.set(fullPath, slugPath);
        }

        // For class compounds, also register members as anchors
        if (entry.collected.compound.kind === "class") {
            registerClassMembersInRegistry(entry.collected.compound.data, slugPath, registry);
        }
    }

    return registry;
}

/**
 * Register class members (inner classes, methods, static methods) as
 * anchor links on the parent class page.
 */
function registerClassMembersInRegistry(cls: CppClassIr, parentUrl: string, registry: Map<string, string>): void {
    // Inner classes
    for (const inner of cls.innerClasses) {
        const innerQName = stripTemplateArgs(inner.path);
        if (!registry.has(innerQName)) {
            const anchor = inner.name.toLowerCase().replace(/[^a-z0-9-]/g, "");
            registry.set(innerQName, `${parentUrl}#${anchor}`);
        }
    }

    // Methods (use methodAnchorId for consistency with heading anchors)
    for (const method of cls.methods) {
        const methodQName = stripTemplateArgs(method.path);
        if (!registry.has(methodQName)) {
            const anchor = methodAnchorId(method.name);
            registry.set(methodQName, `${parentUrl}#${anchor}`);
        }
    }

    // Static methods
    for (const method of cls.staticMethods) {
        const methodQName = stripTemplateArgs(method.path);
        if (!registry.has(methodQName)) {
            const anchor = methodAnchorId(method.name);
            registry.set(methodQName, `${parentUrl}#${anchor}`);
        }
    }
}

// ---------------------------------------------------------------------------
// Page key computation (collision resolution for template specializations)
// ---------------------------------------------------------------------------

interface PageEntry {
    pageKey: string;
    collected: CollectedCompound;
}

function computePageKeys(compounds: CollectedCompound[], rootNsName: string | undefined): PageEntry[] {
    // Group by directory + category + base filename to detect collisions
    const groups = new Map<string, CollectedCompound[]>();
    for (const c of compounds) {
        const stripped = stripTemplateArgs(c.path);
        const allNsParts = stripped.split("::").slice(0, -1);
        const nsParts = rootNsName != null && allNsParts[0] === rootNsName ? allNsParts.slice(1) : allNsParts;
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
                pageKey: `${groupKey}.mdx`,
                collected: single
            });
        } else {
            // Collision: append sanitized template suffix to disambiguate
            for (const c of group) {
                const suffix = sanitizeTemplateSuffix(c.path);
                const pageKey = suffix ? `${groupKey}_${suffix}.mdx` : `${groupKey}.mdx`;
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
function generateIndexPages(
    ns: CppNamespaceIr,
    title: string,
    writer: MdxFileWriter,
    rootNsName: string | undefined,
    outputFolderSlug: string
): void {
    if (!namespaceHasEntities(ns)) {
        return;
    }

    const allNsParts = ns.path.split("::");
    const nsParts = rootNsName != null && allNsParts[0] === rootNsName ? allNsParts.slice(1) : allNsParts;
    const nsFilesystem = namespacePathToFilesystem(nsParts);
    const nsDir = nsFilesystem ? nsFilesystem : "";

    // Identify which categories have entities (without resolving links yet)
    const nonEmptyCategories: CategoryDefinition[] = [];
    for (const category of ENTITY_CATEGORIES) {
        if (category.collectEntries(ns).length > 0) {
            nonEmptyCategories.push(category);
        }
    }

    // Pre-compute child namespaces with entities
    const childrenWithEntities = ns.namespaces
        .filter((child) => namespaceHasEntities(child))
        .sort((a, b) => a.path.localeCompare(b.path));

    // 1. Namespace index page (uses only category names and static links, no entity link resolution)
    const nsIndexPageKey = nsDir ? `${nsDir}/index.mdx` : "index.mdx";
    setCurrentPageSlugPath(pageKeyToSlugPath(nsIndexPageKey));
    // Build CategoryWithEntries for the namespace index (it only uses category.heading, not linkPaths)
    const categoriesForNsIndex: CategoryWithEntries[] = nonEmptyCategories.map((cat) => ({
        category: cat,
        entries: cat.collectEntries(ns)
    }));
    const nsLastSegment = nsDir ? slugifySegment(nsDir.split("/").pop() || ns.name) : outputFolderSlug;
    const indexContent = renderNamespaceIndexPage(
        title,
        categoriesForNsIndex,
        childrenWithEntities.length > 0,
        nsLastSegment
    );
    writer.writePage(nsIndexPageKey, indexContent);

    // 2. Category index pages — set currentPageSlugPath BEFORE collecting entries
    //    so that buildLinkPath() computes relative paths from the correct page
    for (const category of nonEmptyCategories) {
        const catPageKey = nsDir ? `${nsDir}/${category.folderName}/index.mdx` : `${category.folderName}/index.mdx`;
        setCurrentPageSlugPath(pageKeyToSlugPath(catPageKey));
        const entries = category.collectEntries(ns);
        const categoryWithEntries: CategoryWithEntries = { category, entries };
        const categoryContent = renderCategoryIndexPage(ns.path, categoryWithEntries, title);
        writer.writePage(catPageKey, categoryContent);
    }

    // 3. namespaces/index.mdx if child namespaces with entities exist
    if (childrenWithEntities.length > 0) {
        const nsListPageKey = nsDir ? `${nsDir}/namespaces/index.mdx` : "namespaces/index.mdx";
        setCurrentPageSlugPath(pageKeyToSlugPath(nsListPageKey));
        const childEntries: NamespaceListEntry[] = childrenWithEntities.map((child) => {
            const childAllNsParts = child.path.split("::");
            const childNsParts =
                rootNsName != null && childAllNsParts[0] === rootNsName ? childAllNsParts.slice(1) : childAllNsParts;
            const childNsDir = namespacePathToFilesystem(childNsParts);
            // Relative from parent: strip parentNsDir prefix, then slugify each segment
            const rawLinkPath = nsDir === "" ? childNsDir : childNsDir.substring(nsDir.length + 1);
            const linkPath = rawLinkPath
                .split("/")
                .map(slugifySegment)
                .filter((seg) => seg.length > 0)
                .join("/");
            return { displayName: child.path, linkPath };
        });
        const namespacesContent = renderNamespacesIndexPage(ns.path, childEntries, title);
        writer.writePage(nsListPageKey, namespacesContent);
    }

    // 4. Recurse into child namespaces
    for (const child of ns.namespaces) {
        generateIndexPages(child, `Namespace ${child.path}`, writer, rootNsName, outputFolderSlug);
    }
}
