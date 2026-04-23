import {
    checkMissingRedirects,
    findRemovedSlugs,
    keepLatestEntryPerPageId,
    type MarkdownEntry
} from "../missing-redirects-logic.js";

describe("findRemovedSlugs", () => {
    it("returns empty when published and local are identical", () => {
        const published: MarkdownEntry[] = [
            { pageId: "docs/welcome.mdx", slug: "welcome", lastUpdated: "2024-01-01T00:00:00.000Z" },
            { pageId: "docs/guide.mdx", slug: "guide", lastUpdated: "2024-01-01T00:00:00.000Z" }
        ];
        const local = new Map([
            ["docs/welcome.mdx", "welcome"],
            ["docs/guide.mdx", "guide"]
        ]);
        expect(findRemovedSlugs(published, local)).toEqual([]);
    });

    it("detects a removed page (pageId absent from local)", () => {
        const published: MarkdownEntry[] = [
            { pageId: "docs/welcome.mdx", slug: "welcome", lastUpdated: "2024-01-01T00:00:00.000Z" },
            { pageId: "docs/old-page.mdx", slug: "old-page", lastUpdated: "2024-01-01T00:00:00.000Z" }
        ];
        const local = new Map([["docs/welcome.mdx", "welcome"]]);
        const removed = findRemovedSlugs(published, local);
        expect(removed).toEqual([{ pageId: "docs/old-page.mdx", oldSlug: "old-page", newSlug: undefined }]);
    });

    it("detects a moved page (same pageId, different slug)", () => {
        const published: MarkdownEntry[] = [
            { pageId: "docs/guide.mdx", slug: "getting-started", lastUpdated: "2024-01-01T00:00:00.000Z" }
        ];
        const local = new Map([["docs/guide.mdx", "guides/quickstart"]]);
        const removed = findRemovedSlugs(published, local);
        expect(removed).toEqual([
            { pageId: "docs/guide.mdx", oldSlug: "getting-started", newSlug: "guides/quickstart" }
        ]);
    });

    it("detects multiple removals and moves together", () => {
        const published: MarkdownEntry[] = [
            { pageId: "docs/a.mdx", slug: "a", lastUpdated: "2024-01-01T00:00:00.000Z" },
            { pageId: "docs/b.mdx", slug: "b", lastUpdated: "2024-01-01T00:00:00.000Z" },
            { pageId: "docs/c.mdx", slug: "c", lastUpdated: "2024-01-01T00:00:00.000Z" }
        ];
        const local = new Map([
            ["docs/a.mdx", "a"],
            ["docs/b.mdx", "new-b"]
        ]);
        const removed = findRemovedSlugs(published, local);
        expect(removed).toHaveLength(2);
        expect(removed).toContainEqual({ pageId: "docs/b.mdx", oldSlug: "b", newSlug: "new-b" });
        expect(removed).toContainEqual({ pageId: "docs/c.mdx", oldSlug: "c", newSlug: undefined });
    });

    it("ignores new pages that only exist locally", () => {
        const published: MarkdownEntry[] = [
            { pageId: "docs/existing.mdx", slug: "existing", lastUpdated: "2024-01-01T00:00:00.000Z" }
        ];
        const local = new Map([
            ["docs/existing.mdx", "existing"],
            ["docs/brand-new.mdx", "brand-new"]
        ]);
        expect(findRemovedSlugs(published, local)).toEqual([]);
    });

    it("returns empty for empty published entries (first publish)", () => {
        const local = new Map([["docs/welcome.mdx", "welcome"]]);
        expect(findRemovedSlugs([], local)).toEqual([]);
    });

    it("skips removed page when another local page still serves the same slug", () => {
        const published: MarkdownEntry[] = [
            { pageId: "docs/welcome.mdx", slug: "welcome", lastUpdated: "2024-01-01T00:00:00.000Z" },
            { pageId: "changelog/2024-01-15.mdx", slug: "changelog", lastUpdated: "2024-01-01T00:00:00.000Z" }
        ];
        const local = new Map([
            ["docs/welcome.mdx", "welcome"],
            ["changelog/overview.mdx", "changelog"]
        ]);
        expect(findRemovedSlugs(published, local)).toEqual([]);
    });

    it("skips moved page when another local page still serves the old slug", () => {
        const published: MarkdownEntry[] = [
            { pageId: "docs/guide.mdx", slug: "shared-slug", lastUpdated: "2024-01-01T00:00:00.000Z" }
        ];
        const local = new Map([
            ["docs/guide.mdx", "new-slug"],
            ["docs/other.mdx", "shared-slug"]
        ]);
        expect(findRemovedSlugs(published, local)).toEqual([]);
    });

    it("skips changelog entries that share their parent slug when entry is removed", () => {
        const published: MarkdownEntry[] = [
            {
                pageId: "changelog/2024-01-15.mdx",
                slug: "whats-new/changelog",
                lastUpdated: "2024-01-01T00:00:00.000Z"
            },
            {
                pageId: "changelog/2024-01-15-hotfix.mdx",
                slug: "whats-new/changelog",
                lastUpdated: "2024-01-01T00:00:00.000Z"
            },
            { pageId: "changelog/2024-02-01.mdx", slug: "whats-new/changelog", lastUpdated: "2024-01-01T00:00:00.000Z" }
        ];
        const local = new Map([["changelog/2024-02-01.mdx", "whats-new/changelog"]]);
        expect(findRemovedSlugs(published, local)).toEqual([]);
    });

    it("skips published entries with empty slug when landing page serves root", () => {
        const published: MarkdownEntry[] = [
            { pageId: "changelog/2024-01-15.mdx", slug: "", lastUpdated: "2024-01-01T00:00:00.000Z" }
        ];
        const local = new Map([["pages/landing.mdx", ""]]);
        expect(findRemovedSlugs(published, local)).toEqual([]);
    });

    it("still flags removed page when no local page serves the old slug", () => {
        const published: MarkdownEntry[] = [
            { pageId: "docs/old.mdx", slug: "unique-old-slug", lastUpdated: "2024-01-01T00:00:00.000Z" }
        ];
        const local = new Map([["docs/new.mdx", "different-slug"]]);
        const removed = findRemovedSlugs(published, local);
        expect(removed).toEqual([{ pageId: "docs/old.mdx", oldSlug: "unique-old-slug", newSlug: undefined }]);
    });
});

