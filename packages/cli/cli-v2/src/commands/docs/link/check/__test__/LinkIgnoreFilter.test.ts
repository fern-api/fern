import { describe, expect, it } from "vitest";

import { LinkIgnoreFilter } from "../LinkIgnoreFilter.js";
import type { ResolvedBrokenLink, ResolvedLinkCheckResult } from "../SourceResolver.js";

function link(url: string, statusCode: number | null = 404): ResolvedBrokenLink {
    return { url, statusCode, isInternal: false, references: [{ slug: "/welcome" }] };
}

function result(brokenLinks: ResolvedBrokenLink[], blockedLinks: ResolvedBrokenLink[] = []): ResolvedLinkCheckResult {
    return { totalPages: 1, totalLinks: 10, workingLinks: 5, brokenLinks, blockedLinks, durationMs: 100 };
}

describe("LinkIgnoreFilter", () => {
    it("matches a pattern without wildcards against the full URL only", () => {
        const filter = new LinkIgnoreFilter(["https://vscode.dev/redirect"]);

        expect(filter.isIgnored("https://vscode.dev/redirect")).toBe(true);
        expect(filter.isIgnored("https://vscode.dev/redirect/other")).toBe(false);
        expect(filter.isIgnored("https://vscode.dev")).toBe(false);
    });

    it("treats * as any run of characters, including slashes", () => {
        const filter = new LinkIgnoreFilter(["https://mcp.*.com/*"]);

        expect(filter.isIgnored("https://mcp.docusign.com/mcp")).toBe(true);
        expect(filter.isIgnored("https://mcp.docusign.com/v1/tools/list")).toBe(true);
        expect(filter.isIgnored("https://docs.docusign.com/mcp")).toBe(false);
    });

    it("treats regex characters in a pattern literally", () => {
        const filter = new LinkIgnoreFilter(["https://example.com/callback?code=*"]);

        expect(filter.isIgnored("https://example.com/callback?code=abc")).toBe(true);
        expect(filter.isIgnored("https://exampleXcom/callback?code=abc")).toBe(false);
    });

    it("removes ignored broken and blocked links and counts them", () => {
        const filter = new LinkIgnoreFilter(["https://claude.ai/api/mcp/auth_callback", "https://mcp.docusign.com/*"]);

        const filtered = filter.apply(
            result(
                [link("https://claude.ai/api/mcp/auth_callback", 400), link("https://example.com/missing")],
                [link("https://mcp.docusign.com/mcp", 401)]
            )
        );

        expect(filtered.brokenLinks.map((l) => l.url)).toEqual(["https://example.com/missing"]);
        expect(filtered.blockedLinks).toEqual([]);
        expect(filtered.ignoredLinks).toBe(2);
    });

    it("ignores nothing when no patterns are given", () => {
        const input = result([link("https://example.com/missing")]);

        const filtered = new LinkIgnoreFilter([]).apply(input);

        expect(filtered).toEqual({ ...input, ignoredLinks: 0 });
    });
});
