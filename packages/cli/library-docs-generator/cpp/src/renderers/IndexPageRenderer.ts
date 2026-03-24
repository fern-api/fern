/**
 * Renders API reference index pages for C++ namespace documentation.
 *
 * Three page types are produced per namespace:
 * 1. Namespace index — links to non-empty category folder indexes and namespaces/index
 * 2. Category index — bulleted entity list for a single category (e.g., classes/index.mdx)
 * 3. Namespaces index — bulleted list of child namespaces (namespaces/index.mdx)
 *
 * The ENTITY_CATEGORIES array is the single source of truth for all 7 entity
 * categories. Both this module and CppDocsGenerator consume it.
 */

import type { CppClassIr, CppFunctionIr, CppNamespaceIr } from "../../../src/types/CppLibraryDocsIr.js";
import { buildLinkPath, stripTemplateArgs } from "../context.js";
import { renderFrontmatter, trimTrailingBlankLines } from "./shared.js";

// ---------------------------------------------------------------------------
// Entity entry type
// ---------------------------------------------------------------------------

export interface EntityEntry {
    displayName: string;
    linkPath: string | undefined;
}

export interface NamespaceListEntry {
    displayName: string;
    linkPath: string;
}

export interface CategoryWithEntries {
    category: CategoryDefinition;
    entries: EntityEntry[];
}

// ---------------------------------------------------------------------------
// Entity collection helpers
// ---------------------------------------------------------------------------

function collectClassEntries(classes: CppClassIr[], kind: "class" | "struct"): EntityEntry[] {
    return classes
        .filter((cls) => cls.kind === kind)
        .map((cls) => ({
            displayName: cls.path,
            linkPath: buildLinkPath(cls.path)
        }))
        .sort((a, b) => a.displayName.localeCompare(b.displayName));
}

function collectEntityEntries<T extends { path: string }>(items: T[]): EntityEntry[] {
    return items
        .map((item) => ({
            displayName: item.path,
            linkPath: buildLinkPath(item.path)
        }))
        .sort((a, b) => a.displayName.localeCompare(b.displayName));
}

function collectFunctionEntries(functions: CppFunctionIr[]): EntityEntry[] {
    // Deduplicate by path — multiple overloads share one page
    const seen = new Set<string>();
    const entries: EntityEntry[] = [];
    for (const func of functions) {
        const stripped = stripTemplateArgs(func.path);
        if (seen.has(stripped)) {
            continue;
        }
        seen.add(stripped);
        entries.push({
            displayName: func.path,
            linkPath: buildLinkPath(stripped)
        });
    }
    return entries.sort((a, b) => a.displayName.localeCompare(b.displayName));
}

// ---------------------------------------------------------------------------
// Category definitions — single source of truth
// ---------------------------------------------------------------------------

export interface CategoryDefinition {
    folderName: string;
    heading: string;
    collectEntries: (ns: CppNamespaceIr) => EntityEntry[];
}

export const ENTITY_CATEGORIES: readonly CategoryDefinition[] = [
    {
        folderName: "classes",
        heading: "Classes",
        collectEntries: (ns) => collectClassEntries(ns.classes, "class")
    },
    {
        folderName: "structs",
        heading: "Structs",
        collectEntries: (ns) => collectClassEntries(ns.classes, "struct")
    },
    {
        folderName: "concepts",
        heading: "Concepts",
        collectEntries: (ns) => collectEntityEntries(ns.concepts)
    },
    {
        folderName: "functions",
        heading: "Functions",
        collectEntries: (ns) => collectFunctionEntries(ns.functions)
    },
    {
        folderName: "enums",
        heading: "Enumerations",
        collectEntries: (ns) => collectEntityEntries(ns.enums)
    },
    {
        folderName: "typedefs",
        heading: "Type Definitions",
        collectEntries: (ns) => collectEntityEntries(ns.typedefs)
    },
    {
        folderName: "variables",
        heading: "Variables",
        collectEntries: (ns) => collectEntityEntries(ns.variables)
    }
];

// ---------------------------------------------------------------------------
// Namespace entity check
// ---------------------------------------------------------------------------

