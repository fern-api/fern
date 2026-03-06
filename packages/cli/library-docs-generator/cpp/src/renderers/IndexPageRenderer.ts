/**
 * Renders an API reference index page for a single C++ namespace.
 *
 * Each namespace gets its own index page listing:
 * 1. Sub-namespaces (links to their own index pages)
 * 2. Direct member entities grouped by category:
 *    Classes, Structs, Concepts, Functions, Type Definitions, Enumerations, Variables
 *
 * The caller is responsible for recursion — this function renders one namespace only.
 */

import type { CppClassIr, CppFunctionIr, CppNamespaceIr } from "../../../src/types/CppLibraryDocsIr.js";
import { buildLinkPath, stripTemplateArgs } from "../context.js";
import { renderFrontmatter, trimTrailingBlankLines } from "./shared.js";

// ---------------------------------------------------------------------------
// Entity category definitions
// ---------------------------------------------------------------------------

interface EntityEntry {
    displayName: string;
    linkPath: string;
}

/**
 * Check whether a namespace has any entities, either directly or in descendants.
 */
export function namespaceHasEntities(ns: CppNamespaceIr): boolean {
    if (
        ns.classes.length > 0 ||
        ns.concepts.length > 0 ||
        ns.functions.length > 0 ||
        ns.enums.length > 0 ||
        ns.typedefs.length > 0 ||
        ns.variables.length > 0
    ) {
        return true;
    }
    return ns.namespaces.some((child) => namespaceHasEntities(child));
}

// ---------------------------------------------------------------------------
// Entity collection helpers
// ---------------------------------------------------------------------------

function collectClassEntries(classes: CppClassIr[], kind: "class" | "struct"): EntityEntry[] {
    return classes
        .filter((cls) => cls.kind === kind)
        .map((cls) => ({
            displayName: cls.path,
            linkPath: buildLinkPath(stripTemplateArgs(cls.path))
        }))
        .sort((a, b) => a.displayName.localeCompare(b.displayName));
}

function collectEntityEntries<T extends { path: string }>(items: T[]): EntityEntry[] {
    return items
        .map((item) => ({
            displayName: item.path,
            linkPath: buildLinkPath(stripTemplateArgs(item.path))
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
// Section rendering
// ---------------------------------------------------------------------------

/**
 * Render a category section (heading + bulleted list of links).
 * Returns an empty array if the entries list is empty.
 */
function renderCategorySection(heading: string, entries: EntityEntry[]): string[] {
    if (entries.length === 0) {
        return [];
    }
    const lines: string[] = [];
    lines.push(`## ${heading}`);
    lines.push("");
    for (const entry of entries) {
        lines.push(`- [\`${entry.displayName}\`](${entry.linkPath})`);
    }
    lines.push("");
    return lines;
}

/**
 * Render the sub-namespaces section with relative links to their index pages.
 */
function renderSubNamespacesSection(ns: CppNamespaceIr): string[] {
    const childNamespaces = ns.namespaces.filter((child) => namespaceHasEntities(child));
    if (childNamespaces.length === 0) {
        return [];
    }

    const sorted = [...childNamespaces].sort((a, b) => a.path.localeCompare(b.path));

    const lines: string[] = [];
    lines.push("## Sub-Namespaces");
    lines.push("");
    for (const child of sorted) {
        // Build a relative link from this namespace's index page to the child's index page.
        // The child's index page is at {slug}/{child.path.replace(/::/g, '/')}/index.mdx
        // relative to this page at {slug}/{ns.path.replace(/::/g, '/')}/index.mdx
        // so the relative path is ./{childName}/index
        const relativePath = `./${child.name}/index`;
        lines.push(`- [\`${child.path}\`](${relativePath})`);
    }
    lines.push("");
    return lines;
}

// ---------------------------------------------------------------------------
// Main renderer
// ---------------------------------------------------------------------------

/**
 * Render a single namespace's API reference index page as MDX.
 *
 * @param ns - The namespace IR to render
 * @param title - Page title (e.g., "CUB API Reference" or "Namespace thrust::mr")
 * @returns Complete MDX page content
 */
export function renderIndexPage(ns: CppNamespaceIr, title: string): string {
    const lines: string[] = [];

    // Frontmatter
    // For root namespaces the title is like "CUB API Reference" — strip the suffix for the description.
    // For sub-namespaces the title is like "Namespace thrust::mr" — use the qualified path directly.
    const descriptionSubject = title.endsWith(" API Reference") ? title.replace(/ API Reference$/, "") : ns.path;
    const description = `API reference for the ${descriptionSubject} namespace.`;
    lines.push(...renderFrontmatter(title, description));
    lines.push("");

    // Sub-namespaces (at the top, before entity categories)
    lines.push(...renderSubNamespacesSection(ns));

    // Entity categories in prescribed order:
    // Classes -> Structs -> Concepts -> Functions -> Type Definitions -> Enumerations -> Variables
    lines.push(...renderCategorySection("Classes", collectClassEntries(ns.classes, "class")));
    lines.push(...renderCategorySection("Structs", collectClassEntries(ns.classes, "struct")));
    lines.push(...renderCategorySection("Concepts", collectEntityEntries(ns.concepts)));
    lines.push(...renderCategorySection("Functions", collectFunctionEntries(ns.functions)));
    lines.push(...renderCategorySection("Type Definitions", collectEntityEntries(ns.typedefs)));
    lines.push(...renderCategorySection("Enumerations", collectEntityEntries(ns.enums)));
    lines.push(...renderCategorySection("Variables", collectEntityEntries(ns.variables)));

    trimTrailingBlankLines(lines);
    return lines.join("\n") + "\n";
}
