import { docsYml } from "@fern-api/configuration";
import { FernNavigation } from "@fern-api/fdr-sdk";
import { describe, expect, it } from "vitest";

import { applyTranslatedNavigationOverlays, getTranslatedAnnouncement } from "../applyTranslatedNavigationOverlays.js";

function asRoot(obj: unknown): FernNavigation.V1.RootNode {
    return obj as FernNavigation.V1.RootNode;
}

function emptyOverlay(): docsYml.TranslationNavigationOverlay {
    return {
        tabs: undefined,
        products: undefined,
        versions: undefined,
        announcement: undefined,
        navigation: undefined,
        navbarLinks: undefined
    };
}

describe("applyTranslatedNavigationOverlays", () => {
    it("returns undefined when root is undefined", () => {
        const result = applyTranslatedNavigationOverlays(undefined, emptyOverlay());
        expect(result).toBeUndefined();
    });

    it("returns original root when overlay is empty", () => {
        const root = {
            type: "root",
            child: {
                type: "page",
                title: "Welcome",
                slug: "welcome"
            }
        };
        const result = applyTranslatedNavigationOverlays(asRoot(root), emptyOverlay());
        expect(result).toEqual(root);
    });

    it("applies product display-name override", () => {
        const root = {
            type: "root",
            child: {
                type: "productgroup",
                children: [
                    {
                        type: "product",
                        productId: "Home",
                        title: "Home",
                        subtitle: "",
                        slug: "docs/home",
                        child: { type: "unversioned", child: { type: "sidebarRoot", children: [] } }
                    }
                ]
            }
        };
        const overlay: docsYml.TranslationNavigationOverlay = {
            ...emptyOverlay(),
            products: [
                {
                    slug: "home",
                    displayName: "ホーム",
                    subtitle: "ようこそ",
                    announcement: undefined,
                    tabs: undefined,
                    navigation: undefined,
                    versions: undefined
                }
            ]
        };

        const result = applyTranslatedNavigationOverlays(asRoot(root), overlay);
        const productGroup = (result as unknown as Record<string, unknown>).child as Record<string, unknown>;
        const products = productGroup.children as Array<Record<string, unknown>>;
        expect(products[0]?.title).toBe("ホーム");
        expect(products[0]?.subtitle).toBe("ようこそ");
    });

    it("applies version display-name override", () => {
        const root = {
            type: "root",
            child: {
                type: "productgroup",
                children: [
                    {
                        type: "product",
                        productId: "SDK",
                        title: "SDK",
                        subtitle: "",
                        slug: "docs/sdk",
                        child: {
                            type: "versioned",
                            children: [
                                {
                                    type: "version",
                                    versionId: "v2",
                                    title: "v2",
                                    slug: "docs/sdk/v2",
                                    child: { type: "sidebarRoot", children: [] }
                                },
                                {
                                    type: "version",
                                    versionId: "v1",
                                    title: "v1",
                                    slug: "docs/sdk/v1",
                                    child: { type: "sidebarRoot", children: [] }
                                }
                            ]
                        }
                    }
                ]
            }
        };
        const overlay: docsYml.TranslationNavigationOverlay = {
            ...emptyOverlay(),
            versions: [
                { slug: "v2", displayName: "v2 (最新)", tabs: undefined, navigation: undefined },
                { slug: "v1", displayName: "v1 (旧)", tabs: undefined, navigation: undefined }
            ]
        };

        const result = applyTranslatedNavigationOverlays(asRoot(root), overlay);
        const pg = (result as unknown as Record<string, unknown>).child as Record<string, unknown>;
        const products = pg.children as Array<Record<string, unknown>>;
        const versioned = products[0]?.child as Record<string, unknown>;
        const versions = versioned.children as Array<Record<string, unknown>>;
        expect(versions[0]?.title).toBe("v2 (最新)");
        expect(versions[1]?.title).toBe("v1 (旧)");
    });

    it("applies version-scoped tab and section overrides nested inside a product", () => {
        const root = {
            type: "root",
            child: {
                type: "productgroup",
                children: [
                    {
                        type: "product",
                        productId: "Platform",
                        title: "Platform",
                        subtitle: "",
                        slug: "platform",
                        child: {
                            type: "versioned",
                            children: [
                                {
                                    type: "version",
                                    versionId: "v4",
                                    title: "V4",
                                    slug: "platform/v4",
                                    child: {
                                        type: "tabbed",
                                        children: [
                                            {
                                                type: "tab",
                                                title: "Docs",
                                                slug: "platform/v4/docs",
                                                child: {
                                                    type: "sidebarRoot",
                                                    children: [
                                                        {
                                                            type: "section",
                                                            title: "Introduction",
                                                            slug: "platform/v4/docs/introduction",
                                                            children: []
                                                        }
                                                    ]
                                                }
                                            }
                                        ]
                                    }
                                }
                            ]
                        }
                    }
                ]
            }
        };
        const overlay: docsYml.TranslationNavigationOverlay = {
            ...emptyOverlay(),
            products: [
                {
                    slug: undefined,
                    displayName: "プラットフォーム",
                    subtitle: undefined,
                    announcement: undefined,
                    tabs: undefined,
                    navigation: undefined,
                    versions: [
                        {
                            slug: "v4",
                            displayName: "V4",
                            tabs: { docs: { displayName: "ドキュメント", slug: undefined } },
                            navigation: [
                                {
                                    type: "tab",
                                    tabId: "docs",
                                    layout: [
                                        {
                                            type: "section",
                                            title: "はじめに",
                                            slug: undefined,
                                            contents: undefined
                                        }
                                    ],
                                    variants: undefined
                                }
                            ]
                        }
                    ]
                }
            ]
        };

        const result = applyTranslatedNavigationOverlays(asRoot(root), overlay);
        const productGroup = (result as unknown as Record<string, unknown>).child as Record<string, unknown>;
        const products = productGroup.children as Array<Record<string, unknown>>;
        expect(products[0]?.title).toBe("プラットフォーム");
        const versioned = products[0]?.child as Record<string, unknown>;
        const versions = versioned.children as Array<Record<string, unknown>>;
        const tabbed = versions[0]?.child as Record<string, unknown>;
        const tabs = tabbed.children as Array<Record<string, unknown>>;
        expect(tabs[0]?.title).toBe("ドキュメント");
        const sidebarRoot = tabs[0]?.child as Record<string, unknown>;
        const sections = sidebarRoot.children as Array<Record<string, unknown>>;
        expect(sections[0]?.title).toBe("はじめに");
    });

    it("applies tab display-name override", () => {
        const root = {
            type: "root",
            child: {
                type: "unversioned",
                child: {
                    type: "tabbed",
                    children: [
                        {
                            type: "tab",
                            title: "Documentation",
                            slug: "docs/documentation",
                            child: { type: "sidebarRoot", children: [] }
                        },
                        {
                            type: "tab",
                            title: "API Reference",
                            slug: "docs/api-reference",
                            child: { type: "sidebarRoot", children: [] }
                        }
                    ]
                }
            }
        };
        const overlay: docsYml.TranslationNavigationOverlay = {
            ...emptyOverlay(),
            tabs: {
                documentation: { displayName: "ドキュメント", slug: undefined },
                "api-reference": { displayName: "APIリファレンス", slug: undefined }
            }
        };

        const result = applyTranslatedNavigationOverlays(asRoot(root), overlay);
        const unversioned = (result as unknown as Record<string, unknown>).child as Record<string, unknown>;
        const tabbed = unversioned.child as Record<string, unknown>;
        const tabs = tabbed.children as Array<Record<string, unknown>>;
        expect(tabs[0]?.title).toBe("ドキュメント");
        expect(tabs[1]?.title).toBe("APIリファレンス");
    });

    it("applies tab overrides positionally when skip-slug tabs share the same slug", () => {
        // When tabs use skip-slug:true, they all collapse into the parent's
        // slug, so slug-based matching can't disambiguate them. The overlay
        // navigation order is the source of truth — match positionally.
        const root = {
            type: "root",
            child: {
                type: "unversioned",
                child: {
                    type: "tabbed",
                    children: [
                        {
                            type: "tab",
                            title: "Home",
                            slug: "platform/v4",
                            child: { type: "sidebarRoot", children: [] }
                        },
                        {
                            type: "tab",
                            title: "API Reference",
                            slug: "platform/v4",
                            child: { type: "sidebarRoot", children: [] }
                        },
                        {
                            type: "tab",
                            title: "Changelog",
                            slug: "platform/v4",
                            child: { type: "sidebarRoot", children: [] }
                        }
                    ]
                }
            }
        };
        const overlay: docsYml.TranslationNavigationOverlay = {
            ...emptyOverlay(),
            tabs: {
                home: { displayName: "ホーム", slug: undefined },
                api: { displayName: "API リファレンス", slug: undefined },
                changelog: { displayName: "チェンジログ", slug: undefined }
            },
            navigation: [
                { type: "tab", tabId: "home", layout: undefined, variants: undefined },
                { type: "tab", tabId: "api", layout: undefined, variants: undefined },
                { type: "tab", tabId: "changelog", layout: undefined, variants: undefined }
            ]
        };

        const result = applyTranslatedNavigationOverlays(asRoot(root), overlay);
        const unversioned = (result as unknown as Record<string, unknown>).child as Record<string, unknown>;
        const tabbed = unversioned.child as Record<string, unknown>;
        const tabs = tabbed.children as Array<Record<string, unknown>>;
        expect(tabs[0]?.title).toBe("ホーム");
        expect(tabs[1]?.title).toBe("API リファレンス");
        expect(tabs[2]?.title).toBe("チェンジログ");
    });

    it("applies section and page title overrides from navigation overlay", () => {
        const root = {
            type: "root",
            child: {
                type: "unversioned",
                child: {
                    type: "tabbed",
                    children: [
                        {
                            type: "tab",
                            title: "Documentation",
                            slug: "docs/documentation",
                            child: {
                                type: "sidebarRoot",
                                children: [
                                    {
                                        type: "page",
                                        title: "Getting Started",
                                        slug: "docs/documentation/getting-started",
                                        pageId: "pages/getting-started.mdx"
                                    },
                                    {
                                        type: "section",
                                        title: "API Guide",
                                        slug: "docs/documentation/api-guide",
                                        children: [
                                            {
                                                type: "page",
                                                title: "Overview",
                                                slug: "docs/documentation/api-guide/overview",
                                                pageId: "pages/api/overview.mdx"
                                            }
                                        ]
                                    }
                                ]
                            }
                        }
                    ]
                }
            }
        };
        const overlay: docsYml.TranslationNavigationOverlay = {
            ...emptyOverlay(),
            tabs: {
                documentation: { displayName: "ドキュメント", slug: undefined }
            },
            navigation: [
                {
                    type: "tab",
                    tabId: "documentation",
                    layout: [
                        { type: "page", title: "はじめに", slug: "getting-started" },
                        {
                            type: "section",
                            title: "APIガイド",
                            slug: "api-guide",
                            contents: [{ type: "page", title: "概要", slug: "overview" }]
                        }
                    ],
                    variants: undefined
                }
            ]
        };

        const result = applyTranslatedNavigationOverlays(asRoot(root), overlay);
        const unversioned = (result as unknown as Record<string, unknown>).child as Record<string, unknown>;
        const tabbed = unversioned.child as Record<string, unknown>;
        const tabs = tabbed.children as Array<Record<string, unknown>>;
        const tab = tabs[0] as Record<string, unknown>;
        expect(tab.title).toBe("ドキュメント");

        const sidebarRoot = tab.child as Record<string, unknown>;
        const sidebarChildren = sidebarRoot.children as Array<Record<string, unknown>>;
        expect(sidebarChildren[0]?.title).toBe("はじめに");

        const section = sidebarChildren[1] as Record<string, unknown>;
        expect(section.title).toBe("APIガイド");

        const sectionChildren = section.children as Array<Record<string, unknown>>;
        expect(sectionChildren[0]?.title).toBe("概要");
    });

    it("matches tabs by overlay slug when tab ID differs from nav slug", () => {
        const root = {
            type: "root",
            child: {
                type: "unversioned",
                child: {
                    type: "tabbed",
                    children: [
                        {
                            type: "tab",
                            title: "Documentation",
                            slug: "home/documentation",
                            child: {
                                type: "sidebarRoot",
                                children: [
                                    {
                                        type: "page",
                                        title: "Getting Started",
                                        slug: "home/documentation/getting-started",
                                        pageId: "pages/getting-started.mdx"
                                    }
                                ]
                            }
                        }
                    ]
                }
            }
        };
        const overlay: docsYml.TranslationNavigationOverlay = {
            ...emptyOverlay(),
            tabs: {
                docs: { displayName: "ドキュメント", slug: "documentation" }
            },
            navigation: [
                {
                    type: "tab",
                    tabId: "docs",
                    layout: [{ type: "page", title: "はじめに", slug: "getting-started" }],
                    variants: undefined
                }
            ]
        };

        const result = applyTranslatedNavigationOverlays(asRoot(root), overlay);
        const unversioned = (result as unknown as Record<string, unknown>).child as Record<string, unknown>;
        const tabbed = unversioned.child as Record<string, unknown>;
        const tabs = tabbed.children as Array<Record<string, unknown>>;
        const tab = tabs[0] as Record<string, unknown>;
        expect(tab.title).toBe("ドキュメント");

        const sidebarRoot = tab.child as Record<string, unknown>;
        const sidebarChildren = sidebarRoot.children as Array<Record<string, unknown>>;
        expect(sidebarChildren[0]?.title).toBe("はじめに");
    });

    it("applies product announcement override", () => {
        const root = {
            type: "root",
            child: {
                type: "productgroup",
                children: [
                    {
                        type: "product",
                        productId: "SDK",
                        title: "SDK",
                        subtitle: "",
                        slug: "docs/sdk",
                        announcement: { text: "v2 released!" },
                        child: { type: "unversioned", child: { type: "sidebarRoot", children: [] } }
                    }
                ]
            }
        };
        const overlay: docsYml.TranslationNavigationOverlay = {
            ...emptyOverlay(),
            products: [
                {
                    slug: "sdk",
                    displayName: undefined,
                    subtitle: undefined,
                    announcement: { message: "v2がリリースされました！" },
                    tabs: undefined,
                    navigation: undefined,
                    versions: undefined
                }
            ]
        };

        const result = applyTranslatedNavigationOverlays(asRoot(root), overlay);
        const pg = (result as unknown as Record<string, unknown>).child as Record<string, unknown>;
        const products = pg.children as Array<Record<string, unknown>>;
        const announcement = products[0]?.announcement as Record<string, unknown>;
        expect(announcement.text).toBe("v2がリリースされました！");
    });

    it("does not mutate the original root when applying tab overlays", () => {
        const root = {
            type: "root",
            child: {
                type: "productgroup",
                children: [
                    {
                        type: "product",
                        title: "Home",
                        slug: "home",
                        children: [
                            {
                                type: "tabbed",
                                children: [
                                    {
                                        type: "tab",
                                        title: "Documentation",
                                        slug: "home/documentation",
                                        children: []
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }
        };
        const overlay: docsYml.TranslationNavigationOverlay = {
            ...emptyOverlay(),
            tabs: {
                docs: {
                    displayName: "ドキュメント",
                    slug: "documentation"
                }
            }
        };

        // Apply overlay — this should NOT mutate the original root
        const result = applyTranslatedNavigationOverlays(asRoot(root), overlay);

        // The result should have the translated title
        const resultProduct = (result as unknown as Record<string, unknown>).child as Record<string, unknown>;
        const resultTabbed = (resultProduct.children as Array<Record<string, unknown>>)[0]?.children as Array<
            Record<string, unknown>
        >;
        const resultTab = (resultTabbed[0]?.children as Array<Record<string, unknown>>)[0];
        expect(resultTab?.title).toBe("ドキュメント");

        // The ORIGINAL root must still have the English title
        const origProduct = root.child as Record<string, unknown>;
        const origTabbed = (origProduct.children as Array<Record<string, unknown>>)[0]?.children as Array<
            Record<string, unknown>
        >;
        const origTab = (origTabbed[0]?.children as Array<Record<string, unknown>>)[0];
        expect(origTab?.title).toBe("Documentation");
    });
});

describe("getTranslatedAnnouncement", () => {
    it("returns undefined when no announcement override", () => {
        const result = getTranslatedAnnouncement(emptyOverlay());
        expect(result).toBeUndefined();
    });

    it("returns translated announcement text", () => {
        const overlay: docsYml.TranslationNavigationOverlay = {
            ...emptyOverlay(),
            announcement: { message: "新しいバージョンがリリースされました" }
        };
        const result = getTranslatedAnnouncement(overlay);
        expect(result).toEqual({ text: "新しいバージョンがリリースされました" });
    });
});
