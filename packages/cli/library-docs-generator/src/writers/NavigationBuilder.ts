/**
 * Build navigation tree from module IR.
 *
 * Ported from PythonRenderer.generateModuleNav() in
 * servers/fdr/src/services/library-docs/renderer/python/PythonRenderer.ts
 *
 * Produces a lightweight NavNode[] tree that mirrors the module hierarchy.
 * This is a pure function — no I/O, no page content, just navigation structure.
 * Designed to run alongside the streaming page writer so we never hold
 * all page content in memory.
 */

import type { FdrAPI } from "@fern-api/fdr-sdk";

// ============================================================================
// Navigation Node Types
// ============================================================================

/** A navigation node — either a page or a section. */
export type NavNode = NavPageNode | NavSectionNode;

/** A leaf page in the navigation tree. */
export interface NavPageNode {
    type: "page";
    /** Page title for display */
    title: string;
    /** Stable slug derived from module path (e.g., "reference/python/nemo_rl/utils") */
    slug: string;
    /** Page ID including .mdx extension (e.g., "reference/python/nemo_rl/utils.mdx") */
    pageId: string;
}

/** A section (folder) in the navigation tree, containing child nodes. */
export interface NavSectionNode {
    type: "section";
    /** Section title for display */
    title: string;
    /** Stable slug derived from module path (e.g., "reference/python/nemo_rl") */
    slug: string;
    /** Child nodes (pages or nested sections) */
    children: NavNode[];
}

// ============================================================================
// Public API
// ============================================================================

/**
 * Build a navigation tree from the module IR.
 *
 * The root module is not included as a node itself — its children
 * (submodules, leaf pages) are returned as the top-level items.
 * The root module page should be used as the section overview.
 *
 * @param rootModule - The root module from the library IR
 * @param baseSlug - Base slug prefix (e.g., "reference/python")
 * @returns Navigation items for the root module's children
 */
export function buildNavigation(rootModule: FdrAPI.libraryDocs.PythonModuleIr, baseSlug: string): NavNode[] {
    return generateModuleNav(rootModule, "", baseSlug);
}

// ============================================================================
// Internal
// ============================================================================

/**
 * Recursively generate navigation for a module and its children.
 */
function generateModuleNav(module: FdrAPI.libraryDocs.PythonModuleIr, parentPath: string, baseSlug: string): NavNode[] {
    const items: NavNode[] = [];
    const modulePath = parentPath ? `${parentPath}/${module.name}` : module.name;
    const slug = `${baseSlug}/${modulePath}`;
    const pageId = `${slug}.mdx`;

    const hasContent =
        module.classes.length > 0 ||
        module.functions.length > 0 ||
        module.attributes.length > 0 ||
        module.docstring != null;

    const isRoot = parentPath === "";
    const hasSubmodules = module.submodules.length > 0;

    // Leaf module with content → page node
    // Skip root (it becomes the section overview) and modules with submodules (they become sections)
    if (hasContent && !isRoot && !hasSubmodules) {
        items.push({ type: "page", title: module.name, slug, pageId });
    }

    // Process submodules
    for (const submodule of module.submodules) {
        const subItems = generateModuleNav(submodule, modulePath, baseSlug);
        if (subItems.length === 0) {
            continue;
        }

        const submodulePath = `${modulePath}/${submodule.name}`;
        items.push({
            type: "section",
            title: submodule.name,
            slug: `${baseSlug}/${submodulePath}`,
            children: subItems
        });
    }

    return items;
}
