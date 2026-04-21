import { FernNavigation } from "@fern-api/fdr-sdk";
import matter from "gray-matter";

interface FrontmatterOverride {
    sidebarTitle?: string;
    slug?: string;
}

function parseFrontmatterOverrides(markdown: string): FrontmatterOverride {
    try {
        const { data } = matter(markdown);
        const result: FrontmatterOverride = {};
        const sidebarTitle = data["sidebar-title"];
        if (typeof sidebarTitle === "string" && sidebarTitle.trim().length > 0) {
            result.sidebarTitle = sidebarTitle.trim();
        }
        const slug = data["slug"];
        if (typeof slug === "string" && slug.trim().length > 0) {
            result.slug = slug.trim();
        }
        return result;
    } catch {
        return {};
    }
}

/**
 * Walks the navigation tree and applies sidebar-title and slug overrides from
 * translated page frontmatter. The CLI calls this before sending a translated
 * DocsDefinition to FDR so that the server receives a fully-computed nav tree.
 *
 * @param root - the base navigation tree (from the original docsDefinition)
 * @param translatedPages - map of pageId (relative file path) to translated markdown
 */
export function applyTranslatedFrontmatterToNavTree(
    root: FernNavigation.V1.RootNode | undefined,
    translatedPages: Record<string, string>
): FernNavigation.V1.RootNode | undefined {
    if (root == null) {
        return undefined;
    }

    // Build a map of pageId -> frontmatter overrides (only for pages that have overrides)
    const overrides = new Map<string, FrontmatterOverride>();
    for (const [pageId, markdown] of Object.entries(translatedPages)) {
        const fm = parseFrontmatterOverrides(markdown);
        if (fm.sidebarTitle != null || fm.slug != null) {
            overrides.set(pageId, fm);
        }
    }

    if (overrides.size === 0) {
        return root;
    }

    return walkNode(root, overrides) as FernNavigation.V1.RootNode;
}

function walkNode(node: unknown, overrides: Map<string, FrontmatterOverride>): unknown {
    if (node == null || typeof node !== "object") {
        return node;
    }
    if (Array.isArray(node)) {
        return node.map((item) => walkNode(item, overrides));
    }

    const obj = node as Record<string, unknown>;
    const updated: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(obj)) {
        updated[k] = walkNode(v, overrides);
    }

    // Apply overrides to page nodes that match a translated page
    if (updated["type"] === "page" && typeof updated["pageId"] === "string") {
        const override = overrides.get(updated["pageId"]);
        if (override != null) {
            if (override.sidebarTitle != null) {
                updated["title"] = override.sidebarTitle;
            }
            if (override.slug != null) {
                updated["slug"] = override.slug;
            }
        }
    }

    return updated;
}