describe("checkMissingRedirects", () => {
    it("returns a violation for a removed page without redirect", () => {
        const violations = checkMissingRedirects(
            [{ pageId: "docs/old.mdx", oldSlug: "old-page", newSlug: undefined }],
            [],
            undefined
        );
        expect(violations).toHaveLength(1);
        expect(violations[0]?.severity).toBe("warning");
        expect(violations[0]?.message).toContain("was removed");
        expect(violations[0]?.message).toContain("/old-page");
    });

    it("returns a violation for a moved page without redirect", () => {
        const violations = checkMissingRedirects(
            [{ pageId: "docs/guide.mdx", oldSlug: "getting-started", newSlug: "guides/quickstart" }],
            [],
            undefined
        );
        expect(violations).toHaveLength(1);
        expect(violations[0]?.severity).toBe("warning");
        expect(violations[0]?.message).toContain("was moved");
        expect(violations[0]?.message).toContain("/getting-started");
        expect(violations[0]?.message).toContain("/guides/quickstart");
    });

    it("suppresses violation when an exact redirect covers the old slug", () => {
        const violations = checkMissingRedirects(
            [{ pageId: "docs/guide.mdx", oldSlug: "getting-started", newSlug: "guides/quickstart" }],
            [{ source: "/getting-started", destination: "/guides/quickstart" }],
            undefined
        );
        expect(violations).toEqual([]);
    });

    it("suppresses violation when a wildcard redirect covers the old slug", () => {
        const violations = checkMissingRedirects(
            [{ pageId: "docs/guide.mdx", oldSlug: "old/guide", newSlug: "new/guide" }],
            [{ source: "/old/:path*", destination: "/new/:path*" }],
            undefined
        );
        expect(violations).toEqual([]);
    });

    it("does not suppress when redirect source does not match", () => {
        const violations = checkMissingRedirects(
            [{ pageId: "docs/guide.mdx", oldSlug: "getting-started", newSlug: "guides/quickstart" }],
            [{ source: "/unrelated", destination: "/somewhere" }],
            undefined
        );
        expect(violations).toHaveLength(1);
    });

    it("handles basePath by prepending it to redirect sources", () => {
        const violations = checkMissingRedirects(
            [{ pageId: "docs/guide.mdx", oldSlug: "/docs/getting-started", newSlug: "/docs/quickstart" }],
            [{ source: "/getting-started", destination: "/quickstart" }],
            "/docs"
        );
        expect(violations).toEqual([]);
    });

    it("produces violations for multiple uncovered removals", () => {
        const violations = checkMissingRedirects(
            [
                { pageId: "docs/a.mdx", oldSlug: "page-a", newSlug: undefined },
                { pageId: "docs/b.mdx", oldSlug: "page-b", newSlug: "new-b" }
            ],
            [],
            undefined
        );
        expect(violations).toHaveLength(2);
        expect(violations[0]?.message).toContain("was removed");
        expect(violations[1]?.message).toContain("was moved");
    });

    it("returns empty when all removed slugs are covered by redirects", () => {
        const violations = checkMissingRedirects(
            [
                { pageId: "docs/a.mdx", oldSlug: "page-a", newSlug: undefined },
                { pageId: "docs/b.mdx", oldSlug: "page-b", newSlug: "new-b" }
            ],
            [
                { source: "/page-a", destination: "/somewhere" },
                { source: "/page-b", destination: "/new-b" }
            ],
            undefined
        );
        expect(violations).toEqual([]);
    });

    it("returns empty for empty removed slugs", () => {
        expect(checkMissingRedirects([], [], undefined)).toEqual([]);
    });

    it("violation message suggests the correct redirect for a moved page", () => {
        const violations = checkMissingRedirects(
            [{ pageId: "docs/guide.mdx", oldSlug: "old-path", newSlug: "new-path" }],
            [],
            undefined
        );
        expect(violations).toHaveLength(1);
        expect(violations[0]?.message).toContain('source: "/old-path"');
        expect(violations[0]?.message).toContain('destination: "/new-path"');
    });
});

