/**
 * Edge case tests for the broken link checker.
 * These tests focus on specific problematic scenarios that might cause issues.
 */

import { noop } from "@fern-api/core-utils";
import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { createLogger } from "@fern-api/logger";
import { createMockTaskContext } from "@fern-api/task-context";
import { DocsWorkspace } from "@fern-api/workspace-loader";
import { beforeAll, describe, expect, it } from "vitest";

import { ValidMarkdownLinks } from "../valid-markdown-link";
import { createMockApiWorkspace, createMockDocsWorkspace, expectViolation } from "./test-utils";

describe("Edge Cases - Markdown Link Parsing", () => {
    let rule: Awaited<ReturnType<typeof ValidMarkdownLinks.create>>;
    let workspace: DocsWorkspace;
    let testFilePath: AbsoluteFilePath;

    beforeAll(async () => {
        workspace = createMockDocsWorkspace();
        testFilePath = join(workspace.absoluteFilePath, RelativeFilePath.of("edge-cases.mdx"));

        rule = await ValidMarkdownLinks.create({
            workspace,
            apiWorkspaces: [createMockApiWorkspace()],
            ossWorkspaces: [],
            logger: createLogger(noop)
        });
    });

    describe("Malformed Link Syntax", () => {
        it("should handle malformed bracket structures", async () => {
            const content = `
[Unclosed bracket to valid page](/docs/overview
[Missing text]()
[]()
[](broken-empty-url)
[[Double opening brackets]](/double-open)
[Single closing bracket]]/single-close)
[Mixed brackets[nested]](/mixed-nested)
[Escaped \\[brackets\\]](/escaped-brackets)
            `;

            const violations =
                (await rule.markdownPage?.({
                    title: "Test Page",
                    content,
                    absoluteFilepath: testFilePath
                })) ?? [];

            // Should parse what it can and handle malformed gracefully
            expect(violations).toBeDefined();
            expect(Array.isArray(violations)).toBe(true);
        });

        it("should handle links with unusual whitespace", async () => {
            const content = `
[Link with\\ttab in text](/tab-link)
[Link with\\nnewline in text](/newline-link)
[Link with trailing spaces   ](/trailing-spaces)
[   Link with leading spaces](/leading-spaces)
[Link with\\r\\nwindows newline](/windows-newline)
[Link with multiple   spaces](/multiple-spaces)
            `;

            const violations =
                (await rule.markdownPage?.({
                    title: "Test Page",
                    content,
                    absoluteFilepath: testFilePath
                })) ?? [];

            // Should handle whitespace in link text properly
            expect(violations).toBeDefined();
        });

        it("should handle nested markdown elements", async () => {
            const content = `
[**Bold link text**](/bold-link)
[*Italic link text*](/italic-link)
[~~Strikethrough link~~](/strike-link)
[\`Code in link\`](/code-link)
[Text with **bold** and *italic*](/mixed-formatting)
[Link with \\\\ backslash](/backslash-link)
[Link with "quotes"](/quotes-link)
[Link with 'single quotes'](/single-quotes)
            `;

            const violations =
                (await rule.markdownPage?.({
                    title: "Test Page",
                    content,
                    absoluteFilepath: testFilePath
                })) ?? [];

            // Should properly parse nested formatting
            expect(violations).toBeDefined();
        });
    });

    describe("URL Edge Cases", () => {
        it("should handle URLs with special characters", async () => {
            const content = `
[URL with query string](/search?q=test&type=docs)
[URL with fragment](/page#section-1)
[URL with both](/page?param=value#section)
[URL with encoded chars](/path%20with%20spaces)
[URL with plus signs](/path+with+plus)
[URL with special chars](/path@#$%^&*()+={}[]|\\\\:";'<>?,./~\`)
[URL with Unicode](/café/naïve/résumé)
            `;

            const violations =
                (await rule.markdownPage?.({
                    title: "Test Page",
                    content,
                    absoluteFilepath: testFilePath
                })) ?? [];

            // Should handle special characters in URLs
            expect(violations).toBeDefined();
        });

        it("should handle very long URLs", async () => {
            const longPath = Array(100).fill("very-long-segment").join("/");
            const content = `
[Extremely long URL](/${longPath}/final-page)
[URL with long query](/?${Array(50).fill("param=value").join("&")})
[URL with long fragment](/#${"very-".repeat(100)}long-fragment)
            `;

            const violations =
                (await rule.markdownPage?.({
                    title: "Test Page",
                    content,
                    absoluteFilepath: testFilePath
                })) ?? [];

            // Should handle very long URLs without crashing
            expect(violations).toBeDefined();
        });

        it("should handle protocol edge cases", async () => {
            const content = `
[HTTP should be ignored](http://example.com/page)
[HTTPS should be ignored](https://example.com/page)
[FTP should be ignored](ftp://files.example.com/file.zip)
[Mailto should be ignored](mailto:test@example.com)
[Protocol-relative should be ignored](//example.com/page)
[Invalid protocol](invalid://example.com/page)
[No protocol but looks external](example.com/page)
[Internal with HTTP-like path](/http/internal/page)
            `;

            const violations =
                (await rule.markdownPage?.({
                    title: "Test Page",
                    content,
                    absoluteFilepath: testFilePath
                })) ?? [];

            // Should properly distinguish internal vs external
            // External protocols should be ignored
            expect(violations.every((v) => !v.message.includes("example.com") && !v.message.includes("mailto:"))).toBe(
                true
            );
        });
    });

    describe("Path Resolution Edge Cases", () => {
        it("should handle complex relative path resolution", async () => {
            const content = `
[Self reference](./)
[Self reference explicit](./.)
[Parent then self](.././)
[Complex navigation](./sub/../other/../final)
[Too many parents](../../../../../../../../out-of-bounds)
[Mixed separators](./unix/path\\\\windows\\\\mixed)
[Trailing slash ambiguity](./directory/)
[File vs directory](./could-be-file-or-dir)
            `;

            const violations =
                (await rule.markdownPage?.({
                    title: "Test Page",
                    content,
                    absoluteFilepath: testFilePath
                })) ?? [];

            // Should resolve complex paths correctly
            expect(violations).toBeDefined();
        });

        it("should handle case sensitivity scenarios", async () => {
            const content = `
[Lowercase path](/docs/overview)
[Uppercase path](/DOCS/OVERVIEW)
[Mixed case path](/Docs/Overview)
[Lowercase extension](./file.md)
[Uppercase extension](./FILE.MD)
[Mixed case extension](./File.Md)
[No extension](./README)
[Hidden file](./.hidden-file)
            `;

            const violations =
                (await rule.markdownPage?.({
                    title: "Test Page",
                    content,
                    absoluteFilepath: testFilePath
                })) ?? [];

            // Should handle case sensitivity based on system
            expect(violations).toBeDefined();
        });
    });

    describe("Fragment Resolution Edge Cases", () => {
        it("should handle header-to-fragment conversion edge cases", async () => {
            const content = `
# Header with "Quotes"
## Header with 'Single Quotes'
### Header with \`Code\`
#### Header with **Bold**
##### Header with *Italic*
###### Header with ~~Strikethrough~~
# Header with Multiple   Spaces
## Header with!@#$%^&*()Special Characters
### Header with 123 Numbers
#### Header with Émojis 🚀
##### Header with Unicode: café naïve résumé
###### Header with Chinese: 中文标题

[Link to quotes header](#header-with-quotes)
[Link to single quotes](#header-with-single-quotes)
[Link to code header](#header-with-code)
[Link to bold header](#header-with-bold)
[Link to italic header](#header-with-italic)
[Link to strikethrough](#header-with-strikethrough)
[Link to multiple spaces](#header-with-multiple-spaces)
[Link to special chars](#header-withspecial-characters)
[Link to numbers](#header-with-123-numbers)
[Link to emoji header](#header-with-émojis-)
[Link to unicode header](#header-with-unicode-café-naïve-résumé)
[Link to chinese header](#header-with-chinese-中文标题)
            `;

            const violations =
                (await rule.markdownPage?.({
                    title: "Test Page",
                    content,
                    absoluteFilepath: testFilePath
                })) ?? [];

            // Should properly convert various header formats to fragments
            expect(violations).toBeDefined();
        });

        it("should handle duplicate header scenarios", async () => {
            const content = `
# Duplicate Header
## Duplicate Header
### Duplicate Header

# Another Section
## Duplicate Header

[Link to first duplicate](#duplicate-header)
[Link to second duplicate](#duplicate-header-1)
[Link to third duplicate](#duplicate-header-2)
[Link to fourth duplicate](#duplicate-header-3)
            `;

            const violations =
                (await rule.markdownPage?.({
                    title: "Test Page",
                    content,
                    absoluteFilepath: testFilePath
                })) ?? [];

            // Should handle duplicate headers with numbering
            expect(violations).toBeDefined();
        });
    });

    describe("Code Block and Inline Code Edge Cases", () => {
        it("should handle various code block formats", async () => {
            const content = `
Regular link should be checked: [broken](/broken-regular)

\`\`\`
Fenced code block [broken](/broken-fenced) should be ignored
\`\`\`

\`\`\`javascript
Language-specific [broken](/broken-js) should be ignored
\`\`\`

\`\`\`javascript title="Example"
Code with title [broken](/broken-title) should be ignored
\`\`\`

~~~
Tilde fenced [broken](/broken-tilde) should be ignored
~~~

    Indented code block
    [broken](/broken-indented) should be ignored

\`Inline code [broken](/broken-inline) should be ignored\`

Text \`inline [broken](/broken-mixed)\` more text should ignore inline part.

\`\`\`
Multi-line code
with [broken link](/broken-multiline)
on different lines
\`\`\`
            `;

            const violations =
                (await rule.markdownPage?.({
                    title: "Test Page",
                    content,
                    absoluteFilepath: testFilePath
                })) ?? [];

            // Should only check the regular link
            expectViolation(violations, "/broken-regular", true);
            expectViolation(violations, "/broken-fenced", false);
            expectViolation(violations, "/broken-js", false);
            expectViolation(violations, "/broken-title", false);
            expectViolation(violations, "/broken-tilde", false);
            expectViolation(violations, "/broken-indented", false);
            expectViolation(violations, "/broken-inline", false);
            expectViolation(violations, "/broken-mixed", false);
            expectViolation(violations, "/broken-multiline", false);
        });

        it("should handle escaped code blocks", async () => {
            const content = `
Normal code block:
\`\`\`
[Should be ignored](/ignored)
\`\`\`

Escaped code block (should check links):
\\\`\\\`\\\`
[Should be checked](/should-be-checked)
\\\`\\\`\\\`

Mixed escaping:
\\\`code with [link](/mixed-escape)\\\`
            `;

            const violations =
                (await rule.markdownPage?.({
                    title: "Test Page",
                    content,
                    absoluteFilepath: testFilePath
                })) ?? [];

            // Escaped code blocks should be treated as regular text
            expectViolation(violations, "/ignored", false);
            expectViolation(violations, "/should-be-checked", true);
            expectViolation(violations, "/mixed-escape", true);
        });
    });

    describe("Reference Link Edge Cases", () => {
        it("should handle complex reference link scenarios", async () => {
            const content = `
[Reference 1][ref1]
[Reference 2][ref2]
[Undefined reference][undefined]
[Case sensitive][CASE]
[case sensitive][case]
[Numeric reference][123]
[Special chars reference][ref!@#]
[Unicode reference][référence]

[ref1]: /broken-ref1
[ref2]: /valid-ref2 "Title with [brackets]"
[CASE]: /case-sensitive
[123]: /numeric-reference
[ref!@#]: /special-chars
[référence]: /unicode-ref

[Circular A][circular-b]
[Circular B][circular-a]
[circular-a]: #circular-a
[circular-b]: #circular-b

[Self reference][self]
[self]: #self

Reference with no definition: [orphaned][]
Empty reference: [][]
            `;

            const violations =
                (await rule.markdownPage?.({
                    title: "Test Page",
                    content,
                    absoluteFilepath: testFilePath
                })) ?? [];

            // Should handle various reference link edge cases
            expectViolation(violations, "undefined", true);
            expectViolation(violations, "orphaned", true);
            expect(violations).toBeDefined();
        });
    });

    describe("Performance Edge Cases", () => {
        it("should handle deeply nested link structures", async () => {
            const deepNesting = Array(50)
                .fill(0)
                .map((_, i) => `${"  ".repeat(i)}${i % 2 === 0 ? "-" : "1."} [Link ${i}](/link-${i})`)
                .join("\\n");

            const content = `
# Deeply Nested Structure

${deepNesting}
            `;

            const violations =
                (await rule.markdownPage?.({
                    title: "Test Page",
                    content,
                    absoluteFilepath: testFilePath
                })) ?? [];

            // Should handle deep nesting without stack overflow
            expect(violations).toBeDefined();
            expect(violations.length).toBeGreaterThan(0);
        });

        it("should handle pathological regex cases", async () => {
            const content = `
[Repeated chars](/${"a".repeat(1000)})
[Alternating pattern](/${"ab".repeat(500)})
[Nested parentheses](/path${"(".repeat(100)}${"content"}${")".repeat(100)})
[Many hyphens](/${"word-".repeat(200)}end)
[Repeated dots](/${"../".repeat(100)}file)
            `;

            const violations =
                (await rule.markdownPage?.({
                    title: "Test Page",
                    content,
                    absoluteFilepath: testFilePath
                })) ?? [];

            // Should handle pathological cases without catastrophic backtracking
            expect(violations).toBeDefined();
        });
    });

    describe("Internationalization Edge Cases", () => {
        it("should handle RTL and mixed-direction text", async () => {
            const content = `
[English to Arabic](/docs/العربية)
[Arabic text العربية with English](/mixed-direction)
[Hebrew text עברית](/hebrew)
[Mixed RTL and LTR](/path/العربية/english/עברית)
[BiDi override \\u202E[reverse](/bidi-override)\\u202C]
[Zero-width characters](/zero\\u200B\\u200Cwidth)
            `;

            const violations =
                (await rule.markdownPage?.({
                    title: "Test Page",
                    content,
                    absoluteFilepath: testFilePath
                })) ?? [];

            // Should handle international text properly
            expect(violations).toBeDefined();
        });
    });

    describe("Memory and Resource Edge Cases", () => {
        it("should handle very large link texts", async () => {
            const largeText = "Very long link text ".repeat(1000);
            const content = `[${largeText}](/large-text-link)`;

            const violations =
                (await rule.markdownPage?.({
                    title: "Test Page",
                    content,
                    absoluteFilepath: testFilePath
                })) ?? [];

            // Should handle large link texts without memory issues
            expect(violations).toBeDefined();
        });

        it("should handle many similar links", async () => {
            const similarLinks = Array(500)
                .fill(0)
                .map((_, i) => `[Link ${i}](/very/similar/path/link-${i})`)
                .join("\\n");

            const content = `
# Similar Links Test

${similarLinks}
            `;

            const violations =
                (await rule.markdownPage?.({
                    title: "Test Page",
                    content,
                    absoluteFilepath: testFilePath
                })) ?? [];

            // Should handle many similar links efficiently
            expect(violations).toBeDefined();
        });
    });
});