/**
 * Check whether a namespace has any entities, either directly or in descendants.
 */
export function namespaceHasEntities(ns: CppNamespaceIr): boolean {
    const hasDirectEntities = ENTITY_CATEGORIES.some((cat) => cat.collectEntries(ns).length > 0);
    if (hasDirectEntities) {
        return true;
    }
    return ns.namespaces.some((child) => namespaceHasEntities(child));
}

// ---------------------------------------------------------------------------
// Namespace index page
// ---------------------------------------------------------------------------

/**
 * Render a namespace's top-level index page.
 *
 * Contains only links to non-empty category folder indexes and, if applicable,
 * a link to the namespaces/index page. No inline entity listings.
 *
 * @param title - Page title (e.g., "CUB API Reference" or "Namespace cub::detail")
 * @param categories - Pre-computed non-empty categories with their entries
 * @param hasChildNamespaces - Whether child namespaces with entities exist
 * @param nsLastSegment - Last segment of the namespace directory path (used as link prefix)
 */
export function renderNamespaceIndexPage(
    title: string,
    categories: CategoryWithEntries[],
    hasChildNamespaces: boolean,
    nsLastSegment: string
): string {
    const lines: string[] = [];

    const descriptionSubject = title.endsWith(" API Reference") ? title.replace(/ API Reference$/, "") : title;
    const description = `API reference for the ${descriptionSubject} namespace.`;
    lines.push(...renderFrontmatter(title, description));
    lines.push("");

    // Links to non-empty category indexes
    for (const { category } of categories) {
        lines.push(`- [${category.heading}](${nsLastSegment}/${category.folderName})`);
    }

    // Link to namespaces index if there are child namespaces with entities
    if (hasChildNamespaces) {
        lines.push(`- [Namespaces](${nsLastSegment}/namespaces)`);
    }

    trimTrailingBlankLines(lines);
    return lines.join("\n") + "\n";
}

// ---------------------------------------------------------------------------
// Category index page
// ---------------------------------------------------------------------------

/**
 * Render a category folder's index page (e.g., classes/index.mdx).
 *
 * Contains a bulleted list of entities with links.
 *
 * @param nsPath - Fully qualified namespace path (e.g., "cub" or "thrust::system")
 * @param categoryWithEntries - Category definition with pre-computed entity entries
 * @param nsTitle - Human-readable namespace title for the page heading
 */
export function renderCategoryIndexPage(
    nsPath: string,
    categoryWithEntries: CategoryWithEntries,
    nsTitle: string
): string {
    const { category, entries } = categoryWithEntries;
    const lines: string[] = [];

    const title = `${nsTitle} — ${category.heading}`;
    const description = `${category.heading} in the ${nsPath} namespace.`;
    lines.push(...renderFrontmatter(title, description));
    lines.push("");

    for (const entry of entries) {
        if (entry.linkPath) {
            lines.push(`- [\`${entry.displayName}\`](${entry.linkPath})`);
        } else {
            lines.push(`- \`${entry.displayName}\``);
        }
    }

    trimTrailingBlankLines(lines);
    return lines.join("\n") + "\n";
}

// ---------------------------------------------------------------------------
// Namespaces index page
// ---------------------------------------------------------------------------

/**
 * Render the namespaces/index.mdx page listing child namespaces.
 *
 * Each child namespace links via a pre-computed relative path.
 *
 * @param nsPath - Fully qualified namespace path (e.g., "cub" or "thrust::system")
 * @param childEntries - Pre-computed child namespace entries with display names and link paths
 * @param nsTitle - Human-readable namespace title for the page heading
 */
export function renderNamespacesIndexPage(nsPath: string, childEntries: NamespaceListEntry[], nsTitle: string): string {
    const lines: string[] = [];

    const title = `${nsTitle} — Namespaces`;
    const description = `Sub-namespaces of the ${nsPath} namespace.`;
    lines.push(...renderFrontmatter(title, description));
    lines.push("");

    for (const entry of childEntries) {
        lines.push(`- [\`${entry.displayName}\`](${entry.linkPath})`);
    }

    trimTrailingBlankLines(lines);
    return lines.join("\n") + "\n";
}
