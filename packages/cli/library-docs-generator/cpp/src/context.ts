/**
 * Render context for the C++ renderer.
 *
 * Provides metadata needed to resolve cross-references and format links.
 */

import type { CppClassIr, CppConceptIr } from "../../src/types/CppLibraryDocsIr.js";

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
    compoundKind: "class" | "concept";
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

/**
 * Determine the link path prefix for a fully qualified C++ name.
 *
 * Follows the per-namespace path convention:
 * - cub:: -> /library/api/
 * - thrust:: -> /library/api/
 * - thrust::mr:: -> /library/api/
 * - cuda:: -> /libcudacxx/api/
 * - cuda::mr:: -> /library/api/
 */
export function getLinkPrefix(qualifiedName: string): string {
    if (qualifiedName.startsWith("cuda::mr::")) {
        return "/library/api/";
    }
    if (qualifiedName.startsWith("cuda::")) {
        return "/libcudacxx/api/";
    }
    // cub::, thrust::, etc.
    return "/library/api/";
}

/**
 * Build a link path for a qualified name.
 * Strips leading `::` before determining the prefix and building the path.
 */
export function buildLinkPath(qualifiedName: string): string {
    // Strip leading :: (global scope qualifier) -- it breaks prefix matching
    // and produces incorrect paths like /library/api/::cuda::stream_ref
    const normalized = qualifiedName.startsWith("::") ? qualifiedName.substring(2) : qualifiedName;
    const path = `${getLinkPrefix(normalized)}${normalized}`;
    // URL-encode angle brackets so MDX doesn't parse them as JSX tags
    return path.replace(/</g, "%3C").replace(/>/g, "%3E");
}

/**
 * Create a RenderContext from a class IR and meta.
 */
export function createRenderContext(meta: CompoundMeta): RenderContext {
    return { meta };
}

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
    return name.substring(0, openIdx).trimEnd();
}

/**
 * Determine whether a path needs quoting in YAML frontmatter.
 *
 * Quoting rules derived from golden pages:
 * - Always quote when the value contains <, >, &, ", or '
 * - BUG 15 fix: Quote `cuda::` prefixed names because YAML parsers may
 *   misinterpret the leading "cuda" before the first colon as a mapping key.
 *   `cub::` and `thrust::` names are NOT quoted per golden pages.
 */
export function needsQuoting(value: string): boolean {
    if (/[<>&"']/.test(value)) {
        return true;
    }
    // BUG 15: cuda:: prefixed names need quoting per golden page convention.
    // cub:: and thrust:: do not need quoting.
    if (value.startsWith("cuda::")) {
        return true;
    }
    return false;
}
