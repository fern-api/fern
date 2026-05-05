import { describe, expect, it } from "vitest";

import {
    CHANGELOG_FEED_ALLOWED_SLUGS,
    getEffectiveChangelogSlugLastSegment,
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

describe("getEffectiveChangelogSlugLastSegment", () => {
    describe("when only title is set", () => {
        it("returns 'changelog' for the default title", () => {
            expect(getEffectiveChangelogSlugLastSegment({})).toBe("changelog");
        });

        it("kebab-cases 'Changelog'", () => {
            expect(getEffectiveChangelogSlugLastSegment({ title: "Changelog" })).toBe("changelog");
        });

        it("kebab-cases 'Release Notes' to 'release-notes'", () => {
            expect(getEffectiveChangelogSlugLastSegment({ title: "Release Notes" })).toBe("release-notes");
        });

        it("kebab-cases 'ReleaseNotes' to 'release-notes'", () => {
            expect(getEffectiveChangelogSlugLastSegment({ title: "ReleaseNotes" })).toBe("release-notes");
        });

        it("kebab-cases \"What's New\" to 'whats-new'", () => {
            expect(getEffectiveChangelogSlugLastSegment({ title: "What's New" })).toBe("whats-new");
        });

        it("kebab-cases 'What is New' to 'what-is-new' (not allowlisted)", () => {
            expect(getEffectiveChangelogSlugLastSegment({ title: "What is New" })).toBe("what-is-new");
        });
    });

    describe("when explicit slug is set", () => {
        it("returns the slug verbatim for a single-segment slug", () => {
            expect(getEffectiveChangelogSlugLastSegment({ slug: "release-notes" })).toBe("release-notes");
        });

        it("returns the last segment for a nested slug", () => {
            expect(getEffectiveChangelogSlugLastSegment({ slug: "v2/release-notes" })).toBe("release-notes");
        });

        it("returns the last segment for a deeply nested slug", () => {
            expect(getEffectiveChangelogSlugLastSegment({ slug: "products/api/v3/changelog" })).toBe("changelog");
        });

        it("ignores trailing slashes", () => {
            expect(getEffectiveChangelogSlugLastSegment({ slug: "release-notes/" })).toBe("release-notes");
        });

        it("ignores leading slashes", () => {
            expect(getEffectiveChangelogSlugLastSegment({ slug: "/release-notes" })).toBe("release-notes");
        });

        it("prefers slug over title", () => {
            expect(getEffectiveChangelogSlugLastSegment({ slug: "release-notes", title: "Some Other Title" })).toBe(
                "release-notes"
            );
        });
    });

    describe("integrates with isAllowedChangelogSlug", () => {
        it("default config (no slug, no title) is allowlisted", () => {
            expect(isAllowedChangelogSlug(getEffectiveChangelogSlugLastSegment({}))).toBe(true);
        });

        it("title 'Release Notes' is allowlisted", () => {
            expect(isAllowedChangelogSlug(getEffectiveChangelogSlugLastSegment({ title: "Release Notes" }))).toBe(true);
        });

        it("slug 'generative/release-notes' (Ada-style nested) is allowlisted", () => {
            expect(
                isAllowedChangelogSlug(getEffectiveChangelogSlugLastSegment({ slug: "generative/release-notes" }))
            ).toBe(true);
        });

        it("title 'Updates' is NOT allowlisted", () => {
            expect(isAllowedChangelogSlug(getEffectiveChangelogSlugLastSegment({ title: "Updates" }))).toBe(false);
        });

        it("slug 'feed' is NOT allowlisted", () => {
            expect(isAllowedChangelogSlug(getEffectiveChangelogSlugLastSegment({ slug: "feed" }))).toBe(false);
        });
    });
});
