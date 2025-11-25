import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { createMockTaskContext } from "@fern-api/task-context";
import { vi } from "vitest";

import { replaceReferencedCode } from "../replaceReferencedCode";

const absolutePathToFernFolder = AbsoluteFilePath.of("/path/to/fern");
const absolutePathToMarkdownFile = AbsoluteFilePath.of("/path/to/fern/pages/test.mdx");
const context = createMockTaskContext();

describe("replaceReferencedCode", () => {
    it("should replace the referenced code with the content of the code file", async () => {
        const markdown = `
            <Code src="../snippets/test.py" />
            <Code src="../snippets/test.ts" />
        `;

        const result = await replaceReferencedCode({
            markdown,
            absolutePathToFernFolder,
            absolutePathToMarkdownFile,
            context,
            fileLoader: async (filepath) => {
                if (filepath === AbsoluteFilePath.of("/path/to/fern/snippets/test.py")) {
                    return "test content";
                }
                if (filepath === AbsoluteFilePath.of("/path/to/fern/snippets/test.ts")) {
                    return "test2 content\nwith multiple lines";
                }
                throw new Error(`Unexpected filepath: ${filepath}`);
            }
        });

        expect(result).toBe(`
            \`\`\`py title={"test.py"}
            test content
            \`\`\`

            \`\`\`ts title={"test.ts"}
            test2 content
            with multiple lines
            \`\`\`

        `);
    });

    it("should preserve maxLines and focus attributes when replacing code references", async () => {
        const markdown = `
            <Code src="../snippets/test.py" maxLines={20} focus={1-18} />
            <Code src="../snippets/test.ts" maxLines="20" focus={1-18} />
        `;

        const result = await replaceReferencedCode({
            markdown,
            absolutePathToFernFolder,
            absolutePathToMarkdownFile,
            context,
            fileLoader: async (filepath) => {
                if (filepath === AbsoluteFilePath.of("/path/to/fern/snippets/test.py")) {
                    return "test content";
                }
                if (filepath === AbsoluteFilePath.of("/path/to/fern/snippets/test.ts")) {
                    return "test2 content\nwith multiple lines";
                }
                throw new Error(`Unexpected filepath: ${filepath}`);
            }
        });

        expect(result).toBe(`
            \`\`\`py title={"test.py"} maxLines={20} focus={1-18}
            test content
            \`\`\`

            \`\`\`ts title={"test.ts"} maxLines={20} focus={1-18}
            test2 content
            with multiple lines
            \`\`\`

        `);
    });

    it("should preserve maxLines and focus attributes when they appear before src", async () => {
        const markdown = `
            <Code maxLines={20} focus={1-18} src="../snippets/test.py" />
            <Code maxLines="20" focus={1-18} src="../snippets/test.ts" />
        `;

        const result = await replaceReferencedCode({
            markdown,
            absolutePathToFernFolder,
            absolutePathToMarkdownFile,
            context,
            fileLoader: async (filepath) => {
                if (filepath === AbsoluteFilePath.of("/path/to/fern/snippets/test.py")) {
                    return "test content";
                }
                if (filepath === AbsoluteFilePath.of("/path/to/fern/snippets/test.ts")) {
                    return "test2 content\nwith multiple lines";
                }
                throw new Error(`Unexpected filepath: ${filepath}`);
            }
        });

        expect(result).toBe(`
            \`\`\`py title={"test.py"} maxLines={20} focus={1-18}
            test content
            \`\`\`

            \`\`\`ts title={"test.ts"} maxLines={20} focus={1-18}
            test2 content
            with multiple lines
            \`\`\`

        `);
    });

    it("should replace code from external URLs", async () => {
        const markdown = `
            <Code src="https://example.com/snippets/test.py" />
            <Code src="https://raw.githubusercontent.com/user/repo/main/example.ts" />
        `;

        const originalFetch = globalThis.fetch;
        globalThis.fetch = vi.fn((url: string) => {
            if (url === "https://example.com/snippets/test.py") {
                return Promise.resolve({
                    ok: true,
                    text: async () => "print('hello from URL')"
                } as Response);
            }
            if (url === "https://raw.githubusercontent.com/user/repo/main/example.ts") {
                return Promise.resolve({
                    ok: true,
                    text: async () => "console.log('from GitHub');\nconsole.log('line 2');"
                } as Response);
            }
            return Promise.reject(new Error(`Unexpected URL: ${url}`));
        }) as typeof fetch;

        try {
            const result = await replaceReferencedCode({
                markdown,
                absolutePathToFernFolder,
                absolutePathToMarkdownFile,
                context
            });

            expect(result).toBe(`
            \`\`\`py title={"test.py"}
            print('hello from URL')
            \`\`\`

            \`\`\`ts title={"example.ts"}
            console.log('from GitHub');
            console.log('line 2');
            \`\`\`

        `);
        } finally {
            globalThis.fetch = originalFetch;
        }
    });

    it("should handle URL fetch failures gracefully", async () => {
        const markdown = `
            <Code src="https://example.com/not-found.py" />
        `;

        const originalFetch = globalThis.fetch;
        globalThis.fetch = vi.fn(() => {
            return Promise.resolve({
                ok: false,
                status: 404
            } as Response);
        }) as typeof fetch;

        try {
            const result = await replaceReferencedCode({
                markdown,
                absolutePathToFernFolder,
                absolutePathToMarkdownFile,
                context
            });

            expect(result).toBe(markdown);
        } finally {
            globalThis.fetch = originalFetch;
        }
    });

    it("should override language when language property is present", async () => {
        const markdown = `
            <Code src="../snippets/test.py" language="python" />
            <Code language="typescript" src="../snippets/test.ts" />
        `;

        const result = await replaceReferencedCode({
            markdown,
            absolutePathToFernFolder,
            absolutePathToMarkdownFile,
            context,
            fileLoader: async (filepath) => {
                if (filepath === AbsoluteFilePath.of("/path/to/fern/snippets/test.py")) {
                    return "test content";
                }
                if (filepath === AbsoluteFilePath.of("/path/to/fern/snippets/test.ts")) {
                    return "test2 content";
                }
                throw new Error(`Unexpected filepath: ${filepath}`);
            }
        });

        expect(result).toBe(`
            \`\`\`python title={"test.py"}
            test content
            \`\`\`

            \`\`\`typescript title={"test.ts"}
            test2 content
            \`\`\`

        `);
    });

    it("should override title when title property is present", async () => {
        const markdown = `
            <Code src="../snippets/test.py" title="Custom Title" />
            <Code title="Another Title" src="../snippets/test.ts" />
        `;

        const result = await replaceReferencedCode({
            markdown,
            absolutePathToFernFolder,
            absolutePathToMarkdownFile,
            context,
            fileLoader: async (filepath) => {
                if (filepath === AbsoluteFilePath.of("/path/to/fern/snippets/test.py")) {
                    return "test content";
                }
                if (filepath === AbsoluteFilePath.of("/path/to/fern/snippets/test.ts")) {
                    return "test2 content";
                }
                throw new Error(`Unexpected filepath: ${filepath}`);
            }
        });

        expect(result).toBe(`
            \`\`\`py title={"Custom Title"}
            test content
            \`\`\`

            \`\`\`ts title={"Another Title"}
            test2 content
            \`\`\`

        `);
    });

    it("should override both language and title when both properties are present", async () => {
        const markdown = `
            <Code src="../snippets/test.py" language="python" title="My Python Code" />
        `;

        const result = await replaceReferencedCode({
            markdown,
            absolutePathToFernFolder,
            absolutePathToMarkdownFile,
            context,
            fileLoader: async (filepath) => {
                if (filepath === AbsoluteFilePath.of("/path/to/fern/snippets/test.py")) {
                    return "test content";
                }
                throw new Error(`Unexpected filepath: ${filepath}`);
            }
        });

        expect(result).toBe(`
            \`\`\`python title={"My Python Code"}
            test content
            \`\`\`

        `);
    });

    it("should add other properties as-is to metastring", async () => {
        const markdown = `
            <Code src="../snippets/test.py" language="python" title="Example" maxLines={10} showLineNumbers={true} />
        `;

        const result = await replaceReferencedCode({
            markdown,
            absolutePathToFernFolder,
            absolutePathToMarkdownFile,
            context,
            fileLoader: async (filepath) => {
                if (filepath === AbsoluteFilePath.of("/path/to/fern/snippets/test.py")) {
                    return "test content";
                }
                throw new Error(`Unexpected filepath: ${filepath}`);
            }
        });

        expect(result).toBe(`
            \`\`\`python title={"Example"} maxLines={10} showLineNumbers={true}
            test content
            \`\`\`

        `);
    });

    it("should handle title with curly brace syntax without adding extra quotes", async () => {
        const markdown = `
            <Code src="./example.js" title={"Hello"} />
        `;

        const result = await replaceReferencedCode({
            markdown,
            absolutePathToFernFolder,
            absolutePathToMarkdownFile,
            context,
            fileLoader: async (filepath) => {
                if (filepath === AbsoluteFilePath.of("/path/to/fern/pages/example.js")) {
                    return "test content";
                }
                throw new Error(`Unexpected filepath: ${filepath}`);
            }
        });

        expect(result).toBe(`
            \`\`\`js title={"Hello"}
            test content
            \`\`\`

        `);
    });

    it("should handle formatted on multiple lines", async () => {
        const markdown = `
            <Code
                src="./example.js"
                title={"Hello"}
            />
        `;

        const result = await replaceReferencedCode({
            markdown,
            absolutePathToFernFolder,
            absolutePathToMarkdownFile,
            context,
            fileLoader: async (filepath) => {
                if (filepath === AbsoluteFilePath.of("/path/to/fern/pages/example.js")) {
                    return "test content";
                }
                throw new Error(`Unexpected filepath: ${filepath}`);
            }
        });

        expect(result).toBe(`
            \`\`\`js title={"Hello"}
            test content
            \`\`\`

        `);
    });

    it("should handle weird formatting", async () => {
        const markdown = `
            <Code title={"Hello 1"}
                src="./example.js"
            />

            <Code title={"Hello 2"} src="./example.js"
            />
        `;

        const result = await replaceReferencedCode({
            markdown,
            absolutePathToFernFolder,
            absolutePathToMarkdownFile,
            context,
            fileLoader: async (filepath) => {
                if (filepath === AbsoluteFilePath.of("/path/to/fern/pages/example.js")) {
                    return "test content";
                }
                throw new Error(`Unexpected filepath: ${filepath}`);
            }
        });

        expect(result).toBe(`
            \`\`\`js title={"Hello 1"}
            test content
            \`\`\`


            \`\`\`js title={"Hello 2"}
            test content
            \`\`\`

        `);
    });

    it("should handle more weird formatting", async () => {
        const markdown = `
            <Code title={"Hello 1"} maxLines={20}
                src="./example.js"
                highlight={40}
            />
        `;

        const result = await replaceReferencedCode({
            markdown,
            absolutePathToFernFolder,
            absolutePathToMarkdownFile,
            context,
            fileLoader: async (filepath) => {
                if (filepath === AbsoluteFilePath.of("/path/to/fern/pages/example.js")) {
                    return "test content";
                }
                throw new Error(`Unexpected filepath: ${filepath}`);
            }
        });

        expect(result).toBe(`
            \`\`\`js title={"Hello 1"} maxLines={20} highlight={40}
            test content
            \`\`\`

        `);
    });

    it("should not replace CodeBlock components", async () => {
        const markdown = `
            <Code src="../snippets/test.py" />
            <CodeBlock src="../snippets/should-not-replace.js" />
            <CodeGroup>
                <Code src="../snippets/test.ts" />
                <CodeBlock language="javascript">
                    console.log("inline code");
                </CodeBlock>
            </CodeGroup>
        `;

        const result = await replaceReferencedCode({
            markdown,
            absolutePathToFernFolder,
            absolutePathToMarkdownFile,
            context,
            fileLoader: async (filepath) => {
                if (filepath === AbsoluteFilePath.of("/path/to/fern/snippets/test.py")) {
                    return "python content";
                }
                if (filepath === AbsoluteFilePath.of("/path/to/fern/snippets/test.ts")) {
                    return "typescript content";
                }
                throw new Error(`Unexpected filepath: ${filepath}`);
            }
        });

        expect(result).toBe(`
            \`\`\`py title={"test.py"}
            python content
            \`\`\`

            <CodeBlock src="../snippets/should-not-replace.js" />
            <CodeGroup>
                \`\`\`ts title={"test.ts"}
                typescript content
                \`\`\`

                <CodeBlock language="javascript">
                    console.log("inline code");
                </CodeBlock>
            </CodeGroup>
        `);
    });

    it("should extract specific lines using lines parameter with range format", async () => {
        const markdown = `
            <Code src="../snippets/test.py" lines="2-4" />
        `;

        const result = await replaceReferencedCode({
            markdown,
            absolutePathToFernFolder,
            absolutePathToMarkdownFile,
            context,
            fileLoader: async (filepath) => {
                if (filepath === AbsoluteFilePath.of("/path/to/fern/snippets/test.py")) {
                    return "line 1\nline 2\nline 3\nline 4\nline 5";
                }
                throw new Error(`Unexpected filepath: ${filepath}`);
            }
        });

        expect(result).toBe(`
            \`\`\`py title={"test.py"}
            line 2
            line 3
            line 4
            \`\`\`

        `);
    });

    it("should extract specific lines using lines parameter with curly brace syntax", async () => {
        const markdown = `
            <Code src="../snippets/test.py" lines={2-4} />
        `;

        const result = await replaceReferencedCode({
            markdown,
            absolutePathToFernFolder,
            absolutePathToMarkdownFile,
            context,
            fileLoader: async (filepath) => {
                if (filepath === AbsoluteFilePath.of("/path/to/fern/snippets/test.py")) {
                    return "line 1\nline 2\nline 3\nline 4\nline 5";
                }
                throw new Error(`Unexpected filepath: ${filepath}`);
            }
        });

        expect(result).toBe(`
            \`\`\`py title={"test.py"}
            line 2
            line 3
            line 4
            \`\`\`

        `);
    });

    it("should extract a single line using lines parameter", async () => {
        const markdown = `
            <Code src="../snippets/test.py" lines="3" />
        `;

        const result = await replaceReferencedCode({
            markdown,
            absolutePathToFernFolder,
            absolutePathToMarkdownFile,
            context,
            fileLoader: async (filepath) => {
                if (filepath === AbsoluteFilePath.of("/path/to/fern/snippets/test.py")) {
                    return "line 1\nline 2\nline 3\nline 4\nline 5";
                }
                throw new Error(`Unexpected filepath: ${filepath}`);
            }
        });

        expect(result).toBe(`
            \`\`\`py title={"test.py"}
            line 3
            \`\`\`

        `);
    });

    it("should handle lines parameter with other properties", async () => {
        const markdown = `
            <Code src="../snippets/test.py" lines="1-3" title="First Three Lines" maxLines={10} />
        `;

        const result = await replaceReferencedCode({
            markdown,
            absolutePathToFernFolder,
            absolutePathToMarkdownFile,
            context,
            fileLoader: async (filepath) => {
                if (filepath === AbsoluteFilePath.of("/path/to/fern/snippets/test.py")) {
                    return "line 1\nline 2\nline 3\nline 4\nline 5";
                }
                throw new Error(`Unexpected filepath: ${filepath}`);
            }
        });

        expect(result).toBe(`
            \`\`\`py title={"First Three Lines"} maxLines={10}
            line 1
            line 2
            line 3
            \`\`\`

        `);
    });

    it("should handle lines parameter appearing before src", async () => {
        const markdown = `
            <Code lines="2-3" src="../snippets/test.py" />
        `;

        const result = await replaceReferencedCode({
            markdown,
            absolutePathToFernFolder,
            absolutePathToMarkdownFile,
            context,
            fileLoader: async (filepath) => {
                if (filepath === AbsoluteFilePath.of("/path/to/fern/snippets/test.py")) {
                    return "line 1\nline 2\nline 3\nline 4\nline 5";
                }
                throw new Error(`Unexpected filepath: ${filepath}`);
            }
        });

        expect(result).toBe(`
            \`\`\`py title={"test.py"}
            line 2
            line 3
            \`\`\`

        `);
    });

    it("should handle lines parameter with URL source", async () => {
        const markdown = `
            <Code src="https://example.com/snippets/test.py" lines="1-2" />
        `;

        const originalFetch = globalThis.fetch;
        globalThis.fetch = vi.fn((url: string) => {
            if (url === "https://example.com/snippets/test.py") {
                return Promise.resolve({
                    ok: true,
                    text: async () => "line 1\nline 2\nline 3\nline 4\nline 5"
                } as Response);
            }
            return Promise.reject(new Error(`Unexpected URL: ${url}`));
        }) as typeof fetch;

        try {
            const result = await replaceReferencedCode({
                markdown,
                absolutePathToFernFolder,
                absolutePathToMarkdownFile,
                context
            });

            expect(result).toBe(`
            \`\`\`py title={"test.py"}
            line 1
            line 2
            \`\`\`

        `);
        } finally {
            globalThis.fetch = originalFetch;
        }
    });
});
