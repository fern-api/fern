import { FernNavigation } from "@fern-api/fdr-sdk";
import { TaskContext } from "@fern-api/task-context";
import matter from "gray-matter";

interface FrontmatterOverride {
    sidebarTitle?: string;
    // TODO(translations-alpha): slug overrides are not yet supported because PageNode.slug
    // is a fully-qualified path that requires proper composition with parent slugs.
}

interface ParseResult {
    override: FrontmatterOverride;
    error?: string;
}

function parseFrontmatterOverrides(markdown: string): ParseResult {
    try {
        const { data } = matter(markdown);
        const result: FrontmatterOverride = {};
        const sidebarTitle = data["sidebar-title"];
        if (typeof sidebarTitle === "string" && sidebarTitle.trim().length > 0) {
            result.sidebarTitle = sidebarTitle.trim();
        }
        // TODO(translations-alpha): slug parsing removed until proper composition is implemented
        return { override: result };
    } catch (e) {
        return { override: {}, error: e instanceof Error ? e.message : String(e) };
    }
}

/**
 * Walks the navigation tree and applies sidebar-title overrides from
 * translated page frontmatter. The CLI calls this before sending a translated
 * DocsDefinition to FDR so that the server receives a fully-computed nav tree.
 *
 * Note: slug overrides are not yet supported because PageNode.slug is a fully-qualified
 * path that requires proper composition with parent slugs.
 *
 * @param root - the base navigation tree (from the original docsDefinition)
 * @param translatedPages - map of pageId (relative file path) to translated markdown
 * @param context - optional task context for logging parse errors
 */
export function applyTranslatedFrontmatterToNavTree(
    root: FernNavigation.V1.RootNode | undefined,
    translatedPages: Record<string, string>,
    context?: TaskContext
): FernNavigation.V1.RootNode | undefined {
    if (root == null) {
        return undefined;
    }

    // Build a map of pageId -> frontmatter overrides (only for pages that have overrides)
    const overrides = new Map<string, FrontmatterOverride>();
    for (const [pageId, markdown] of Object.entries(translatedPages)) {
        const { override, error } = parseFrontmatterOverrides(markdown);
        if (error != null) {
            context?.logger.warn(
                `Failed to parse frontmatter in translated page "${pageId}": ${error}. ` +
                    `Sidebar title override will be skipped.`
            );
        }
        if (override.sidebarTitle != null) {
            overrides.set(pageId, override);
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
            // TODO(translations-alpha): Slug overrides are intentionally skipped for now.
            // PageNode.slug is a fully-qualified path (e.g. "fr/sdks/getting-started"),
            // but frontmatter slug is just a leaf segment. Composing them properly requires
            // extracting the SlugGenerator logic from DocsDefinitionResolver.
        }
    }

    // Apply overrides to section nodes with an overview page that matches a translated page
    if (updated["type"] === "section" && typeof updated["overviewPageId"] === "string") {
        const override = overrides.get(updated["overviewPageId"]);
        if (override != null && override.sidebarTitle != null) {
            updated["title"] = override.sidebarTitle;
        }
    }

    return updated;
}