describe("keepLatestEntryPerPageId", () => {
    it("returns empty for empty input", () => {
        expect(keepLatestEntryPerPageId([])).toEqual([]);
    });

    it("passes through rows that already have unique pageIds", () => {
        const entries: MarkdownEntry[] = [
            { pageId: "a.mdx", slug: "a", lastUpdated: "2024-01-01T00:00:00.000Z" },
            { pageId: "b.mdx", slug: "b", lastUpdated: "2024-02-01T00:00:00.000Z" }
        ];
        expect(keepLatestEntryPerPageId(entries)).toEqual(entries);
    });

    it("keeps only the row with the highest lastUpdated per pageId", () => {
        const entries: MarkdownEntry[] = [
            { pageId: "a.mdx", slug: "old", lastUpdated: "2024-01-01T00:00:00.000Z" },
            { pageId: "a.mdx", slug: "new", lastUpdated: "2024-03-01T00:00:00.000Z" },
            { pageId: "a.mdx", slug: "middle", lastUpdated: "2024-02-01T00:00:00.000Z" }
        ];
        expect(keepLatestEntryPerPageId(entries)).toEqual([
            { pageId: "a.mdx", slug: "new", lastUpdated: "2024-03-01T00:00:00.000Z" }
        ]);
    });

    it("dedupes per pageId across many pages independently", () => {
        const entries: MarkdownEntry[] = [
            { pageId: "a.mdx", slug: "a-old", lastUpdated: "2024-01-01T00:00:00.000Z" },
            { pageId: "a.mdx", slug: "a-new", lastUpdated: "2024-02-01T00:00:00.000Z" },
            { pageId: "b.mdx", slug: "b-old", lastUpdated: "2024-01-15T00:00:00.000Z" },
            { pageId: "b.mdx", slug: "b-new", lastUpdated: "2024-04-01T00:00:00.000Z" },
            { pageId: "c.mdx", slug: "c-only", lastUpdated: "2023-12-01T00:00:00.000Z" }
        ];
        const result = keepLatestEntryPerPageId(entries);
        expect(result).toHaveLength(3);
        expect(result).toContainEqual({ pageId: "a.mdx", slug: "a-new", lastUpdated: "2024-02-01T00:00:00.000Z" });
        expect(result).toContainEqual({ pageId: "b.mdx", slug: "b-new", lastUpdated: "2024-04-01T00:00:00.000Z" });
        expect(result).toContainEqual({ pageId: "c.mdx", slug: "c-only", lastUpdated: "2023-12-01T00:00:00.000Z" });
    });

    it("is order-independent on the input", () => {
        const entries: MarkdownEntry[] = [
            { pageId: "a.mdx", slug: "old", lastUpdated: "2024-01-01T00:00:00.000Z" },
            { pageId: "a.mdx", slug: "new", lastUpdated: "2024-03-01T00:00:00.000Z" }
        ];
        const reversed = [...entries].reverse();
        expect(keepLatestEntryPerPageId(reversed)).toEqual([
            { pageId: "a.mdx", slug: "new", lastUpdated: "2024-03-01T00:00:00.000Z" }
        ]);
    });
});

