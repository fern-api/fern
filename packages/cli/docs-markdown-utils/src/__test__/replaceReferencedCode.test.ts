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
});
