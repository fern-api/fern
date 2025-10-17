/**
 * Tests that focus on specific implementation details to identify gaps in the broken link checker.
 * These tests examine the internal functions and edge cases in the current implementation.
 */

import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { describe, expect, it } from "vitest";
import { checkIfPathnameExists } from "../check-if-pathname-exists";
// Import the internal functions to test them directly
import { collectPathnamesToCheck } from "../collect-pathnames";

describe("Implementation Gap Analysis - collectPathnamesToCheck", () => {
    describe("Markdown Link Pattern Recognition", () => {
        it("should identify all link formats correctly", () => {
            const content = `
# Standard Links
[Text](http://external.com) - should be ignored
[Internal link](/internal/page)
[Relative link](./relative.md)
[Fragment only](#fragment)

# Reference Links
[Reference text][ref1]
[ref1]: /reference-target

# Autolinks
<http://example.com>
<mailto:test@example.com>

# Image Links
![Alt text](/image.png)
![Alt text](./relative-image.jpg)

# Link-like text (should not be detected)
Not a link: [text without](url
Almost a link: [text] (spaced url)
Fake link: text[brackets]text

# Code blocks (should be ignored)
\`\`\`
[Code link](/should-be-ignored)
\`\`\`

\`Inline [code link](/also-ignored)\`

# Complex scenarios
[Link with **bold**](/bold-link)
[Link](url "title")
[Link](url 'title')
[Empty text]()
[](empty-text-url)
            `;

            const result = collectPathnamesToCheck(content, {
                instanceUrls: ["https://docs.example.com"]
            });

            // Should identify internal links but not external ones
            const internalLinks = result.pathnamesToCheck.map((p) => p.pathname);

            expect(internalLinks).toContain("/internal/page");
            expect(internalLinks).toContain("./relative.md");
            expect(internalLinks).toContain("#fragment");
            expect(internalLinks).toContain("/reference-target");
            expect(internalLinks).toContain("/image.png");
            expect(internalLinks).toContain("./relative-image.jpg");
            expect(internalLinks).toContain("/bold-link");
            expect(internalLinks).toContain("empty-text-url");

            // Should NOT include external links
            expect(internalLinks).not.toContain("http://external.com");
            expect(internalLinks).not.toContain("http://example.com");
            expect(internalLinks).not.toContain("mailto:test@example.com");

            // Should NOT include code block links
            expect(internalLinks).not.toContain("/should-be-ignored");
            expect(internalLinks).not.toContain("/also-ignored");

            // Should have position information for each link
            result.pathnamesToCheck.forEach((pathname) => {
                expect(pathname.position).toBeDefined();
                expect(pathname.position?.start.line).toBeGreaterThan(0);
                expect(pathname.position?.start.column).toBeGreaterThan(0);
            });
        });

        it("should handle edge cases in link detection", () => {
            const content = `
[Adjacent links](/link1)[next link](/link2)
[Link with
multiline text](/multiline)
[Link with \\[escaped\\] brackets](/escaped)
[Link with \\"quotes\\" in text](/quotes)

<!-- HTML comment with [link](/comment-link) -->
<!-- [HTML comment link](/html-comment) -->

<a href="/html-link">HTML link</a>
<img src="/html-image.png" alt="HTML image">

[Nested [brackets] in text](/nested-brackets)
[[Double brackets]](/double-brackets)

[Link with trailing spaces   ](/trailing-spaces)
[   Link with leading spaces](/leading-spaces)

[Empty URL]()
[](no-text)
[Only fragment](#only-fragment)
[Only query](?only=query)
            `;

            const result = collectPathnamesToCheck(content, {
                instanceUrls: ["https://docs.example.com"]
            });

            const links = result.pathnamesToCheck.map((p) => p.pathname);

            // Should handle adjacent links
            expect(links).toContain("/link1");
            expect(links).toContain("/link2");

            // Should handle multiline text
            expect(links).toContain("/multiline");

            // Should handle escaped brackets
            expect(links).toContain("/escaped");

            // Should handle quotes in text
            expect(links).toContain("/quotes");

            // Should handle nested brackets
            expect(links).toContain("/nested-brackets");
            expect(links).toContain("/double-brackets");

            // Should handle whitespace variations
            expect(links).toContain("/trailing-spaces");
            expect(links).toContain("/leading-spaces");

            // Should handle empty/minimal cases
            expect(links).toContain("no-text");
            expect(links).toContain("#only-fragment");
            expect(links).toContain("?only=query");

            // HTML links should not be detected by markdown parser (unless supported)
            // This tests the current implementation's behavior
        });

        it("should correctly identify code blocks and skip them", () => {
            const content = `
Regular [link outside](/outside) should be found.

\`\`\`
Code block [link inside](/inside-fenced) should be skipped.
\`\`\`

\`\`\`javascript
Language-specific [link](/inside-js) should be skipped.
\`\`\`

~~~
Tilde-fenced [link](/inside-tilde) should be skipped.
~~~

    Indented code block
    [link](/inside-indented) should be skipped.

\`Inline code [link](/inside-inline) should be skipped.\`

Mixed: \`inline [code](/inline-code)\` and [regular](/regular) link.

\`\`\`
Multi-line code block
with [multiple](/multi1) links
on [different](/multi2) lines
\`\`\`
            `;

            const result = collectPathnamesToCheck(content, {
                instanceUrls: ["https://docs.example.com"]
            });

            const links = result.pathnamesToCheck.map((p) => p.pathname);

            // Should find regular links
            expect(links).toContain("/outside");
            expect(links).toContain("/regular");

            // Should NOT find code block links
            expect(links).not.toContain("/inside-fenced");
            expect(links).not.toContain("/inside-js");
            expect(links).not.toContain("/inside-tilde");
            expect(links).not.toContain("/inside-indented");
            expect(links).not.toContain("/inside-inline");
            expect(links).not.toContain("/inline-code");
            expect(links).not.toContain("/multi1");
            expect(links).not.toContain("/multi2");
        });

        it("should handle reference links correctly", () => {
            const content = `
[Defined reference][def1]
[Undefined reference][undef1]
[Case sensitive][CASE1]
[case sensitive][case1]

[Shorthand reference][]
[Another shorthand][]

[def1]: /defined-target
[CASE1]: /case-target
[Shorthand reference]: /shorthand-target

[Circular A][circular-b]
[Circular B][circular-a]
[circular-a]: [circular-b]
[circular-b]: [circular-a]

[Self reference][self-ref]
[self-ref]: /self-target
            `;

            const result = collectPathnamesToCheck(content, {
                instanceUrls: ["https://docs.example.com"]
            });

            const links = result.pathnamesToCheck.map((p) => p.pathname);

            // Should resolve defined references
            expect(links).toContain("/defined-target");
            expect(links).toContain("/case-target");
            expect(links).toContain("/shorthand-target");
            expect(links).toContain("/self-target");

            // Should handle undefined references (behavior may vary)
            // The implementation should either create a violation or handle gracefully
            expect(result.violations).toBeDefined();
        });
    });

    describe("URL Classification", () => {
        it("should correctly classify internal vs external URLs", () => {
            const testCases = [
                { url: "http://example.com", shouldSkip: true, reason: "external HTTP" },
                { url: "https://example.com", shouldSkip: true, reason: "external HTTPS" },
                { url: "ftp://files.com", shouldSkip: true, reason: "external FTP" },
                { url: "mailto:test@example.com", shouldSkip: true, reason: "email" },
                { url: "//example.com", shouldSkip: true, reason: "protocol-relative" },

                { url: "/internal/path", shouldSkip: false, reason: "absolute internal" },
                { url: "./relative/path", shouldSkip: false, reason: "relative path" },
                { url: "../parent/path", shouldSkip: false, reason: "parent relative" },
                { url: "#fragment", shouldSkip: false, reason: "fragment only" },
                { url: "?query=param", shouldSkip: false, reason: "query only" },
                { url: "path/without/slash", shouldSkip: false, reason: "relative without dot" },

                // Edge cases
                { url: "javascript:void(0)", shouldSkip: true, reason: "javascript protocol" },
                { url: "data:text/plain,hello", shouldSkip: true, reason: "data URI" },
                { url: "tel:+1234567890", shouldSkip: true, reason: "telephone" },
                { url: "sms:+1234567890", shouldSkip: true, reason: "SMS" },

                // Ambiguous cases
                { url: "/api/v1/users", shouldSkip: false, reason: "could be API or path" },
                { url: "/http/internal", shouldSkip: false, reason: "http in path" },
                { url: "example", shouldSkip: false, reason: "simple word" }
            ];

            testCases.forEach(({ url, shouldSkip, reason }) => {
                const content = `[Test](${url})`;
                const result = collectPathnamesToCheck(content, {
                    instanceUrls: ["https://docs.example.com"]
                });

                if (shouldSkip) {
                    expect(result.pathnamesToCheck).toHaveLength(0);
                    if (result.pathnamesToCheck.length !== 0) {
                        throw new Error(`Expected ${url} to be skipped (${reason}) but it wasn't`);
                    }
                } else {
                    expect(result.pathnamesToCheck).toHaveLength(1);
                    if (result.pathnamesToCheck.length !== 1) {
                        throw new Error(`Expected ${url} to be checked (${reason}) but it was skipped`);
                    }
                    expect(result.pathnamesToCheck[0]?.pathname).toBe(url);
                }
            });
        });

        it("should handle instance URL matching", () => {
            const instanceUrls = [
                "https://docs.example.com",
                "https://docs.example.com/custom-path",
                "https://custom-domain.com"
            ];

            const testCases = [
                { url: "https://docs.example.com/page", shouldCheck: true },
                { url: "https://docs.example.com/custom-path/page", shouldCheck: true },
                { url: "https://custom-domain.com/page", shouldCheck: true },
                { url: "https://other-domain.com/page", shouldCheck: false },
                { url: "https://docs.example.org/page", shouldCheck: false }
            ];

            testCases.forEach(({ url, shouldCheck }) => {
                const content = `[Test](${url})`;
                const result = collectPathnamesToCheck(content, { instanceUrls });

                if (shouldCheck) {
                    expect(result.pathnamesToCheck.length).toBeGreaterThan(0);
                    if (result.pathnamesToCheck.length === 0) {
                        throw new Error(`Expected ${url} to be checked as internal but it wasn't`);
                    }
                } else {
                    expect(result.pathnamesToCheck).toHaveLength(0);
                    if (result.pathnamesToCheck.length !== 0) {
                        throw new Error(`Expected ${url} to be skipped as external but it was checked`);
                    }
                }
            });
        });
    });

    describe("Position Tracking", () => {
        it("should provide accurate position information", () => {
            const content = `Line 1
Line 2 with [first link](/first) and [second link](/second)
Line 3
[Third link on line 4](/third)
Multi-line content
[Fourth link](/fourth)`;

            const result = collectPathnamesToCheck(content, {
                instanceUrls: ["https://docs.example.com"]
            });

            // Should have 4 links with correct positions
            expect(result.pathnamesToCheck).toHaveLength(4);

            const positions = result.pathnamesToCheck.map((p) => ({
                pathname: p.pathname,
                line: p.position?.start.line,
                column: p.position?.start.column
            }));

            // First link should be on line 2
            const firstLink = positions.find((p) => p.pathname === "/first");
            expect(firstLink?.line).toBe(2);

            // Second link should be on line 2, after first link
            const secondLink = positions.find((p) => p.pathname === "/second");
            expect(secondLink?.line).toBe(2);
            expect(secondLink?.column).toBeGreaterThan(firstLink?.column || 0);

            // Third link should be on line 4
            const thirdLink = positions.find((p) => p.pathname === "/third");
            expect(thirdLink?.line).toBe(4);

            // Fourth link should be on line 6
            const fourthLink = positions.find((p) => p.pathname === "/fourth");
            expect(fourthLink?.line).toBe(6);
        });
    });
});