describe("integration: keepLatestEntryPerPageId + findRemovedSlugs", () => {
    it("emits zero warnings when every stale row's pageId is at its latest slug locally", () => {
        // Simulates the Close case: the slug table has accumulated multiple
        // historical (pageId, slug) rows per pageId from past nav restructurings,
        // but the customer has not changed anything since the most recent publish.
        // After dedup, findRemovedSlugs should see one row per pageId at the
        // current slug and produce zero warnings.
        const published: MarkdownEntry[] = [
            {
                pageId: "docs/api-clients.md",
                slug: "api-reference/getting-started/api-clients",
                lastUpdated: "2022-01-01T00:00:00.000Z"
            },
            {
                pageId: "docs/api-clients.md",
                slug: "api/getting-started/api-clients",
                lastUpdated: "2023-06-01T00:00:00.000Z"
            },
            {
                pageId: "docs/api-clients.md",
                slug: "api/overview/api-clients",
                lastUpdated: "2024-12-01T00:00:00.000Z"
            },
            {
                pageId: "docs/intro.md",
                slug: "api-reference/getting-started/introduction",
                lastUpdated: "2022-01-01T00:00:00.000Z"
            },
            { pageId: "docs/intro.md", slug: "api/overview", lastUpdated: "2024-12-01T00:00:00.000Z" }
        ];
        const local = new Map([
            ["docs/api-clients.md", "api/overview/api-clients"],
            ["docs/intro.md", "api/overview"]
        ]);

        const deduped = keepLatestEntryPerPageId(published);
        const removed = findRemovedSlugs(deduped, local);

        expect(removed).toEqual([]);
    });

    it("flags only the most recent slug when there are stale rows AND a real slug change", () => {
        // The customer restructured the nav multiple times historically (all those
        // old slugs linger as stale rows in FDR). They have also just moved a page
        // one more time locally, without publishing yet. We want exactly ONE
        // warning about the latest transition — not additional warnings for each
        // ancient slug.
        const published: MarkdownEntry[] = [
            { pageId: "docs/guide.md", slug: "v1/guide", lastUpdated: "2022-01-01T00:00:00.000Z" },
            { pageId: "docs/guide.md", slug: "v2/guide", lastUpdated: "2023-01-01T00:00:00.000Z" },
            { pageId: "docs/guide.md", slug: "v3/guide", lastUpdated: "2024-06-01T00:00:00.000Z" }
        ];
        const local = new Map([["docs/guide.md", "v4/guide"]]);

        const deduped = keepLatestEntryPerPageId(published);
        const removed = findRemovedSlugs(deduped, local);

        expect(removed).toEqual([{ pageId: "docs/guide.md", oldSlug: "v3/guide", newSlug: "v4/guide" }]);
    });

    it("flags the most recent slug when a pageId is removed entirely, ignoring stale history", () => {
        // Similar to above but the page is fully gone locally, not just moved.
        // Expect one warning about the most recent slug, not N warnings.
        const published: MarkdownEntry[] = [
            { pageId: "docs/deprecated.md", slug: "v1/deprecated", lastUpdated: "2022-01-01T00:00:00.000Z" },
            { pageId: "docs/deprecated.md", slug: "v2/deprecated", lastUpdated: "2023-01-01T00:00:00.000Z" },
            { pageId: "docs/deprecated.md", slug: "v3/deprecated", lastUpdated: "2024-06-01T00:00:00.000Z" }
        ];
        const local = new Map<string, string>();

        const deduped = keepLatestEntryPerPageId(published);
        const removed = findRemovedSlugs(deduped, local);

        expect(removed).toEqual([{ pageId: "docs/deprecated.md", oldSlug: "v3/deprecated", newSlug: undefined }]);
    });

    it("emits zero warnings for a changelog whose parent slug has been renamed over time", () => {
        // Direct analogue of Close's changelog situation: one row per entry per
        // historical parent slug (api-reference/getting-started/changelog →
        // api/getting-started/changelog → api/overview/changelog). Each row
        // has a distinct pageId, so dedup alone doesn't collapse them — but
        // the findRemovedSlugs activeSlugs skip does, because the current
        // parent slug serves all entries.
        const published: MarkdownEntry[] = [
            {
                pageId: "changelog/2024-01.mdx",
                slug: "api-reference/getting-started/changelog",
                lastUpdated: "2022-01-01T00:00:00.000Z"
            },
            {
                pageId: "changelog/2024-01.mdx",
                slug: "api/getting-started/changelog",
                lastUpdated: "2023-06-01T00:00:00.000Z"
            },
            {
                pageId: "changelog/2024-01.mdx",
                slug: "api/overview/changelog",
                lastUpdated: "2024-12-01T00:00:00.000Z"
            },
            {
                pageId: "changelog/2024-02.mdx",
                slug: "api/getting-started/changelog",
                lastUpdated: "2023-06-01T00:00:00.000Z"
            },
            { pageId: "changelog/2024-02.mdx", slug: "api/overview/changelog", lastUpdated: "2024-12-01T00:00:00.000Z" }
        ];
        const local = new Map([
            ["changelog/2024-01.mdx", "api/overview/changelog"],
            ["changelog/2024-02.mdx", "api/overview/changelog"]
        ]);

        const deduped = keepLatestEntryPerPageId(published);
        const removed = findRemovedSlugs(deduped, local);

        expect(removed).toEqual([]);
    });

    it("handles a mix of stable pages, stale-only pages, and a real change in one table", () => {
        // Realistic mixed scenario: most pages are stable, some have stale rows
        // at their current slug (no-op), one page has a genuine pending move.
        // The rule should fire exactly one warning — for the genuine move.
        const published: MarkdownEntry[] = [
            // Stable page, one row.
            { pageId: "docs/a.md", slug: "a", lastUpdated: "2024-12-01T00:00:00.000Z" },
            // Stable page but with historical stale rows.
            { pageId: "docs/b.md", slug: "old-b", lastUpdated: "2022-01-01T00:00:00.000Z" },
            { pageId: "docs/b.md", slug: "b", lastUpdated: "2024-12-01T00:00:00.000Z" },
            // Pending move: last published slug is "c", but local has moved it to "new-c".
            { pageId: "docs/c.md", slug: "ancient-c", lastUpdated: "2022-01-01T00:00:00.000Z" },
            { pageId: "docs/c.md", slug: "c", lastUpdated: "2024-06-01T00:00:00.000Z" }
        ];
        const local = new Map([
            ["docs/a.md", "a"],
            ["docs/b.md", "b"],
            ["docs/c.md", "new-c"]
        ]);

        const deduped = keepLatestEntryPerPageId(published);
        const removed = findRemovedSlugs(deduped, local);

        expect(removed).toEqual([{ pageId: "docs/c.md", oldSlug: "c", newSlug: "new-c" }]);
    });
});
