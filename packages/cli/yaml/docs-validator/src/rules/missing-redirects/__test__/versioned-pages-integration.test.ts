import { FernNavigation } from "@fern-api/fdr-sdk";
import { describe, expect, it } from "vitest";

import { buildPageIdToSlugMap } from "../buildPageIdToSlugMap.js";
import { checkMissingRedirects, findRemovedSlugs, type MarkdownEntry } from "../missing-redirects-logic.js";

/**
 * Test fixtures conform to the runtime shape that `NodeCollector` walks
 * (`type`, `id`, `slug`, `title`, `pageId`, ...), but skip the structural-only
 * fields (`canonicalSlug`, `viewers`, `featureFlags`, etc.) that the rule
 * never reads. The cast is the narrowest way to feed a partial literal into
 * an SDK type that's only used to drive a runtime traversal.
 */
function asNavigationNode(obj: unknown): FernNavigation.NavigationNode {
    return obj as FernNavigation.NavigationNode;
}

describe("buildPageIdToSlugMap + findRemovedSlugs (versioned pages)", () => {
    it("does not flag a previously-published slug as moved when the same .mdx is reused across multiple doc versions (FER-10711)", () => {
        // Reproduces the DDN Infinia report: `pages/safety-notices.mdx` is
        // referenced in two version sub-trees, producing two distinct slugs
        // that share the same pageId. The previously-published v2-2-77 slug
        // is still actively served (by the v2-2-77 navigation entry), so the
        // missing-redirects rule must NOT warn that it was moved.
        const root = asNavigationNode({
            type: "root",
            version: "v2",
            id: "root",
            slug: "",
            title: "Docs",
            child: {
                type: "versioned",
                id: "versioned",
                children: [
                    {
                        type: "version",
                        id: "version-v2-2-77",
                        versionId: "v2-2-77",
                        slug: "v2-2-77",
                        title: "v2.2.77",
                        default: false,
                        child: {
                            type: "sidebarRoot",
                            id: "sidebar-v2-2-77",
                            children: [
                                {
                                    type: "page",
                                    id: "page-v2-2-77",
                                    pageId: "pages/safety-notices.mdx",
                                    slug: "v2-2-77/safety-notices",
                                    title: "Safety notices"
                                }
                            ]
                        }
                    },
                    {
                        type: "version",
                        id: "version-v2-3-2",
                        versionId: "v2-3-2",
                        slug: "v2-3-2",
                        title: "v2.3.2",
                        default: false,
                        child: {
                            type: "sidebarRoot",
                            id: "sidebar-v2-3-2",
                            children: [
                                {
                                    type: "page",
                                    id: "page-v2-3-2",
                                    pageId: "pages/safety-notices.mdx",
                                    slug: "v2-3-2/safety-notices",
                                    title: "Safety notices"
                                }
                            ]
                        }
                    }
                ]
            }
        });

        const localPageIdToSlug = buildPageIdToSlugMap(root);

        const publishedEntries: MarkdownEntry[] = [
            {
                pageId: "pages/safety-notices.mdx",
                slug: "v2-2-77/safety-notices",
                lastUpdated: "2024-01-01T00:00:00.000Z"
            }
        ];

        const removed = findRemovedSlugs(publishedEntries, localPageIdToSlug);

        expect(removed).toEqual([]);
    });

    it("does flag a moved versioned page and surfaces a redirect warning even when other version slugs still reference the same .mdx", () => {
        // Inverse of the test above: the same `pages/safety-notices.mdx` is
        // referenced under two versions locally, but the navigation was
        // restructured so neither version serves the previously-published
        // `v2-3-2/safety-notices` slug anymore (both now nest the page under
        // a `maintenance` section). The previously-published URL would 404,
        // so the rule must still flag it as moved and emit a warning — the
        // fix for FER-10711 must not silently swallow this case.
        const root = asNavigationNode({
            type: "root",
            version: "v2",
            id: "root",
            slug: "",
            title: "Docs",
            child: {
                type: "versioned",
                id: "versioned",
                children: [
                    {
                        type: "version",
                        id: "version-v2-2-77",
                        versionId: "v2-2-77",
                        slug: "v2-2-77",
                        title: "v2.2.77",
                        default: false,
                        child: {
                            type: "sidebarRoot",
                            id: "sidebar-v2-2-77",
                            children: [
                                {
                                    type: "page",
                                    id: "page-v2-2-77",
                                    pageId: "pages/safety-notices.mdx",
                                    slug: "v2-2-77/maintenance/safety-notices",
                                    title: "Safety notices"
                                }
                            ]
                        }
                    },
                    {
                        type: "version",
                        id: "version-v2-3-2",
                        versionId: "v2-3-2",
                        slug: "v2-3-2",
                        title: "v2.3.2",
                        default: false,
                        child: {
                            type: "sidebarRoot",
                            id: "sidebar-v2-3-2",
                            children: [
                                {
                                    type: "page",
                                    id: "page-v2-3-2",
                                    pageId: "pages/safety-notices.mdx",
                                    slug: "v2-3-2/maintenance/safety-notices",
                                    title: "Safety notices"
                                }
                            ]
                        }
                    }
                ]
            }
        });

        const localPageIdToSlug = buildPageIdToSlugMap(root);

        const publishedEntries: MarkdownEntry[] = [
            {
                pageId: "pages/safety-notices.mdx",
                slug: "v2-3-2/safety-notices",
                lastUpdated: "2024-12-01T00:00:00.000Z"
            }
        ];

        const removed = findRemovedSlugs(publishedEntries, localPageIdToSlug);

        expect(removed).toHaveLength(1);
        expect(removed[0]?.pageId).toBe("pages/safety-notices.mdx");
        expect(removed[0]?.oldSlug).toBe("v2-3-2/safety-notices");
        // The suggested destination is "any local slug for this pageId" — the
        // public contract doesn't pin iteration order, so accept either.
        expect(["v2-2-77/maintenance/safety-notices", "v2-3-2/maintenance/safety-notices"]).toContain(
            removed[0]?.newSlug
        );

        // End-to-end: the rule should produce a user-visible warning that
        // points at the dead URL and suggests a redirect.
        const violations = checkMissingRedirects(removed, [], undefined);
        expect(violations).toHaveLength(1);
        expect(violations[0]?.severity).toBe("warning");
        expect(violations[0]?.message).toContain("was moved");
        expect(violations[0]?.message).toContain("/v2-3-2/safety-notices");

        // Sanity: configuring an exact redirect for the dead slug should
        // suppress the warning, confirming the violation is the "missing
        // redirect" kind and not some other class of error.
        const suppressed = checkMissingRedirects(
            removed,
            [{ source: "/v2-3-2/safety-notices", destination: "/v2-3-2/maintenance/safety-notices" }],
            undefined
        );
        expect(suppressed).toEqual([]);
    });
});