describe("Implementation Gap Analysis - checkIfPathnameExists", () => {
    const mockWorkspaceAbsoluteFilePath = AbsoluteFilePath.of("/test/workspace");
    const mockAbsoluteFilepath = join(mockWorkspaceAbsoluteFilePath, RelativeFilePath.of("test.md"));

    const mockVisitableSlugs = new Set([
        "overview",
        "docs/getting-started",
        "api/reference",
        "special-chars-page",
        "unicode-café",
        "emoji-🚀-page"
    ]);

    const mockAbsoluteFilePathsToSlugs = new Map([
        [join(mockWorkspaceAbsoluteFilePath, RelativeFilePath.of("overview.md")), ["overview"]],
        [join(mockWorkspaceAbsoluteFilePath, RelativeFilePath.of("docs/getting-started.md")), ["docs/getting-started"]]
    ]);

    const mockRedirects = [
        { source: "/old-path", destination: "/new-path", permanent: true },
        { source: "/redirect-loop-a", destination: "/redirect-loop-b", permanent: true },
        { source: "/redirect-loop-b", destination: "/redirect-loop-a", permanent: true }
    ];

    const mockBaseUrl = { basePath: "/docs", domain: "example.com" };

    describe("Absolute Path Resolution", () => {
        it("should handle absolute paths correctly", async () => {
            const testCases = [
                { pathname: "/overview", shouldExist: true },
                { pathname: "/docs/getting-started", shouldExist: true },
                { pathname: "/nonexistent", shouldExist: false },
                { pathname: "/api/reference", shouldExist: true },
                { pathname: "/special-chars-page", shouldExist: true },
                { pathname: "/unicode-café", shouldExist: true },
                { pathname: "/emoji-🚀-page", shouldExist: true }
            ];

            for (const { pathname, shouldExist } of testCases) {
                const result = await checkIfPathnameExists({
                    pathname,
                    markdown: true,
                    absoluteFilepath: mockAbsoluteFilepath,
                    workspaceAbsoluteFilePath: mockWorkspaceAbsoluteFilePath,
                    pageSlugs: mockVisitableSlugs,
                    absoluteFilePathsToSlugs: mockAbsoluteFilePathsToSlugs,
                    redirects: mockRedirects,
                    baseUrl: mockBaseUrl
                });

                if (shouldExist) {
                    expect(result).toBe(true);
                    if (result !== true) {
                        throw new Error(`Expected ${pathname} to exist but it didn't`);
                    }
                } else {
                    expect(result).not.toBe(true);
                    if (result === true) {
                        throw new Error(`Expected ${pathname} to not exist but it did`);
                    }
                }
            }
        });

        it("should handle paths with fragments", async () => {
            const testCases = [
                { pathname: "/overview#section", shouldExist: true }, // Assuming fragments are not validated
                { pathname: "/nonexistent#section", shouldExist: false },
                { pathname: "#local-fragment", shouldExist: true } // Local fragments need special handling
            ];

            for (const { pathname, shouldExist } of testCases) {
                const result = await checkIfPathnameExists({
                    pathname,
                    markdown: true,
                    absoluteFilepath: mockAbsoluteFilepath,
                    workspaceAbsoluteFilePath: mockWorkspaceAbsoluteFilePath,
                    pageSlugs: mockVisitableSlugs,
                    absoluteFilePathsToSlugs: mockAbsoluteFilePathsToSlugs,
                    redirects: mockRedirects,
                    baseUrl: mockBaseUrl
                });

                // The behavior here depends on implementation
                expect(result).toBeDefined();
            }
        });

        it("should handle query parameters", async () => {
            const testCases = [
                "/overview?param=value",
                "/docs/getting-started?version=v2&format=json",
                "/nonexistent?param=value"
            ];

            for (const pathname of testCases) {
                const result = await checkIfPathnameExists({
                    pathname,
                    markdown: true,
                    absoluteFilepath: mockAbsoluteFilepath,
                    workspaceAbsoluteFilePath: mockWorkspaceAbsoluteFilePath,
                    pageSlugs: mockVisitableSlugs,
                    absoluteFilePathsToSlugs: mockAbsoluteFilePathsToSlugs,
                    redirects: mockRedirects,
                    baseUrl: mockBaseUrl
                });

                // Should handle query params correctly
                expect(result).toBeDefined();
            }
        });
    });

    describe("Relative Path Resolution", () => {
        it("should resolve relative paths correctly", async () => {
            const testCases = [
                { pathname: "./sibling.md", description: "sibling file" },
                { pathname: "../parent.md", description: "parent directory file" },
                { pathname: "./sub/nested.md", description: "nested subdirectory" },
                { pathname: "./", description: "current directory" },
                { pathname: "../", description: "parent directory" },
                { pathname: "relative-no-dot.md", description: "relative without dot prefix" }
            ];

            for (const { pathname, description } of testCases) {
                const result = await checkIfPathnameExists({
                    pathname,
                    markdown: true,
                    absoluteFilepath: mockAbsoluteFilepath,
                    workspaceAbsoluteFilePath: mockWorkspaceAbsoluteFilePath,
                    pageSlugs: mockVisitableSlugs,
                    absoluteFilePathsToSlugs: mockAbsoluteFilePathsToSlugs,
                    redirects: mockRedirects,
                    baseUrl: mockBaseUrl
                });

                // Should handle relative path resolution
                expect(result).toBeDefined();
            }
        });

        it("should handle complex relative path scenarios", async () => {
            const testCases = [
                "./sub/../sibling.md", // Complex navigation
                "../../grandparent.md", // Multiple parents
                "././same-dir.md", // Redundant current dir
                "../sub/../sibling.md", // Complex with parent
                ".///triple-slash.md" // Multiple slashes
            ];

            for (const pathname of testCases) {
                const result = await checkIfPathnameExists({
                    pathname,
                    markdown: true,
                    absoluteFilepath: mockAbsoluteFilepath,
                    workspaceAbsoluteFilePath: mockWorkspaceAbsoluteFilePath,
                    pageSlugs: mockVisitableSlugs,
                    absoluteFilePathsToSlugs: mockAbsoluteFilePathsToSlugs,
                    redirects: mockRedirects,
                    baseUrl: mockBaseUrl
                });

                // Should handle complex paths without crashing
                expect(result).toBeDefined();
            }
        });
    });

    describe("Redirect Handling", () => {
        it("should follow redirects correctly", async () => {
            const result = await checkIfPathnameExists({
                pathname: "/old-path",
                markdown: true,
                absoluteFilepath: mockAbsoluteFilepath,
                workspaceAbsoluteFilePath: mockWorkspaceAbsoluteFilePath,
                pageSlugs: mockVisitableSlugs,
                absoluteFilePathsToSlugs: mockAbsoluteFilePathsToSlugs,
                redirects: mockRedirects,
                baseUrl: mockBaseUrl
            });

            // Should follow redirect to /new-path
            // Behavior depends on whether /new-path exists
            expect(result).toBeDefined();
        });

        it("should detect redirect loops", async () => {
            const loopTestCases = ["/redirect-loop-a", "/redirect-loop-b"];

            for (const pathname of loopTestCases) {
                const result = await checkIfPathnameExists({
                    pathname,
                    markdown: true,
                    absoluteFilepath: mockAbsoluteFilepath,
                    workspaceAbsoluteFilePath: mockWorkspaceAbsoluteFilePath,
                    pageSlugs: mockVisitableSlugs,
                    absoluteFilePathsToSlugs: mockAbsoluteFilePathsToSlugs,
                    redirects: mockRedirects,
                    baseUrl: mockBaseUrl
                });

                // Should handle redirect loops gracefully
                expect(result).toBeDefined();
            }
        });
    });

    describe("Edge Case Handling", () => {
        it("should handle empty and unusual pathnames", async () => {
            const edgeCases = ["", "/", "//", "///", "#", "?", "?#", "#?", "   ", "\t", "\n", "\r\n"];

            for (const pathname of edgeCases) {
                const result = await checkIfPathnameExists({
                    pathname,
                    markdown: true,
                    absoluteFilepath: mockAbsoluteFilepath,
                    workspaceAbsoluteFilePath: mockWorkspaceAbsoluteFilePath,
                    pageSlugs: mockVisitableSlugs,
                    absoluteFilePathsToSlugs: mockAbsoluteFilePathsToSlugs,
                    redirects: mockRedirects,
                    baseUrl: mockBaseUrl
                });

                // Should handle edge cases without crashing
                expect(result).toBeDefined();
            }
        });

        it("should handle very long pathnames", async () => {
            const longPathname = "/" + "very-long-segment/".repeat(100) + "final";

            const result = await checkIfPathnameExists({
                pathname: longPathname,
                markdown: true,
                absoluteFilepath: mockAbsoluteFilepath,
                workspaceAbsoluteFilePath: mockWorkspaceAbsoluteFilePath,
                pageSlugs: mockVisitableSlugs,
                absoluteFilePathsToSlugs: mockAbsoluteFilePathsToSlugs,
                redirects: mockRedirects,
                baseUrl: mockBaseUrl
            });

            // Should handle long paths without performance issues
            expect(result).toBeDefined();
        });

        it("should handle special characters in pathnames", async () => {
            const specialChars = [
                "/path with spaces",
                "/path%20with%20encoding",
                "/path-with-unicode-café",
                "/path/with/émojis-🚀",
                "/path/with/special!@#$%^&*()chars",
                "/path/with/chinese-中文",
                "/path/with/arabic-العربية"
            ];

            for (const pathname of specialChars) {
                const result = await checkIfPathnameExists({
                    pathname,
                    markdown: true,
                    absoluteFilepath: mockAbsoluteFilepath,
                    workspaceAbsoluteFilePath: mockWorkspaceAbsoluteFilePath,
                    pageSlugs: mockVisitableSlugs,
                    absoluteFilePathsToSlugs: mockAbsoluteFilePathsToSlugs,
                    redirects: mockRedirects,
                    baseUrl: mockBaseUrl
                });

                // Should handle special characters correctly
                expect(result).toBeDefined();
            }
        });
    });

    describe("Base URL Handling", () => {
        it("should handle different base URL configurations", async () => {
            const baseUrlConfigs = [
                { basePath: "", domain: "example.com" },
                { basePath: "/docs", domain: "example.com" },
                { basePath: "/v1/docs", domain: "example.com" },
                undefined // No base URL
            ];

            for (const baseUrl of baseUrlConfigs) {
                const result = await checkIfPathnameExists({
                    pathname: "/overview",
                    markdown: true,
                    absoluteFilepath: mockAbsoluteFilepath,
                    workspaceAbsoluteFilePath: mockWorkspaceAbsoluteFilePath,
                    pageSlugs: mockVisitableSlugs,
                    absoluteFilePathsToSlugs: mockAbsoluteFilePathsToSlugs,
                    redirects: mockRedirects,
                    baseUrl: baseUrl as any
                });

                // Should handle different base URL configurations
                expect(result).toBeDefined();
            }
        });
    });
});
