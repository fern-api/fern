import type { DocsConfigurationWithResolvedRedirects, docsYml } from "@fern-api/configuration-loader";
import { describe, expect, it } from "vitest";

import type { RuleContext } from "../../../Rule.js";
import {
    CHANGELOG_FEED_ALLOWED_SLUGS,
    getEffectiveChangelogSlugLastSegment,
    getEffectiveChangelogSlugSegments,
    hasAllowedChangelogSegment,
    isAllowedChangelogSlug,
    ValidChangelogSlugRule
} from "../valid-changelog-slug.js";

async function violationsFor(config: DocsConfigurationWithResolvedRedirects): Promise<string[]> {
    const visitor = await ValidChangelogSlugRule.create({} as RuleContext);
    const fileVisitor = visitor.file;
    if (fileVisitor == null) {
        throw new Error("Expected the rule to define a `file` visitor");
    }
    const violations = await fileVisitor({ config });
    return violations.map((violation) => violation.message);
}

async function productViolationsFor(product: docsYml.RawSchemas.InternalProduct, content: unknown): Promise<string[]> {
    const visitor = await ValidChangelogSlugRule.create({} as RuleContext);
    const productFileVisitor = visitor.productFile;
    if (productFileVisitor == null) {
        throw new Error("Expected the rule to define a `productFile` visitor");
    }
    const violations = await productFileVisitor({ path: product.path, content, product });
    return violations.map((violation) => violation.message);
}

async function versionViolationsFor(
    version: docsYml.RawSchemas.VersionConfig,
    content: unknown,
    product?: docsYml.RawSchemas.InternalProduct
): Promise<string[]> {
    const visitor = await ValidChangelogSlugRule.create({} as RuleContext);
    const versionFileVisitor = visitor.versionFile;
    if (versionFileVisitor == null) {
        throw new Error("Expected the rule to define a `versionFile` visitor");
    }
    const violations = await versionFileVisitor({ path: version.path ?? "", content, version, product });
    return violations.map((violation) => violation.message);
}

describe("CHANGELOG_FEED_ALLOWED_SLUGS", () => {
    it("contains the canonical names", () => {
        expect(CHANGELOG_FEED_ALLOWED_SLUGS).toEqual([
            "blog",
            "blogs",
            "changelog",
            "changelogs",
            "posts",
            "release-notes",
            "releasenotes",
            "whats-new",
            "whatsnew"
        ]);
    });
});

describe("isAllowedChangelogSlug", () => {
    it.each(CHANGELOG_FEED_ALLOWED_SLUGS)("allows %s", (slug) => {
        expect(isAllowedChangelogSlug(slug)).toBe(true);
    });

    it.each([
        "swagger",
        "openapi",
        "asyncapi",
        "manifest",
        "package",
        "feed",
        "news",
        "updates",
        "openapi-changelog",
        "my-release-notes",
        ""
    ])("rejects %s", (slug) => {
        expect(isAllowedChangelogSlug(slug)).toBe(false);
    });
});

describe("getEffectiveChangelogSlugSegments", () => {
    describe("when only title is set", () => {
        it("returns ['changelog'] for the default title", () => {
            expect(getEffectiveChangelogSlugSegments({})).toEqual(["changelog"]);
        });

        it("kebab-cases 'Release Notes' to ['release-notes']", () => {
            expect(getEffectiveChangelogSlugSegments({ title: "Release Notes" })).toEqual(["release-notes"]);
        });

        it("kebab-cases \"What's New\" to ['whats-new']", () => {
            expect(getEffectiveChangelogSlugSegments({ title: "What's New" })).toEqual(["whats-new"]);
        });
    });

    describe("when explicit slug is set", () => {
        it("returns a single-segment slug verbatim", () => {
            expect(getEffectiveChangelogSlugSegments({ slug: "release-notes" })).toEqual(["release-notes"]);
        });

        it("returns each segment for a nested slug", () => {
            expect(getEffectiveChangelogSlugSegments({ slug: "v2/release-notes" })).toEqual(["v2", "release-notes"]);
        });

        it("returns each segment for a deeply nested slug", () => {
            expect(getEffectiveChangelogSlugSegments({ slug: "products/api/v3/changelog" })).toEqual([
                "products",
                "api",
                "v3",
                "changelog"
            ]);
        });

        it("ignores leading/trailing slashes", () => {
            expect(getEffectiveChangelogSlugSegments({ slug: "/release-notes/" })).toEqual(["release-notes"]);
        });

        it("prefers slug over title", () => {
            expect(getEffectiveChangelogSlugSegments({ slug: "release-notes", title: "Some Other Title" })).toEqual([
                "release-notes"
            ]);
        });
    });
});

describe("getEffectiveChangelogSlugLastSegment", () => {
    it("returns the last segment from a nested slug", () => {
        expect(getEffectiveChangelogSlugLastSegment({ slug: "v2/release-notes" })).toBe("release-notes");
    });

    it("returns 'changelog' for the default title", () => {
        expect(getEffectiveChangelogSlugLastSegment({})).toBe("changelog");
    });
});

