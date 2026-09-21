/**
 * Main generator for C++ library documentation.
 *
 * Orchestrates the full pipeline:
 * 1. Collect compounds (classes, concepts, functions, enums, typedefs, variables, macros) from the namespace tree
 * 2. Compute page keys, resolving filename collisions for template specializations
 * 3. Render each compound page and stream to disk via MdxFileWriter
 * 4. Generate hierarchical index pages (namespace → category folders → entity pages)
 * 5. Generate group pages from the library's Doxygen groups, linking to the entity pages
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
    setTypedefSyntax,
    stripTemplateArgs
} from "../cpp/src/context.js";
import type { CppCompoundIr } from "../cpp/src/renderers/CompoundPageRenderer.js";
import { renderCompoundPage } from "../cpp/src/renderers/CompoundPageRenderer.js";
import { renderSegmentsPlainText } from "../cpp/src/renderers/DescriptionRenderer.js";
import type { GroupListEntry } from "../cpp/src/renderers/GroupPageRenderer.js";
import {
    collectGroupSections,
    groupHasContent,
    renderGroupPage,
    renderGroupsIndexPage
} from "../cpp/src/renderers/GroupPageRenderer.js";
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
import type {
    CppClassIr,
    CppDocstringIr,
    CppGroupIr,
    CppLibraryDocsIr,
    CppNamespaceIr
} from "./types/CppLibraryDocsIr.js";
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
    setTypedefSyntax(isPlainCLibrary(ir.rootNamespace) ? "c" : "cpp");
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

        const groups = (ir.groups ?? []).filter((group) => groupHasContent(group));

        // Stage 4: Generate index pages for namespaces
        const slugBaseName = slug.includes("/") ? (slug.split("/").pop() ?? slug) : slug;
        // Plain-C libraries have no namespaces, so their entities live on the unnamed root.
        const libraryNs =
            ir.rootNamespace.namespaces.find((child) => child.name === slugBaseName) ??
            (ir.rootNamespace.path === "" ? ir.rootNamespace : undefined);
        if (libraryNs) {
            const titleName = libraryNs.name || slugBaseName;
            const title = LIBRARY_TITLES[titleName] ?? `${titleName} API Reference`;
            const outputFolderSlug = slugifySegment(outputDir.split("/").pop() || slug);
            generateIndexPages(
                withRootMacros(libraryNs, ir.rootNamespace),
                title,
                writer,
                rootNsName,
                outputFolderSlug,
                groups.length > 0
            );
        }

        // Stage 5: Generate pages for the library's Doxygen groups
        generateGroupPages(groups, writer, repo.trim() || (rootNsName ?? slug));

        return writer.result();
    } finally {
        clearEntityRegistry();
        setCurrentPageSlugPath(undefined);
        setTypedefSyntax("cpp");
    }
}

/**
 * A library with no namespaces, concepts, templates or C++ class features
 * (`class`, inheritance, member functions) is plain C, so its typedefs are
 * rendered with `typedef` rather than `using` syntax. Plain `struct`/`union`
 * aggregates are valid C and do not count as evidence of C++.
 */
function isPlainCLibrary(root: CppNamespaceIr): boolean {
    return (
        root.path === "" &&
        root.namespaces.every((ns) => ns.name === "std" && isEmptyNamespace(ns)) &&
        root.concepts.length === 0 &&
        root.classes.every(isPlainCAggregate) &&
        root.functions.every((fn) => fn.templateParams.length === 0) &&
        root.typedefs.every((td) => td.templateParams.length === 0)
    );
}

/** Doxygen emits an empty `std` namespace for C headers that include `<stdint.h>`. */
function isEmptyNamespace(ns: CppNamespaceIr): boolean {
    return (
        ns.namespaces.length === 0 &&
        ns.classes.length === 0 &&
        ns.functions.length === 0 &&
        ns.enums.length === 0 &&
        ns.typedefs.length === 0 &&
        ns.variables.length === 0 &&
        ns.concepts.length === 0
    );
}

