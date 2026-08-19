import { describe, expect, it } from "vitest";

import {
    CHANGELOG_FEED_ALLOWED_SLUGS,
    getEffectiveChangelogSlugLastSegment,
    getEffectiveChangelogSlugSegments,
    hasAllowedChangelogSegment,
    isAllowedChangelogSlug
} from "../valid-changelog-slug.js";

describe("CHANGELOG_FEED_ALLOWED_SLUGS", () => {
    it("contains the canonical names", () => {
        expect(CHANGELOG_FEED_ALLOWED_SLUGS).toEqual([
            "changelog",
            "changelogs",
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