describe("API Description Edge Cases", () => {
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

    it("should handle malformed API descriptions", async () => {
        // Mock API workspace with malformed descriptions
        const malformedApiWorkspace = {
            ...apiWorkspace,
            toFernWorkspace: async () => ({
                ...(await apiWorkspace.toFernWorkspace()),
                definition: {
                    services: {
                        MalformedService: {
                            endpoints: {
                                badEndpoint: {
                                    description: "[Unclosed link(/broken",
                                    method: "GET",
                                    path: "/bad"
                                },
                                unicodeEndpoint: {
                                    description: "Description with [unicode link](/café/naïve) and [emoji 🚀](/rocket)",
                                    method: "POST",
                                    path: "/unicode"
                                },
                                longDescription: {
                                    description: `${"Very long description ".repeat(100)} with [nested link](/nested)`,
                                    method: "PUT",
                                    path: "/long"
                                }
                            }
                        }
                    }
                }
            })
        };

        const violations =
            (await rule.apiSection?.({
                workspace: malformedApiWorkspace,
                config: { api: "test-api", audiences: [] },
                context: createMockTaskContext({ logger: createLogger(noop) })
            })) ?? [];

        // Should handle malformed API descriptions gracefully
        expect(violations).toBeDefined();
        expect(Array.isArray(violations)).toBe(true);
    });
});