function isPlainCAggregate(cls: CppClassIr): boolean {
    return (
        cls.kind !== "class" &&
        cls.templateParams.length === 0 &&
        cls.baseClasses.length === 0 &&
        cls.methods.length === 0 &&
        cls.staticMethods.length === 0 &&
        cls.friendFunctions.length === 0 &&
        cls.typedefs.length === 0 &&
        cls.enums.every((e) => !e.isScoped && e.underlyingType === undefined) &&
        !cls.isAbstract &&
        !cls.isFinal &&
        cls.memberVariables.every(
            (v) => v.templateParams.length === 0 && !v.isStatic && !v.isConstexpr && !v.isMutable
        ) &&
        cls.innerClasses.every(isPlainCAggregate)
    );
}

/**
 * Macros are unscoped and always land on the root namespace, but the library's
 * index pages are built from the selected namespace. Attach the root macros so
 * they show up in the Macros index even when that namespace is a named child.
 */
function withRootMacros(libraryNs: CppNamespaceIr, root: CppNamespaceIr): CppNamespaceIr {
    if (libraryNs === root || (root.macros ?? []).length === 0) {
        return libraryNs;
    }
    return { ...libraryNs, macros: [...(libraryNs.macros ?? []), ...(root.macros ?? [])] };
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

    // Macros are unscoped, so the root-prefix filter never applies to them.
    for (const macro of ns.macros ?? []) {
        result.push({
            compound: { kind: "macro", data: macro },
            path: macro.path,
            namespacePath: [],
            docstring: macro.docstring
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
        case "macro":
            return "macros";
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

    return disambiguateSlugCollisions(result);
}

/**
 * Page keys that differ on disk can still slugify to the same URL (e.g. `FOO_BAR`
 * and `FOOBAR` both become `foobar`). Append a numeric `-N` suffix (which survives
 * slugification) to every entry after the first in such a group, in a deterministic
 * order, so every page has a unique URL. The `index` slug of every directory is
 * reserved for the generated category/namespace index page.
 */
function disambiguateSlugCollisions(entries: PageEntry[]): PageEntry[] {
    const bySlug = new Map<string, PageEntry[]>();
    const reserved = new Set<string>();
    for (const entry of entries) {
        const slug = pageKeyToSlugPath(entry.pageKey);
        const dir = slug.includes("/") ? slug.substring(0, slug.lastIndexOf("/") + 1) : "";
        reserved.add(`${dir}index`);
        const existing = bySlug.get(slug);
        if (existing) {
            existing.push(entry);
        } else {
            bySlug.set(slug, [entry]);
        }
    }

    const taken = new Set([...bySlug.keys(), ...reserved]);
    const result: PageEntry[] = [];
    for (const [slug, group] of bySlug) {
        const isReserved = reserved.has(slug);
        if (group.length === 1 && !isReserved) {
            result.push(...group);
            continue;
        }
        const sorted = [...group].sort((a, b) => (a.pageKey < b.pageKey ? -1 : a.pageKey > b.pageKey ? 1 : 0));
        sorted.forEach((entry, index) => {
            if (index === 0 && !isReserved) {
                result.push(entry);
                return;
            }
            const base = entry.pageKey.replace(/\.mdx$/, "");
            let n = 2;
            let candidate = `${base}-${n}`;
            while (taken.has(pageKeyToSlugPath(`${candidate}.mdx`))) {
                n += 1;
                candidate = `${base}-${n}`;
            }
            taken.add(pageKeyToSlugPath(`${candidate}.mdx`));
            result.push({ pageKey: `${candidate}.mdx`, collected: entry.collected });
        });
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
    outputFolderSlug: string,
    hasGroups: boolean
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
        nsLastSegment,
        hasGroups
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
        // Groups are listed on the library's index page only, not on every namespace
        generateIndexPages(child, `Namespace ${child.path}`, writer, rootNsName, outputFolderSlug, false);
    }
}

// ---------------------------------------------------------------------------
// Group page generation (Stage 5)
// ---------------------------------------------------------------------------

const GROUPS_FOLDER = "groups";

function groupFolderName(group: CppGroupIr): string {
    return sanitizeForFilename(group.name || group.title);
}

/**
 * Sibling group folders whose names slugify to the same URL segment (e.g.
 * `DOCA_GPUNETIO` and `DOCAGPUNETIO`) get a deterministic `-N` suffix so each
 * group page has its own URL.
 */
function uniqueGroupFolderNames(groups: CppGroupIr[]): Map<CppGroupIr, string> {
    const result = new Map<CppGroupIr, string>();
    const takenSlugs = new Set<string>();
    const sorted = [...groups].sort((a, b) => {
        const fa = groupFolderName(a);
        const fb = groupFolderName(b);
        return fa < fb ? -1 : fa > fb ? 1 : 0;
    });
    for (const group of sorted) {
        const base = groupFolderName(group);
        let folder = base;
        let n = 2;
        while (takenSlugs.has(slugifySegment(folder))) {
            folder = `${base}-${n}`;
            n += 1;
        }
        takenSlugs.add(slugifySegment(folder));
        result.set(group, folder);
    }
    return result;
}

function groupDisplayName(group: CppGroupIr): string {
    return group.title || group.name;
}

/**
 * Generate a page per Doxygen group, plus a groups/index.mdx listing them.
 *
 * Group pages link to the entity pages written in Stage 3 rather than
 * re-rendering their members, so each symbol is documented in one place.
 * Members that have no page (for example symbols the parser skipped) are
 * listed without a link.
 */
function generateGroupPages(renderable: CppGroupIr[], writer: MdxFileWriter, libraryTitle: string): void {
    if (renderable.length === 0) {
        return;
    }

    const indexPageKey = `${GROUPS_FOLDER}/index.mdx`;
    setCurrentPageSlugPath(pageKeyToSlugPath(indexPageKey));
    const folders = uniqueGroupFolderNames(renderable);
    const entries: GroupListEntry[] = renderable.map((group) => ({
        displayName: groupDisplayName(group),
        linkPath: `${GROUPS_FOLDER}/${slugifySegment(folders.get(group) ?? groupFolderName(group))}`
    }));
    writer.writePage(indexPageKey, renderGroupsIndexPage(entries, libraryTitle));

    const written = new Set<string>();
    for (const group of renderable) {
        writeGroupPage(group, `${GROUPS_FOLDER}/${folders.get(group) ?? groupFolderName(group)}`, writer, written);
    }
}

/**
 * Write one group page at `<dir>/index.mdx` and recurse into its subgroups.
 *
 * Links are relative to the group's own folder, matching how Fern resolves
 * links on a folder index page (the `/index` suffix is stripped from the URL).
 *
 * `written` tracks the groups already emitted so a group tree that references
 * one of its ancestors terminates instead of recursing forever.
 */
function writeGroupPage(group: CppGroupIr, dir: string, writer: MdxFileWriter, written: Set<string>): void {
    if (written.has(group.id)) {
        return;
    }
    written.add(group.id);

    const pageKey = `${dir}/index.mdx`;
    setCurrentPageSlugPath(pageKeyToSlugPath(pageKey));

    const sections = collectGroupSections(group);
    const subgroups = group.subgroups.filter((subgroup) => !written.has(subgroup.id) && groupHasContent(subgroup));
    const dirSegment = slugifySegment(dir.split("/").pop() ?? "");
    const folders = uniqueGroupFolderNames(subgroups);
    const subgroupEntries: GroupListEntry[] = subgroups.map((subgroup) => ({
        displayName: groupDisplayName(subgroup),
        linkPath: `${dirSegment}/${slugifySegment(folders.get(subgroup) ?? groupFolderName(subgroup))}`
    }));

    writer.writePage(pageKey, renderGroupPage(group, sections, subgroupEntries));

    for (const subgroup of subgroups) {
        writeGroupPage(subgroup, `${dir}/${folders.get(subgroup) ?? groupFolderName(subgroup)}`, writer, written);
    }
}
