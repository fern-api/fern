/**
 * Render context for the C++ renderer.
 *
 * Provides metadata needed to resolve cross-references and format links.
 */

import type { CppClassIr } from "../../src/types/CppLibraryDocsIr.js";

/**
 * Metadata about the compound being rendered, extracted from meta.json.
 */
export interface CompoundMeta {
    /** Short name (e.g., "BlockReduce") */
    compoundName: string;
    /** Fully qualified name (e.g., "cub::BlockReduce") */
    qualifiedName: string;
    /** Repository this belongs to (e.g., "CUB", "Thrust", "libcudacxx") */
    repo: string;
    /** What kind of compound this is */
    compoundKind: "class" | "concept" | "function" | "enum" | "typedef" | "variable";
    /** Namespace path segments (e.g., ["cub"] or ["cuda", "mr"]) */
    namespacePath: string[];
    /** Frontmatter description override */
    description?: string;
}

/**
 * Context passed to all render functions.
 */
export interface RenderContext {
    /** Metadata about the compound being rendered */
    meta: CompoundMeta;
}

// ---------------------------------------------------------------------------
// Entity registry (populated before rendering, used for cross-reference links)
// ---------------------------------------------------------------------------

let entityRegistry: Map<string, string> = new Map();
let currentPageSlugPath: string | undefined;

export function setEntityRegistry(registry: Map<string, string>): void {
    entityRegistry = registry;
}

export function clearEntityRegistry(): void {
    entityRegistry = new Map();
}

export function setCurrentPageSlugPath(slugPath: string | undefined): void {
    currentPageSlugPath = slugPath;
}

/**
 * Compute a relative path from one slug path to another.
 *
 * @param fromSlugPath - Current page slug path (e.g., "classes/blockreduce")
 * @param toSlugPath - Target page slug path, possibly with anchor (e.g., "enums/blockreducealgorithm" or "classes/blockreduce#tempstorage")
 */
function computeRelativePath(fromSlugPath: string, toSlugPath: string): string {
    // Handle anchor
    const anchorIdx = toSlugPath.indexOf("#");
    const anchor = anchorIdx >= 0 ? toSlugPath.substring(anchorIdx) : "";
    const toPath = anchorIdx >= 0 ? toSlugPath.substring(0, anchorIdx) : toSlugPath;

    // Self-reference with anchor: just return the anchor fragment
    if (toPath === fromSlugPath && anchor) {
        return anchor;
    }

    // For index pages, Fern strips "/index" from the URL.
    // URL resolution then treats the remaining path as a filename, not directory.
    // Adjust the effective from location to match URL semantics.
    let effectiveFrom = fromSlugPath;
    if (effectiveFrom.endsWith("/index")) {
        effectiveFrom = effectiveFrom.substring(0, effectiveFrom.length - "/index".length);
    } else if (effectiveFrom === "index") {
        effectiveFrom = "";
    }

    // The "directory" in URL terms is everything before the last segment
    const fromDir = effectiveFrom.includes("/") ? effectiveFrom.substring(0, effectiveFrom.lastIndexOf("/")) : "";

    const fromParts = fromDir ? fromDir.split("/") : [];
    const toParts = toPath.split("/").filter((p) => p.length > 0);

    // Find common prefix
    let common = 0;
    while (common < fromParts.length && common < toParts.length && fromParts[common] === toParts[common]) {
        common++;
    }

    // Build relative path
    const ups = fromParts.length - common;
    const upParts = Array(ups).fill("..");
    const downParts = toParts.slice(common);

    const parts = [...upParts, ...downParts];
    const relativePath = parts.length > 0 ? parts.join("/") : ".";

    return relativePath + anchor;
}

/**
 * Build a link path for a qualified name by looking it up in the entity registry.
 * Strips leading `::` and template arguments before lookup.
 * Returns a relative path from the current page to the target page.
 */
export function buildLinkPath(qualifiedName: string): string | undefined {
    const normalized = qualifiedName.startsWith("::") ? qualifiedName.substring(2) : qualifiedName;
    // Try full name first (handles template specializations)
    let targetSlugPath = entityRegistry.get(normalized);
    if (targetSlugPath == null) {
        // Fall back to stripped template args (handles base templates and short refs)
        const stripped = stripTemplateArgs(normalized);
        targetSlugPath = entityRegistry.get(stripped);
    }
    if (targetSlugPath == null || currentPageSlugPath == null) {
        return undefined;
    }
    return computeRelativePath(currentPageSlugPath, targetSlugPath);
}

// ---------------------------------------------------------------------------
// Operator symbol map (shared between filename sanitization and anchor generation)
// ---------------------------------------------------------------------------

export const OPERATOR_SYMBOL_MAP: Array<[string, string]> = [
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

// ---------------------------------------------------------------------------
// Refid-to-path resolution map (for inner class links)
// ---------------------------------------------------------------------------

/**
 * Module-level map from short name to known qualified path.
 * Populated before rendering a class page from its inner classes, typedefs, etc.
 * Used to resolve type references that the doxygen refid decoder can't handle
 * (e.g., CamelCase names get mangled in refids).
 */
let nameToPathMap: Map<string, string> = new Map();

/**
 * Register known name-to-path mappings from a class IR.
 * Call this before rendering a class page.
 */
export function registerClassMembers(cls: CppClassIr): void {
    nameToPathMap.clear();
    // Register inner classes by name
    for (const ic of cls.innerClasses) {
        nameToPathMap.set(ic.name, ic.path);
    }
    // Register typedefs by name
    for (const td of cls.typedefs) {
        nameToPathMap.set(td.name, `${cls.path}::${td.name}`);
    }
    // Register the class itself
    nameToPathMap.set(getShortName(cls.path), cls.path);
}

/**
 * Clear the name-to-path map after rendering.
 */
export function clearClassMembers(): void {
    nameToPathMap.clear();
}

/**
 * Look up a short name in the known class member mappings.
 * Returns the qualified path if found, or undefined.
 */
export function lookupMemberPath(name: string): string | undefined {
    return nameToPathMap.get(name);
}

/**
 * Extract the short (unqualified) class name from a path.
 * e.g., "cub::BlockReduce" -> "BlockReduce"
 */
export function getShortName(path: string): string {
    const parts = path.split("::");
    return parts[parts.length - 1] ?? path;
}

/**
 * Strip template arguments from a C++ type string.
 * e.g., "thrust::iterator_adaptor< Derived, Base, Value >" -> "thrust::iterator_adaptor"
 * Preserves non-template content. Handles nested angle brackets.
 */
export function stripTemplateArgs(name: string): string {
    const openIdx = name.indexOf("<");
    if (openIdx === -1) {
        return name;
    }
    const before = name.substring(0, openIdx);
    if (/operator\s*$/.test(before)) {
        return name;
    }
    return before.trimEnd();
}

/**
 * Determine whether a path needs quoting in YAML frontmatter.
 *
 * Quoting rules:
 * - Always quote when the value contains <, >, &, ", or '
 * - Quote `cuda::` prefixed names because YAML parsers may misinterpret the
 *   leading "cuda" before the first colon as a mapping key.
 *   `cub::` and `thrust::` names do not need quoting.
 */
export function needsQuoting(value: string): boolean {
    if (/[<>&"']/.test(value)) {
        return true;
    }
    // cuda:: prefixed names need quoting to prevent YAML key misinterpretation.
    // cub:: and thrust:: do not need quoting.
    if (value.startsWith("cuda::")) {
        return true;
    }
    return false;
}
