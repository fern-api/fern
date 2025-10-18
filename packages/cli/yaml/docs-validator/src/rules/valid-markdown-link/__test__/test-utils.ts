/**
 * Test utilities for broken link checker tests
 */

import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { DocsWorkspace } from "@fern-api/workspace-loader";

/**
 * Creates a mock docs workspace for testing
 */
export function createMockDocsWorkspace(): DocsWorkspace {
    return {
        type: "docs",
        workspaceName: "test-workspace",
        absoluteFilePath: AbsoluteFilePath.of("/test/workspace"),
        absoluteFilepathToDocsConfig: AbsoluteFilePath.of("/test/workspace/docs.yml"),
        config: {
            instances: [
                {
                    url: "https://test.docs.buildwithfern.com"
                }
            ],
            navigation: [
                {
                    page: "Overview",
                    path: "overview.md"
                },
                {
                    section: "Docs",
                    contents: [
                        {
                            page: "Getting Started",
                            path: "docs/getting-started.md"
                        }
                    ]
                },
                {
                    api: "API Reference",
                    apiName: "test-api"
                }
            ],
            redirects: [
                {
                    source: "/old-path",
                    destination: "/new-path",
                    permanent: true
                },
                {
                    source: "/redirect-loop-a",
                    destination: "/redirect-loop-b",
                    permanent: true
                },
                {
                    source: "/redirect-loop-b",
                    destination: "/redirect-loop-a",
                    permanent: true
                }
            ]
        },
        files: new Map([
            ["overview.md", { type: "markdownFile", content: "# Overview\n\nThis is the overview page." }],
            [
                "docs/getting-started.md",
                { type: "markdownFile", content: "# Getting Started\n\nGetting started content." }
            ]
        ])
    } as any;
}

/**
 * Creates a mock API workspace for testing
 */
export function createMockApiWorkspace(): any {
    return {
        name: "test-api",
        absoluteFilePath: AbsoluteFilePath.of("/test/api-workspace"),
        toFernWorkspace: async () => ({
            workspaceName: "test-api",
            absoluteFilePath: AbsoluteFilePath.of("/test/api-workspace"),
            definition: {
                services: {
                    TestService: {
                        endpoints: {
                            getUser: {
                                id: "getUser",
                                description: "Get a user by ID with [link to docs](/docs/users)",
                                method: "GET",
                                path: "/users/{id}"
                            },
                            createUser: {
                                id: "createUser",
                                description: "Create a new user. See [broken link](/broken-endpoint) for more info.",
                                method: "POST",
                                path: "/users"
                            }
                        }
                    }
                }
            }
        })
    };
}

/**
 * Creates test file content with specific link patterns
 */
export function createTestFileContent(linkPatterns: string[]): string {
    return `# Test Document

This is a test document with various link patterns:

${linkPatterns.map((link) => `- ${link}`).join("\n")}

## Section Header

More content here.

### Subsection

Final content.
`;
}

/**
 * Mock navigation node structure
 */
export function createMockNavigationNode(slug: string, title: string, children?: any[]): any {
    return {
        type: "page",
        slug,
        title,
        content: {
            type: "markdownFile",
            path: `${slug}.md`
        },
        children: children || []
    };
}

/**
 * Helper to create violation expectation patterns
 */
export function expectViolation(violations: any[], pattern: string, shouldExist: boolean = true): void {
    const found = violations.some((v) => v.message.includes(pattern));
    if (shouldExist && !found) {
        throw new Error(
            `Expected to find violation containing "${pattern}" but didn't find it. Violations: ${violations.map((v) => v.message).join(", ")}`
        );
    }
    if (!shouldExist && found) {
        throw new Error(
            `Expected NOT to find violation containing "${pattern}" but found it. Violations: ${violations.map((v) => v.message).join(", ")}`
        );
    }
}

/**
 * Helper to create test scenarios with expected outcomes
 */
export interface TestScenario {
    name: string;
    content: string;
    expectedBrokenLinks: string[];
    expectedValidLinks: string[];
}

export const commonTestScenarios: TestScenario[] = [
    {
        name: "Basic internal and external links",
        content: `
[Valid internal](/docs/overview)
[Broken internal](/nonexistent)
[External HTTP](http://example.com)
[External HTTPS](https://example.com)
        `,
        expectedBrokenLinks: ["/nonexistent"],
        expectedValidLinks: ["/docs/overview"]
    },
    {
        name: "Fragment links",
        content: `
# Valid Header

[Valid fragment](#valid-header)
[Broken fragment](#broken-header)
[Cross-page fragment](/docs/overview#introduction)
        `,
        expectedBrokenLinks: ["#broken-header"],
        expectedValidLinks: ["#valid-header"]
    },
    {
        name: "Relative paths",
        content: `
[Relative sibling](./sibling.md)
[Relative parent](../parent.md)
[Complex relative](./sub/../other.md)
        `,
        expectedBrokenLinks: ["./sibling.md", "../parent.md", "./sub/../other.md"],
        expectedValidLinks: []
    },
    {
        name: "Links in code blocks (should be ignored)",
        content: `
Regular [broken link](/broken) should be detected.

\`\`\`
Code [broken link](/broken-in-code) should be ignored.
\`\`\`

\`Inline [broken](/broken-inline) should be ignored.\`
        `,
        expectedBrokenLinks: ["/broken"],
        expectedValidLinks: [] // Code block links should be ignored
    }
];

/**
 * Performance test helper
 */
export function generateLargeTestDocument(numLinks: number): string {
    const links = Array(numLinks)
        .fill(0)
        .map((_, i) => `[Link ${i}](/test-page-${i % 10})`)
        .join("\n");

    return `# Large Test Document

This document contains ${numLinks} links for performance testing:

${links}
`;
}

/**
 * Unicode test content helper
 */
export function generateUnicodeTestContent(): string {
    return `# Unicode Test Document

Testing various Unicode scenarios:

- [English link](/docs/english)
- [Link with émojis](/docs/café-émojis🚀)
- [Chinese characters](/docs/中文页面)
- [Arabic text](/docs/الصفحة-العربية)
- [Mixed scripts](/docs/mixed-中文-العربية-english)
- [URL encoded](/docs/caf%C3%A9)
- [Emoji in text 🚀](/docs/rocket)

## Headers with Unicode

### Café & Émojis 🚀
### 中文标题
### العنوان العربي

[Link to café header](#café--émojis-)
[Link to Chinese header](#中文标题)
[Link to Arabic header](#العنوان-العربي)
`;
}