describe("hasAllowedChangelogSegment", () => {
    it("returns true when the only segment is allowlisted", () => {
        expect(hasAllowedChangelogSegment(["changelog"])).toBe(true);
    });

    it("returns true when the leaf segment is allowlisted", () => {
        expect(hasAllowedChangelogSegment(["v2", "api", "release-notes"])).toBe(true);
    });

    it("returns true when an ancestor segment is allowlisted", () => {
        expect(hasAllowedChangelogSegment(["whats-new", "product-updates"])).toBe(true);
        expect(
            hasAllowedChangelogSegment(["whats-new", "permissions-changelogs", "aws", "aws-source-permissions"])
        ).toBe(true);
        expect(hasAllowedChangelogSegment(["release-notes", "v2", "breaking-changes"])).toBe(true);
    });

    it("returns false when no segment is allowlisted", () => {
        expect(hasAllowedChangelogSegment([])).toBe(false);
        expect(hasAllowedChangelogSegment(["product-updates"])).toBe(false);
        expect(hasAllowedChangelogSegment(["v2", "api", "feed"])).toBe(false);
        expect(hasAllowedChangelogSegment(["openapi-changelog"])).toBe(false);
    });
});

describe("integration: ancestors + changelog", () => {
    it("slug 'blog' is allowlisted", () => {
        expect(hasAllowedChangelogSegment(getEffectiveChangelogSlugSegments({ slug: "blog" }))).toBe(true);
    });

    it("default config (no slug, no title) is allowlisted", () => {
        expect(hasAllowedChangelogSegment(getEffectiveChangelogSlugSegments({}))).toBe(true);
    });

    it("title 'Release Notes' is allowlisted", () => {
        expect(hasAllowedChangelogSegment(getEffectiveChangelogSlugSegments({ title: "Release Notes" }))).toBe(true);
    });

    it("slug 'generative/release-notes' (nested) is allowlisted", () => {
        expect(
            hasAllowedChangelogSegment(getEffectiveChangelogSlugSegments({ slug: "generative/release-notes" }))
        ).toBe(true);
    });

    it("title 'Updates' is NOT allowlisted on its own", () => {
        expect(hasAllowedChangelogSegment(getEffectiveChangelogSlugSegments({ title: "Updates" }))).toBe(false);
    });

    it("title 'Updates' becomes allowlisted under a 'whats-new' tab ancestor", () => {
        const ancestors = ["whats-new"];
        const own = getEffectiveChangelogSlugSegments({ title: "Updates" });
        expect(hasAllowedChangelogSegment([...ancestors, ...own])).toBe(true);
    });

    it("slug 'product-updates' becomes allowlisted under a 'whats-new' tab ancestor", () => {
        const ancestors = ["whats-new"];
        const own = getEffectiveChangelogSlugSegments({ slug: "product-updates" });
        expect(hasAllowedChangelogSegment([...ancestors, ...own])).toBe(true);
    });

    it("slug 'product-updates' becomes allowlisted under a 'blog' tab ancestor", () => {
        const ancestors = ["blog"];
        const own = getEffectiveChangelogSlugSegments({ slug: "product-updates" });
        expect(hasAllowedChangelogSegment([...ancestors, ...own])).toBe(true);
    });

    it("a deeply nested changelog under an allowlisted tab is allowed", () => {
        const ancestors = ["whats-new", "permissions-changelogs", "aws"];
        const own = getEffectiveChangelogSlugSegments({ slug: "aws-source-permissions" });
        expect(hasAllowedChangelogSegment([...ancestors, ...own])).toBe(true);
    });

    it("slug 'feed' under a non-allowlisted tab is NOT allowed", () => {
        const ancestors = ["api"];
        const own = getEffectiveChangelogSlugSegments({ slug: "feed" });
        expect(hasAllowedChangelogSegment([...ancestors, ...own])).toBe(false);
    });
});

describe("blog navigation aliases", () => {
    it("allows a top-level blog navigation item with an allowlisted slug", async () => {
        expect(
            await violationsFor({
                instances: [],
                navigation: [{ blog: "blog", slug: "changelog" }]
            })
        ).toEqual([]);
    });

    it("rejects a top-level blog navigation item with a non-allowlisted slug", async () => {
        const messages = await violationsFor({
            instances: [],
            navigation: [{ blog: "blog", slug: "product-updates" }]
        });
        expect(messages).toHaveLength(1);
        expect(messages[0]).toContain('resolves to URL path "/product-updates"');
    });

    it("uses the Blog default title for an untitled top-level blog navigation item", async () => {
        // The folder name is not part of the URL, so the only reason this resolves
        // to the allowlisted "/blog" is the Blog default title
        expect(
            await violationsFor({
                instances: [],
                navigation: [{ blog: "content/entries" }]
            })
        ).toEqual([]);
    });

    it("allows a tab-level blog navigation item with an allowlisted slug", async () => {
        expect(
            await violationsFor({
                instances: [],
                tabs: {
                    posts: {
                        displayName: "Posts",
                        blog: "blog",
                        slug: "changelog"
                    }
                },
                navigation: [{ tab: "posts" }]
            })
        ).toEqual([]);
    });

    it("rejects a tab-level blog navigation item with a non-allowlisted slug", async () => {
        const messages = await violationsFor({
            instances: [],
            tabs: {
                posts: {
                    displayName: "Posts",
                    blog: "blog",
                    slug: "product-updates"
                }
            },
            navigation: [{ tab: "posts" }]
        });
        expect(messages).toHaveLength(1);
        expect(messages[0]).toContain('resolves to URL path "/product-updates"');
    });

    it("derives a tab-level blog navigation item's slug from the tab displayName", async () => {
        const messages = await violationsFor({
            instances: [],
            tabs: {
                entries: {
                    displayName: "Entries",
                    blog: "content/entries"
                }
            },
            navigation: [{ tab: "entries" }]
        });
        expect(messages).toHaveLength(1);
        expect(messages[0]).toContain('resolves to URL path "/entries"');
    });
});

