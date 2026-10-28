import type { FernNavigation } from "@fern-api/fdr-sdk";

const MARKDOWN_NODE_TYPES = new Set([
    "page",
    "landingPage",
    "changelogEntry",
    "section",
    "apiReference",
    "apiPackage",
    "changelog"
]);
const API_LEAF_TYPES = new Set(["endpoint", "webSocket", "webhook", "grpc", "graphql", "graphqlType"]);

/**
 * Marks nodes in a translated locale's navigation tree as `noindex` when they
 * are served with default-locale content: markdown pages (and section/API
 * overviews) without a translated source file, and API leaves whose API has no
 * translated definition for the locale. Keeps English fallback renders out of
 * the locale's sitemap and llms.txt, and emits `noindex` on the page.
 *
 * Omitting a set skips that category of node. Returns a new tree; the input is
 * not mutated.
 */
export function markUntranslatedNavNodesNoindex(
    root: FernNavigation.V1.RootNode | undefined,
    {
        translatedPageIds,
        translatedApiDefinitionIds
    }: {
        translatedPageIds?: ReadonlySet<string>;
        translatedApiDefinitionIds?: ReadonlySet<string>;
    }
): FernNavigation.V1.RootNode | undefined {
    if (root == null) {
        return undefined;
    }
    return walkNode(root, translatedPageIds, translatedApiDefinitionIds) as FernNavigation.V1.RootNode;
}

function walkNode(
    node: unknown,
    translatedPageIds: ReadonlySet<string> | undefined,
    translatedApiDefinitionIds: ReadonlySet<string> | undefined
): unknown {
    if (node == null || typeof node !== "object") {
        return node;
    }
    if (Array.isArray(node)) {
        return node.map((item) => walkNode(item, translatedPageIds, translatedApiDefinitionIds));
    }
    if (Object.getPrototypeOf(node) !== Object.prototype) {
        return node;
    }

    const updated: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(node)) {
        updated[k] = walkNode(v, translatedPageIds, translatedApiDefinitionIds);
    }

    const type = updated["type"];
    if (typeof type !== "string") {
        return updated;
    }
    const pageId = updated["pageId"] ?? updated["overviewPageId"];
    if (MARKDOWN_NODE_TYPES.has(type) && typeof pageId === "string") {
        if (translatedPageIds != null && !translatedPageIds.has(pageId)) {
            updated["noindex"] = true;
        }
    } else if (
        translatedApiDefinitionIds != null &&
        API_LEAF_TYPES.has(type) &&
        typeof updated["apiDefinitionId"] === "string" &&
        !translatedApiDefinitionIds.has(updated["apiDefinitionId"])
    ) {
        updated["noindex"] = true;
    }

    return updated;
}
