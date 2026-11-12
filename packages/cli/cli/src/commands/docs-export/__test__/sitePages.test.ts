import type * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import { afterEach, describe, expect, it, vi } from "vitest";
import { defaultExportSubtree, exportablePageSlugs, fetchSitePageSlugs, splitDocsUrl } from "../sitePages.js";

let nextId = 0;
function page(slug: string, extra: Record<string, unknown> = {}) {
    return { type: "page", id: `page-${nextId++}`, title: slug, slug, pageId: `${slug}.mdx`, ...extra };
}
function section(slug: string, children: unknown[]) {
    return { type: "section", id: `section-${nextId++}`, title: slug, slug, children };
}
function sidebar(children: unknown[]) {
    return { type: "sidebarRoot", id: `sidebar-${nextId++}`, children };
}
function unversioned(children: unknown[], landingPage?: unknown) {
    return { type: "unversioned", id: `unversioned-${nextId++}`, child: sidebar(children), landingPage };
}
function root(child: unknown): FernNavigation.RootNode {
    return { type: "root", id: "root", title: "Docs", slug: "", child } as unknown as FernNavigation.RootNode;
}

describe("exportablePageSlugs", () => {
    it("lists pages in navigation order, skipping hidden pages, changelogs and repeats", () => {
        const site = root(
            unversioned(
                [
                    section("guides", [
                        page("guides/overview"),
                        page("guides/secret", { hidden: true }),
                        page("guides/install", { authed: true })
                    ]),
                    page("guides/overview"),
                    { type: "changelog", id: "changelog", title: "Changelog", slug: "changelog", children: [] },
                    page("reference/errors")
                ],
                page("home")
            )
        );
        expect(exportablePageSlugs(defaultExportSubtree(site))).toEqual([
            "home",
            "guides/overview",
            "guides/install",
            "reference/errors"
        ]);
    });
});

describe("defaultExportSubtree", () => {
    it("uses the default product and version", () => {
        const version = (id: string, isDefault: boolean, slug: string) => ({
            type: "version",
            id: `version-${id}`,
            versionId: id,
            title: id,
            slug: id,
            default: isDefault,
            child: sidebar([page(slug)])
        });
        const site = root({
            type: "productgroup",
            id: "products",
            children: [
                {
                    type: "product",
                    id: "a",
                    productId: "a",
                    title: "A",
                    slug: "a",
                    default: false,
                    child: unversioned([page("a/page")])
                },
                {
                    type: "product",
                    id: "b",
                    productId: "b",
                    title: "B",
                    slug: "b",
                    default: true,
                    child: {
                        type: "versioned",
                        id: "b-versions",
                        children: [version("v1", false, "b/v1/page"), version("v2", true, "b/v2/page")]
                    }
                }
            ]
        });
        expect(exportablePageSlugs(defaultExportSubtree(site))).toEqual(["b/v2/page"]);
    });
});

describe("splitDocsUrl", () => {
    it("splits the host from the basepath", () => {
        expect(splitDocsUrl("acme.docs.buildwithfern.com")).toEqual({
            domain: "acme.docs.buildwithfern.com",
            basepath: ""
        });
        expect(splitDocsUrl("https://acme.com/docs/")).toEqual({ domain: "acme.com", basepath: "/docs" });
    });
});

describe("fetchSitePageSlugs", () => {
    afterEach(() => {
        vi.unstubAllGlobals();
    });

    function stubRegistry(routes: Record<string, { status?: number; body: unknown }>) {
        const requests: { url: string; authorization: string | null }[] = [];
        vi.stubGlobal(
            "fetch",
            vi.fn(async (input: string, init?: RequestInit) => {
                const url = new URL(input);
                requests.push({ url: input, authorization: new Headers(init?.headers).get("authorization") });
                const route = routes[url.pathname];
                return new Response(JSON.stringify(route?.body ?? { message: "Resource not found" }), {
                    status: route?.status ?? (route == null ? 404 : 200)
                });
            })
        );
        return requests;
    }

    it("builds the page list from the site's current ledger deployment", async () => {
        const requests = stubRegistry({
            "/docs-ledger/current-version": { body: { deploymentId: "dep-1", basepath: "/docs" } },
            "/docs-ledger/version-metadata/dep-1": {
                body: {
                    configJson: { title: "Docs", rootSlug: "" },
                    segments: [
                        {
                            segmentId: "seg",
                            segmentHash: "seg",
                            section: "",
                            locale: "en",
                            sortOrder: 0,
                            hidden: false,
                            metadata: { type: "tabRoot" },
                            product: null,
                            version: null,
                            variant: null,
                            tab: null
                        }
                    ]
                }
            },
            "/docs-ledger/nav/seg": {
                body: {
                    routes: ["intro", "install"].map((fullPath, displaySortOrder) => ({
                        type: "markdown",
                        fullPath,
                        hidden: false,
                        displaySortOrder,
                        metadata: { title: fullPath, pageId: `${fullPath}.mdx` }
                    }))
                }
            }
        });
        await expect(
            fetchSitePageSlugs({ fdrOrigin: "https://registry.test", token: "tok", docsUrl: "https://acme.com/docs" })
        ).resolves.toEqual(["docs/intro", "docs/install"]);
        expect(requests[0]?.url).toBe(
            "https://registry.test/docs-ledger/current-version?domain=acme.com&basepath=%2Fdocs"
        );
        expect(requests.every((request) => request.authorization === "Bearer tok")).toBe(true);
    });

    it("explains a registry refusal", async () => {
        stubRegistry({
            "/docs-ledger/current-version": { status: 403, body: { message: "User does not belong to organization" } }
        });
        await expect(
            fetchSitePageSlugs({ fdrOrigin: "https://registry.test", token: "tok", docsUrl: "acme.com" })
        ).rejects.toThrow("Listing the pages of acme.com failed: HTTP 403: User does not belong to organization");
    });
});