describe("product and version ancestors", () => {
    const updatesTabContent = {
        tabs: { updates: { "display-name": "Updates", changelog: "../../changelog/release-notes" } },
        navigation: [{ tab: "updates" }]
    };

    it("allows a changelog tab whose product display-name kebab-cases to an allowlisted slug", async () => {
        expect(
            await productViolationsFor(
                { displayName: "Release Notes", path: "./products/release-notes/release-notes.yml" },
                updatesTabContent
            )
        ).toEqual([]);
    });

    it("allows a changelog tab whose explicit product slug is allowlisted", async () => {
        expect(
            await productViolationsFor(
                { displayName: "Updates", slug: "changelog", path: "./products/updates/updates.yml" },
                updatesTabContent
            )
        ).toEqual([]);
    });

    it("rejects a changelog tab when neither the product nor the tab is allowlisted, reporting the full path", async () => {
        const messages = await productViolationsFor(
            { displayName: "Platform", path: "./products/platform/platform.yml" },
            updatesTabContent
        );
        expect(messages).toHaveLength(1);
        expect(messages[0]).toContain('resolves to URL path "/platform/updates"');
    });

    it("allows a changelog under a version whose slug is allowlisted", async () => {
        expect(
            await versionViolationsFor(
                { displayName: "v2", slug: "release-notes", path: "./versions/v2.yml" },
                { navigation: [{ changelog: "./changelog", title: "Updates" }] }
            )
        ).toEqual([]);
    });

    it("rejects a changelog under a version when no segment is allowlisted, reporting the full path", async () => {
        const messages = await versionViolationsFor(
            { displayName: "Legacy", path: "./versions/legacy.yml" },
            { navigation: [{ changelog: "./changelog", title: "Updates" }] }
        );
        expect(messages).toHaveLength(1);
        expect(messages[0]).toContain('resolves to URL path "/legacy/updates"');
    });
});

describe("versions nested under a product", () => {
    const releaseNotesVersion: docsYml.RawSchemas.VersionConfig = {
        displayName: "Release Notes",
        path: "./products/platform/versions/release-notes.yml"
    };
    const platformProduct: docsYml.RawSchemas.InternalProduct = {
        displayName: "Platform",
        path: "./products/platform/platform.yml",
        versions: [releaseNotesVersion]
    };
    const updatesTabContent = {
        tabs: { updates: { "display-name": "Updates", changelog: "../../changelog/release-notes" } },
        navigation: [{ tab: "updates" }]
    };

    it("allows a changelog when the nested version slug is allowlisted but the product slug is not", async () => {
        expect(await versionViolationsFor(releaseNotesVersion, updatesTabContent, platformProduct)).toEqual([]);
    });

    it("allows a changelog when the product slug is allowlisted but the nested version slug is not", async () => {
        const version: docsYml.RawSchemas.VersionConfig = { displayName: "v1", path: "./versions/v1.yml" };
        expect(
            await versionViolationsFor(version, updatesTabContent, {
                displayName: "Changelog",
                path: "./products/changelog/changelog.yml",
                versions: [version]
            })
        ).toEqual([]);
    });

    it("rejects a changelog when neither product, version nor tab is allowlisted, reporting /product/version/tab", async () => {
        const version: docsYml.RawSchemas.VersionConfig = { displayName: "Legacy", path: "./versions/legacy.yml" };
        const messages = await versionViolationsFor(version, updatesTabContent, {
            displayName: "Platform",
            path: "./products/platform/platform.yml",
            versions: [version]
        });
        expect(messages).toHaveLength(1);
        expect(messages[0]).toContain('resolves to URL path "/platform/legacy/updates"');
    });

    it("does not validate the product file's own navigation when the product declares versions", async () => {
        expect(
            await productViolationsFor(
                { displayName: "Platform", path: "./products/platform/platform.yml", versions: [releaseNotesVersion] },
                updatesTabContent
            )
        ).toEqual([]);
    });
});
