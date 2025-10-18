/**
 * Simple tests to identify gaps in the broken link checker.
 * This focuses on testing the core functions that actually exist.
 */

import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { describe, expect, it } from "vitest";
import { collectLinksAndSources } from "../collect-links";
import { collectPathnamesToCheck } from "../collect-pathnames";

describe("Broken Link Checker - Simple Gap Analysis", () => {
    describe("collectLinksAndSources", () => {
        it("should handle basic markdown links", () => {
            const content = `
# Test Document

[Valid internal link](/docs/overview)
[Broken internal link](/nonexistent-page)
[External HTTP link](http://example.com)
[External HTTPS link](https://example.com)
[Relative link](./relative-file.md)
[Fragment link](#section)
            `;

            const result = collectLinksAndSources({
                content,
                absoluteFilepath: AbsoluteFilePath.of("/test/file.mdx")
            });

            // Should collect all links
            expect(result.links.length).toBeGreaterThan(0);

            const hrefs = result.links.map((link) => link.href);
            expect(hrefs).toContain("/docs/overview");
            expect(hrefs).toContain("/nonexistent-page");
            expect(hrefs).toContain("http://example.com");
            expect(hrefs).toContain("https://example.com");
            expect(hrefs).toContain("./relative-file.md");
            expect(hrefs).toContain("#section");

            // Should have position information
            result.links.forEach((link) => {
                expect(link.position).toBeDefined();
                expect(link.position?.start).toBeDefined();
                expect(link.position?.end).toBeDefined();
            });
        });

        it("should ignore links in code blocks", () => {
            const content = `
Regular [link outside](/outside) should be found.

\`\`\`
Code block [link inside](/inside-fenced) should be ignored.
\`\`\`

\`Inline code [link inside](/inside-inline) should be ignored.\`
            `;

            const result = collectLinksAndSources({
                content,
                absoluteFilepath: AbsoluteFilePath.of("/test/file.mdx")
            });

            const hrefs = result.links.map((link) => link.href);

            // Should find regular links
            expect(hrefs).toContain("/outside");

            // Should NOT find code block links
            expect(hrefs).not.toContain("/inside-fenced");
            expect(hrefs).not.toContain("/inside-inline");
        });

        it("should handle malformed links gracefully", () => {
            const content = `
[Unclosed bracket link(/unclosed
[Missing text]()
[]()
[](empty-text-url)
[Normal link](/normal)
            `;

            // Should not crash on malformed links
            expect(() => {
                const result = collectLinksAndSources({
                    content,
                    absoluteFilepath: AbsoluteFilePath.of("/test/file.mdx")
                });

                // Should still find the normal link
                const hrefs = result.links.map((link) => link.href);
                expect(hrefs).toContain("/normal");
            }).not.toThrow();
        });

        it("should handle reference-style links", () => {
            const content = `
[Reference link][ref1]
[Undefined reference][undefined-ref]

[ref1]: /reference-target
            `;

            const result = collectLinksAndSources({
                content,
                absoluteFilepath: AbsoluteFilePath.of("/test/file.mdx")
            });

            const hrefs = result.links.map((link) => link.href);

            // Should resolve defined references
            expect(hrefs).toContain("/reference-target");

            // Behavior for undefined references may vary
            expect(result.links.length).toBeGreaterThan(0);
        });
    });

    describe("collectPathnamesToCheck", () => {
        it("should classify internal vs external links correctly", () => {
            const content = `
[Internal absolute](/docs/page)
[Internal relative](./page.md)
[External HTTP](http://example.com/page)
[External HTTPS](https://example.com/page)
[Protocol-relative](//example.com/page)
[Fragment only](#fragment)
            `;

            const result = collectPathnamesToCheck(content, {
                instanceUrls: ["https://docs.buildwithfern.com"]
            });

            const pathnames = result.pathnamesToCheck.map((p) => p.pathname);

            // Should include internal links
            expect(pathnames).toContain("/docs/page");
            expect(pathnames).toContain("./page.md");
            expect(pathnames).toContain("#fragment");

            // Should NOT include external links (unless they match instance URLs)
            expect(pathnames).not.toContain("http://example.com/page");
            expect(pathnames).not.toContain("https://example.com/page");
            expect(pathnames).not.toContain("//example.com/page");
        });

        it("should handle instance URL matching", () => {
            const instanceUrls = ["https://docs.buildwithfern.com", "https://custom-domain.com"];

            const content = `
[Instance URL 1](https://docs.buildwithfern.com/page)
[Instance URL 2](https://custom-domain.com/page)
[External URL](https://other-domain.com/page)
            `;

            const result = collectPathnamesToCheck(content, { instanceUrls });
            const pathnames = result.pathnamesToCheck.map((p) => p.pathname);

            // Should include paths from instance URLs
            expect(pathnames).toContain("/page");

            // Should have 2 entries (one for each instance URL match)
            expect(pathnames.filter((p) => p === "/page").length).toBe(2);
        });

        it("should handle empty and edge case URLs", () => {
            const content = `
[Empty link]()
[Just fragment](#)
[Just query](?param=value)
[Whitespace only](   )
[Root path](/)
            `;

            const result = collectPathnamesToCheck(content, {
                instanceUrls: ["https://docs.example.com"]
            });

            // Should handle edge cases without crashing
            expect(result.pathnamesToCheck).toBeDefined();
            expect(result.violations).toBeDefined();

            // Empty paths might be filtered out, but shouldn't crash
            const pathnames = result.pathnamesToCheck.map((p) => p.pathname);
            expect(Array.isArray(pathnames)).toBe(true);
        });

        it("should provide position information for each pathname", () => {
            const content = `Line 1
Line 2 with [first link](/first)
Line 3 with [second link](/second)`;

            const result = collectPathnamesToCheck(content, {
                instanceUrls: ["https://docs.example.com"]
            });

            // Should have position info for each pathname
            result.pathnamesToCheck.forEach((pathname) => {
                expect(pathname.position).toBeDefined();
                expect(pathname.position?.start.line).toBeGreaterThan(0);
                expect(pathname.position?.start.column).toBeGreaterThan(0);
            });

            // Should have correct line numbers
            const firstLink = result.pathnamesToCheck.find((p) => p.pathname === "/first");
            const secondLink = result.pathnamesToCheck.find((p) => p.pathname === "/second");

            expect(firstLink?.position?.start.line).toBe(2);
            expect(secondLink?.position?.start.line).toBe(3);
        });

        it("should handle frontmatter correctly", () => {
            const content = `---
title: Test Page
---

# Test Content

[Link after frontmatter](/test-link)
            `;

            const result = collectPathnamesToCheck(content, {
                instanceUrls: ["https://docs.example.com"]
            });

            // Should find links after frontmatter
            const pathnames = result.pathnamesToCheck.map((p) => p.pathname);
            expect(pathnames).toContain("/test-link");

            // Position should be adjusted for frontmatter
            const link = result.pathnamesToCheck.find((p) => p.pathname === "/test-link");
            expect(link?.position?.start.line).toBeGreaterThan(3); // After frontmatter
        });
    });

    describe("Performance and Edge Cases", () => {
        it("should handle many links efficiently", () => {
            const links = Array(100)
                .fill(0)
                .map((_, i) => `[Link ${i}](/link-${i})`)
                .join("\\n");

            const content = `# Performance Test\\n${links}`;

            const start = performance.now();
            const result = collectLinksAndSources({
                content,
                absoluteFilepath: AbsoluteFilePath.of("/test/large-file.mdx")
            });
            const elapsed = performance.now() - start;

            // Should complete quickly (under 1 second)
            expect(elapsed).toBeLessThan(1000);

            // Should find all links
            expect(result.links.length).toBe(100);
        });

        it("should handle very long link text", () => {
            const longText = "Very long link text ".repeat(100);
            const content = `[${longText}](/long-text-link)`;

            // Should handle long link text without issues
            expect(() => {
                collectLinksAndSources({
                    content,
                    absoluteFilepath: AbsoluteFilePath.of("/test/file.mdx")
                });
            }).not.toThrow();
        });

        it("should handle deeply nested markdown structures", () => {
            const nestedContent = Array(20)
                .fill(0)
                .map((_, i) => `${"  ".repeat(i)}- [Nested link ${i}](/nested-${i})`)
                .join("\\n");

            const content = `# Nested Structure\\n${nestedContent}`;

            // Should handle deep nesting without stack overflow
            expect(() => {
                const result = collectLinksAndSources({
                    content,
                    absoluteFilepath: AbsoluteFilePath.of("/test/nested.mdx")
                });
                expect(result.links.length).toBe(20);
            }).not.toThrow();
        });

        it("should handle Unicode and international characters", () => {
            const content = `
[Link with émojis 🚀](/docs/émojis)
[Chinese characters 中文](/docs/中文)
[Arabic text العربية](/docs/العربية)
            `;

            const result = collectLinksAndSources({
                content,
                absoluteFilepath: AbsoluteFilePath.of("/test/unicode.mdx")
            });

            const hrefs = result.links.map((link) => link.href);
            expect(hrefs).toContain("/docs/émojis");
            expect(hrefs).toContain("/docs/中文");
            expect(hrefs).toContain("/docs/العربية");
        });
    });
});
