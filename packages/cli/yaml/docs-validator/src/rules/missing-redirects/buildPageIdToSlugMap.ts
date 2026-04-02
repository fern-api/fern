/**
 * TODO(kafkas): This file is an exact copy of the canonical implementation in fdr-sdk.
 * Once this repo upgrades to the latest fdr-sdk version that contains this utility,
 * replace the usage in missing-redirects.ts with:
 *
 *   import { FernNavigation } from "@fern-api/fdr-sdk";
 *   const pageIdToSlug = FernNavigation.utils.buildPageIdToSlugMap(root);
 *
 * and delete this file.
 */

import { FernNavigation } from "@fern-api/fdr-sdk";

/**
 * Builds a map from pageId to slug from a navigation root node.
 *
 * This mirrors how FDR's slug table stores page → URL mappings and should be
 * used by both the server (when populating the slug table on publish) and the
 * CLI (when building the local "after" state for the missing-redirects check).
 *
 * Changelog entries are special-cased: they map to their parent changelog
 * node's slug rather than their own individual entry slug, because individual
 * changelog entries are rendered on the parent changelog page.
 */
export function buildPageIdToSlugMap(root: FernNavigation.NavigationNode): Map<string, string> {
    const collector = FernNavigation.NodeCollector.collect(root);
    const pageIdToSlug = new Map<string, string>();
    for (const entry of collector.getSlugMapWithParents().values()) {
        const { node, parents } = entry;
        if (!FernNavigation.isPage(node)) {
            continue;
        }
        const pageId = FernNavigation.getPageId(node);
        if (pageId == null) {
            continue;
        }
        let slug = node.canonicalSlug ?? node.slug;
        if (node.type === "changelogEntry") {
            const changelogParent = parents.findLast((p) => p.type === "changelog");
            if (changelogParent != null && FernNavigation.hasMetadata(changelogParent)) {
                slug = changelogParent.canonicalSlug ?? changelogParent.slug;
            }
        }
        pageIdToSlug.set(pageId, slug);
    }
    return pageIdToSlug;
}
