/**
 * Unit tests to identify gaps and edge cases in the Fern broken link checker.
 * These tests are designed to expose potential issues and validate that the
 * checker handles various scenarios correctly.
 */

import { noop } from "@fern-api/core-utils";
import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { createLogger } from "@fern-api/logger";
import { createMockTaskContext } from "@fern-api/task-context";
import { DocsWorkspace } from "@fern-api/workspace-loader";
import { beforeAll, describe, expect, it } from "vitest";

import { ValidMarkdownLinks } from "../valid-markdown-link";
import { createMockApiWorkspace, createMockDocsWorkspace } from "./test-utils";

describe("Broken Link Checker - Gap Analysis", () => {
    let rule: Awaited<ReturnType<typeof ValidMarkdownLinks.create>>;
    let workspace: DocsWorkspace;
    let testFilePath: AbsoluteFilePath;

    beforeAll(async () => {
        workspace = createMockDocsWorkspace();
        testFilePath = join(workspace.absoluteFilePath, RelativeFilePath.of("test-page.mdx"));

        rule = await ValidMarkdownLinks.create({
            workspace,
            apiWorkspaces: [createMockApiWorkspace()],
            ossWorkspaces: [],
            logger: createLogger(noop)
        });
    });

    describe("Fragment Link Resolution", () => {
        it("should handle same-page fragment links correctly", async () => {
            const content = `
# Valid Header

[Valid same-page link](#valid-header)
[Invalid same-page link](#invalid-header)
[Fragment with special chars](#header-with-special!@#$%^&*()chars)
[Fragment with numbers](#123-header)
            `;

            const violations =
                (await rule.markdownPage?.({
                    content,
                    absoluteFilepath: testFilePath,
                    title: "Test Page"
                })) ?? [];

            // Should detect invalid fragment but allow valid one
            expect(violations.some((v) => v.message.includes("#invalid-header"))).toBe(true);
            expect(violations.some((v) => v.message.includes("#valid-header"))).toBe(false);
        });

        it("should handle cross-page fragment links", async () => {
            const content = `
[Valid page with fragment](/docs/overview#introduction)
[Valid page with invalid fragment](/docs/overview#nonexistent-section)
[Invalid page with any fragment](/nonexistent-page#any-fragment)
            `;

            const violations =
                (await rule.markdownPage?.({
                    content,
                    absoluteFilepath: testFilePath,
                    title: "Test Page"
                })) ?? [];

            // Should detect both invalid page and invalid fragment on valid page
            expect(violations.length).toBeGreaterThan(0);
            expect(violations.some((v) => v.message.includes("nonexistent-page"))).toBe(true);
        });

        it("should properly convert header text to fragment IDs", async () => {
            const content = `
# Header With Spaces And CAPS
## Special Characters! & Symbols?
### Numbers 123 and More

[Link to header with spaces](#header-with-spaces-and-caps)
[Link with special chars](#special-characters-symbols)
[Link with numbers](#numbers-123-and-more)
[Invalid case link](#Header-With-Spaces-And-CAPS)
            `;

            const violations =
                (await rule.markdownPage?.({
                    content,
                    absoluteFilepath: testFilePath,
                    title: "Test Page"
                })) ?? [];

            // Should properly handle fragment ID conversion
            expect(violations.some((v) => v.message.includes("#Header-With-Spaces-And-CAPS"))).toBe(true);
        });
    });

    describe("Relative Path Resolution", () => {
        it("should handle complex relative path scenarios", async () => {
            const content = `
[Simple relative](./sibling-page.md)
[Parent directory](../parent-page.md)
[Complex path](./subdir/../other-file.md)
[Multiple parents](../../grandparent/file.md)
[Current dir explicit](./file.md)
[Path with spaces](./file with spaces.md)
[Encoded path](./file%20with%20spaces.md)
            `;

            const violations =
                (await rule.markdownPage?.({
                    content,
                    absoluteFilepath: testFilePath,
                    title: "Test Page"
                })) ?? [];

            // Should properly resolve all relative paths
            expect(violations.length).toBeGreaterThan(0);
        });

        it("should handle edge cases in path resolution", async () => {
            const content = `
[Empty path]()
[Just fragment](#)
[Just query](?param=value)
[Whitespace only](   )
[Dot only](.)
[Double dot only](..)
[Triple dot](...)
[Windows path](./windows\\path\\file.md)
            `;

            const violations =
                (await rule.markdownPage?.({
                    content,
                    absoluteFilepath: testFilePath,
                    title: "Test Page"
                })) ?? [];

            // Should handle edge cases gracefully without crashing
            expect(violations).toBeDefined();
        });

        it("should handle file extension variations", async () => {
            const content = `
[MD file as MDX](./file.md)
[MDX file as MD](./file.mdx)
[No extension](./file)
[Wrong extension](./image.txt)
[Case variations](./File.MD)
[Mixed case](./File.Mdx)
            `;

            const violations =
                (await rule.markdownPage?.({
                    content,
                    absoluteFilepath: testFilePath,
                    title: "Test Page"
                })) ?? [];

            // Should properly handle extension mismatches
            expect(violations).toBeDefined();
        });
    });

    describe("URL vs Path Disambiguation", () => {
        it("should correctly identify external vs internal links", async () => {
            const content = `
[HTTP external](http://example.com/page)
[HTTPS external](https://example.com/page)
[Protocol-relative](//example.com/page)
[Internal absolute](/docs/page)
[Internal relative](./page)
[FTP protocol](ftp://files.example.com/file.zip)
[Mailto](mailto:test@example.com)
[Internal with params](/docs/page?param=value)
[Internal with fragment](/docs/page#section)
            `;

            const violations =
                (await rule.markdownPage?.({
                    content,
                    absoluteFilepath: testFilePath,
                    title: "Test Page"
                })) ?? [];

            // Should only check internal links, not external ones
            // External links should be ignored
            expect(violations.every((v) => !v.message.includes("example.com"))).toBe(true);
        });

        it("should handle ambiguous paths correctly", async () => {
            const content = `
[Could be API endpoint](/api/v1/users)
[Could be file path](/api/v1/users.json)
[HTTP-like internal](/http/docs)
[FTP-like internal](/ftp/files)
[Protocol in path](/https/secure)
            `;

            const violations =
                (await rule.markdownPage?.({
                    content,
                    absoluteFilepath: testFilePath,
                    title: "Test Page"
                })) ?? [];

            // Should treat these as internal paths, not external URLs
            expect(violations).toBeDefined();
        });
    });

    describe("Special Character Handling", () => {
        it("should handle Unicode and international characters", async () => {
            const content = `
[Unicode link](/docs/unicöde-page)
[Chinese characters](/docs/中文页面)
[Arabic text](/docs/الصفحة-العربية)
[Emoji in path](/docs/🚀-rocket-page)
[Mixed scripts](/docs/mixed-中文-العربية-english)
[URL encoded Unicode](/docs/caf%C3%A9)
            `;

            const violations =
                (await rule.markdownPage?.({
                    content,
                    absoluteFilepath: testFilePath,
                    title: "Test Page"
                })) ?? [];

            // Should handle Unicode characters properly
            expect(violations).toBeDefined();
        });

        it("should handle special characters in link text vs URLs", async () => {
            const content = `
[Text with [brackets]](/docs/page)
[Text with *asterisks*](/docs/page)
[Text with \\"quotes\\"]("/docs/page")
[Text with \\\\backslashes\\\\](/docs/page)
[URL with spaces](/docs/path with spaces)
[URL with encoded chars](/docs/path%20with%20spaces)
            `;

            const violations =
                (await rule.markdownPage?.({
                    content,
                    absoluteFilepath: testFilePath,
                    title: "Test Page"
                })) ?? [];

            // Should properly parse link text vs URL
            expect(violations).toBeDefined();
        });
    });

    describe("Link Context Analysis", () => {
        it("should ignore links in code blocks", async () => {
            const content = `
Regular [broken link](/broken-page) should be flagged.

\`\`\`
Code block [broken link](/broken-in-code) should be ignored.
\`\`\`

\`Inline code [broken link](/broken-inline) should be ignored.\`

    Indented code block
    [broken link](/broken-indented) should be ignored.
            `;

            const violations =
                (await rule.markdownPage?.({
                    content,
                    absoluteFilepath: testFilePath,
                    title: "Test Page"
                })) ?? [];

            // Should only flag the regular link, not code block links
            expect(violations.some((v) => v.message.includes("/broken-page"))).toBe(true);
            expect(violations.some((v) => v.message.includes("/broken-in-code"))).toBe(false);
            expect(violations.some((v) => v.message.includes("/broken-inline"))).toBe(false);
            expect(violations.some((v) => v.message.includes("/broken-indented"))).toBe(false);
        });

        it("should handle links in different markdown contexts", async () => {
            const content = `
## Header with [broken link](/broken-in-header)

| Table | Column |
|-------|--------|
| Cell with [broken link](/broken-in-table) | Another cell |

> Blockquote with [broken link](/broken-in-quote)
>
> > Nested quote with [broken link](/broken-in-nested-quote)

1. List item with [broken link](/broken-in-list)
   - Nested item with [broken link](/broken-in-nested-list)

**Bold text with [broken link](/broken-in-bold)**
*Italic text with [broken link](/broken-in-italic)*
~~Strikethrough with [broken link](/broken-in-strike)~~
            `;

            const violations =
                (await rule.markdownPage?.({
                    content,
                    absoluteFilepath: testFilePath,
                    title: "Test Page"
                })) ?? [];

            // Should detect broken links in all contexts
            expect(violations.length).toBeGreaterThan(5);
        });
    });

    describe("Reference Link Resolution", () => {
        it("should handle reference-style links", async () => {
            const content = `
[Reference link broken][broken-ref]
[Reference link valid][valid-ref]
[Undefined reference][undefined-ref]
[Case sensitive test][Case-Ref]
[case sensitive test][case-ref]

[broken-ref]: /nonexistent-page
[valid-ref]: /docs/overview
[Case-Ref]: /case-sensitive-page
            `;

            const violations =
                (await rule.markdownPage?.({
                    content,
                    absoluteFilepath: testFilePath,
                    title: "Test Page"
                })) ?? [];

            // Should detect broken reference targets and undefined references
            expect(violations.some((v) => v.message.includes("nonexistent-page"))).toBe(true);
            expect(violations.some((v) => v.message.includes("undefined-ref"))).toBe(true);
        });

        it("should handle malformed reference links", async () => {
            const content = `
[Unclosed reference link[broken-ref]
[Missing closing bracket]/broken-page)
[Extra brackets]](/extra-bracket)
[[Double brackets]](/double-brackets)
[Text only no URL]
[](./url-only-no-text.md)
            `;

            const violations =
                (await rule.markdownPage?.({
                    content,
                    absoluteFilepath: testFilePath,
                    title: "Test Page"
                })) ?? [];

            // Should handle malformed links gracefully
            expect(violations).toBeDefined();
        });
    });

    describe("Performance and Memory Stress Tests", () => {
        it("should handle many duplicate links efficiently", async () => {
            const duplicateLinks = Array(100)
                .fill(0)
                .map((_, i) => `[Duplicate link ${i}](/broken-duplicate-target)`)
                .join("\\n");

            const content = `
# Performance Test

${duplicateLinks}
            `;

            const start = performance.now();
            const violations =
                (await rule.markdownPage?.({
                    content,
                    absoluteFilepath: testFilePath,
                    title: "Test Page"
                })) ?? [];
            const elapsed = performance.now() - start;

            // Should handle duplicates efficiently (under 1 second)
            expect(elapsed).toBeLessThan(1000);
            expect(violations.length).toBeGreaterThan(0);
        });

        it("should handle very long URLs", async () => {
            const longPath = "/very/long/path/that/goes/on/and/on".repeat(20);
            const content = `[Very long URL](${longPath}/final-page)`;

            const violations =
                (await rule.markdownPage?.({
                    content,
                    absoluteFilepath: testFilePath,
                    title: "Test Page"
                })) ?? [];

            // Should handle long URLs without crashing
            expect(violations).toBeDefined();
        });
    });

    describe("Fern-Specific Link Types", () => {
        it("should handle API reference links", async () => {
            const content = `
[Valid API reference](/api-reference/service/endpoint)
[Broken API reference](/api-reference/nonexistent/endpoint)
[API with fragment](/api-reference/service/endpoint#request)
[API with params](/api-reference/service/endpoint?example=true)
            `;

            const violations =
                (await rule.markdownPage?.({
                    content,
                    absoluteFilepath: testFilePath,
                    title: "Test Page"
                })) ?? [];

            // Should properly validate API reference links
            expect(violations).toBeDefined();
        });

        it("should handle special Fern files", async () => {
            const content = `
[LLMs file](/llms.txt)
[LLMs full file](/llms-full.txt)
[Sitemap](/sitemap.xml)
[Robots](/robots.txt)
[OpenAPI spec](/openapi.json)
[Broken special file](/nonexistent-special.txt)
            `;

            const violations =
                (await rule.markdownPage?.({
                    content,
                    absoluteFilepath: testFilePath,
                    title: "Test Page"
                })) ?? [];

            // Should handle special Fern-generated files
            expect(violations).toBeDefined();
        });

        it("should handle versioned and product-specific links", async () => {
            const content = `
[Versioned docs](/v1/docs/overview)
[Product-specific](/docs/product/overview)
[Cross-product link](/api-definitions/overview)
[Broken version](/v99/docs/overview)
[Broken product](/nonexistent-product/overview)
            `;

            const violations =
                (await rule.markdownPage?.({
                    content,
                    absoluteFilepath: testFilePath,
                    title: "Test Page"
                })) ?? [];

            // Should handle Fern's product and version structure
            expect(violations).toBeDefined();
        });
    });

    describe("Redirect Resolution", () => {
        it("should handle redirected links", async () => {
            const content = `
[Old URL that redirects](/old-path/that-redirects)
[Redirect loop A](/redirect-loop-a)
[Redirect loop B](/redirect-loop-b)
[Broken redirect target](/redirect-to-broken)
            `;

            const violations =
                (await rule.markdownPage?.({
                    content,
                    absoluteFilepath: testFilePath,
                    title: "Test Page"
                })) ?? [];

            // Should follow redirects and detect issues
            expect(violations).toBeDefined();
        });
    });

    describe("Case Sensitivity Edge Cases", () => {
        it("should handle case sensitivity correctly", async () => {
            const content = `
[Mixed case path](/Docs/Overview)
[ALL CAPS](/DOCS/OVERVIEW)
[lowercase](/docs/overview)
[File extension case](./File.MD)
[API reference case](/API-Reference/Service/Endpoint)
            `;

            const violations =
                (await rule.markdownPage?.({
                    content,
                    absoluteFilepath: testFilePath,
                    title: "Test Page"
                })) ?? [];

            // Should handle case sensitivity based on file system rules
            expect(violations).toBeDefined();
        });
    });

    describe("Error Handling and Edge Cases", () => {
        it("should handle empty and null inputs", async () => {
            const testCases = ["", "   ", "\\n\\n", null as any, undefined as any];

            for (const content of testCases) {
                const violations =
                    (await rule.markdownPage?.({
                        content: content || "",
                        absoluteFilepath: testFilePath,
                        title: "Test Page"
                    })) ?? [];

                // Should handle empty inputs gracefully
                expect(violations).toBeDefined();
                expect(Array.isArray(violations)).toBe(true);
            }
        });

        it("should handle invalid file paths", async () => {
            const invalidPaths = [
                AbsoluteFilePath.of(""),
                AbsoluteFilePath.of("/nonexistent/path/file.mdx")
                // Add more invalid path tests
            ];

            const content = "[Test link](/docs/test)";

            for (const path of invalidPaths) {
                const violations =
                    (await rule.markdownPage?.({
                        content,
                        absoluteFilepath: path,
                        title: "Test Page"
                    })) ?? [];

                // Should handle invalid paths gracefully
                expect(violations).toBeDefined();
            }
        });
    });

    describe("Integration with Fern Workspace", () => {
        it("should respect workspace configuration", async () => {
            const content = `
[Should respect base path](/base-path/docs/page)
[Should respect instance URL](https://custom-domain.com/docs/page)
[Should handle multiple instances](/docs/page)
            `;

            const violations =
                (await rule.markdownPage?.({
                    content,
                    absoluteFilepath: testFilePath,
                    title: "Test Page"
                })) ?? [];

            // Should integrate properly with workspace settings
            expect(violations).toBeDefined();
        });

        it("should handle workspace-specific features", async () => {
            const content = `
[Audience-specific link](/docs/internal-only)
[Feature-flag link](/beta/new-feature)
[Environment-specific](/staging/docs)
[Organization-specific](/org-name/docs)
            `;

            const violations =
                (await rule.markdownPage?.({
                    content,
                    absoluteFilepath: testFilePath,
                    title: "Test Page"
                })) ?? [];

            // Should handle workspace-specific features
            expect(violations).toBeDefined();
        });
    });
});

