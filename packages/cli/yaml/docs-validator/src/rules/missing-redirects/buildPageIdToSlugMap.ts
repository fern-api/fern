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
 * Builds a map from pageId to all slugs for that page from a navigation root node.
 *
 * A single pageId can appear under multiple slugs when the same file is referenced
 * across different versions or navigation sections. The returned Set per pageId
 * captures all such slugs so that the missing-redirects check does not produce
 * false positives for intentionally duplicated version content.
 *
 * Changelog entries are special-cased: they map to their parent changelog
 * node's slug rather than their own individual entry slug, because individual
 * changelog entries are rendered on the parent changelog page.
 */
export function buildPageIdToSlugMap(root: FernNavigation.NavigationNode): Map<string, Set<string>> {
    const collector = FernNavigation.NodeCollector.collect(root);
    const pageIdToSlugs = new Map<string, Set<string>>();
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
        const existing = pageIdToSlugs.get(pageId);
        if (existing != null) {
            existing.add(slug);
        } else {
            pageIdToSlugs.set(pageId, new Set([slug]));
        }
    }
    return pageIdToSlugs;
}
