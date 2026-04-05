import { checkMissingRedirects, findRemovedSlugs, type MarkdownEntry } from "../missing-redirects-logic.js";

describe("findRemovedSlugs", () => {
    it("returns empty when published and local are identical", () => {
        const published: MarkdownEntry[] = [
            { pageId: "docs/welcome.mdx", slug: "welcome" },
            { pageId: "docs/guide.mdx", slug: "guide" }
        ];
        const local = new Map([
            ["docs/welcome.mdx", "welcome"],
            ["docs/guide.mdx", "guide"]
        ]);
        expect(findRemovedSlugs(published, local)).toEqual([]);
    });

    it("detects a removed page (pageId absent from local)", () => {
        const published: MarkdownEntry[] = [
            { pageId: "docs/welcome.mdx", slug: "welcome" },
            { pageId: "docs/old-page.mdx", slug: "old-page" }
        ];
        const local = new Map([["docs/welcome.mdx", "welcome"]]);
        const removed = findRemovedSlugs(published, local);
        expect(removed).toEqual([{ pageId: "docs/old-page.mdx", oldSlug: "old-page", newSlug: undefined }]);
    });

    it("detects a moved page (same pageId, different slug)", () => {
        const published: MarkdownEntry[] = [{ pageId: "docs/guide.mdx", slug: "getting-started" }];
        const local = new Map([["docs/guide.mdx", "guides/quickstart"]]);
        const removed = findRemovedSlugs(published, local);
        expect(removed).toEqual([
            { pageId: "docs/guide.mdx", oldSlug: "getting-started", newSlug: "guides/quickstart" }
        ]);
    });

    it("detects multiple removals and moves together", () => {
        const published: MarkdownEntry[] = [
            { pageId: "docs/a.mdx", slug: "a" },
            { pageId: "docs/b.mdx", slug: "b" },
            { pageId: "docs/c.mdx", slug: "c" }
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
        const published: MarkdownEntry[] = [{ pageId: "docs/existing.mdx", slug: "existing" }];
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