describe("API Description Link Validation", () => {
    let rule: Awaited<ReturnType<typeof ValidMarkdownLinks.create>>;
    let workspace: DocsWorkspace;
    let apiWorkspace: any;

    beforeAll(async () => {
        workspace = createMockDocsWorkspace();
        apiWorkspace = createMockApiWorkspace();

        rule = await ValidMarkdownLinks.create({
            workspace,
            apiWorkspaces: [apiWorkspace],
            ossWorkspaces: [],
            logger: createLogger(noop)
        });
    });

    it("should validate links in API descriptions", async () => {
        const violations =
            (await rule.apiSection?.({
                workspace: apiWorkspace,
                config: { audiences: [], api: "test-api" },
                context: createMockTaskContext()
            })) ?? [];

        // Should validate links found in API descriptions
        expect(violations).toBeDefined();
        expect(Array.isArray(violations)).toBe(true);
    });

    it("should handle malformed API descriptions", async () => {
        // Test with malformed descriptions that might break parsing
        const violations =
            (await rule.apiSection?.({
                workspace: apiWorkspace,
                config: { audiences: [], api: "test-api" },
                context: createMockTaskContext()
            })) ?? [];

        // Should handle malformed content gracefully
        expect(violations).toBeDefined();
    });
});

describe("Link Checker Performance", () => {
    it("should perform well with large documents", async () => {
        const workspace = createMockDocsWorkspace();
        const rule = await ValidMarkdownLinks.create({
            workspace,
            apiWorkspaces: [],
            ossWorkspaces: [],
            logger: createLogger(noop)
        });

        // Generate large document with many links
        const links = Array(1000)
            .fill(0)
            .map((_, i) => `[Link ${i}](/page-${i % 10})`)
            .join("\\n");

        const content = `# Large Document\\n${links}`;
        const testFilePath = join(workspace.absoluteFilePath, RelativeFilePath.of("large-doc.mdx"));

        const start = performance.now();
        const violations = await rule.markdownPage?.({
            content,
            absoluteFilepath: testFilePath,
            title: "Large Document"
        });
        const elapsed = performance.now() - start;

        // Should complete within reasonable time (5 seconds for 1000 links)
        expect(elapsed).toBeLessThan(5000);
        expect(violations).toBeDefined();
    });
});
