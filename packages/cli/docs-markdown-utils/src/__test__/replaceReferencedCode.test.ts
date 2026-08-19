import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { createMockTaskContext } from "@fern-api/task-context";
import { vi } from "vitest";

import { collectCodeSrcUrls, prefetchCodeSrcUrls, replaceReferencedCode } from "../replaceReferencedCode.js";

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

    it("should extract array of lines", async () => {
        const markdown = `
            <Code src="../snippets/test.py" lines={[1,3,5]} />
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
            line 1
            line 3
            line 5
            \`\`\`

        `);
    });

    it("should extract array with mixed ranges and single lines", async () => {
        const markdown = `
            <Code src="../snippets/test.py" lines={[1-2,4,6-7]} />
        `;

        const result = await replaceReferencedCode({
            markdown,
            absolutePathToFernFolder,
            absolutePathToMarkdownFile,
            context,
            fileLoader: async (filepath) => {
                if (filepath === AbsoluteFilePath.of("/path/to/fern/snippets/test.py")) {
                    return "line 1\nline 2\nline 3\nline 4\nline 5\nline 6\nline 7";
                }
                throw new Error(`Unexpected filepath: ${filepath}`);
            }
        });

        expect(result).toBe(`
            \`\`\`py title={"test.py"}
            line 1
            line 2
            line 4
            line 6
            line 7
            \`\`\`

        `);
    });

    it("should handle overlapping ranges by deduplicating lines", async () => {
        const markdown = `
            <Code src="../snippets/test.py" lines={[1-3,2-4]} />
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
            line 1
            line 2
            line 3
            line 4
            \`\`\`

        `);
    });

    it("should handle out-of-order line specifications by sorting them", async () => {
        const markdown = `
            <Code src="../snippets/test.py" lines={[5,1,3]} />
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
            line 1
            line 3
            line 5
            \`\`\`

        `);
    });

    it("should preserve for attribute for synced tabs", async () => {
        const markdown = `
            <CodeGroup>
                <Code src="../snippets/test.py" title="yarn" language="shell" for="yarn" />
                <Code src="../snippets/test.ts" title="npm" language="shell" for="npm" />
            </CodeGroup>
        `;

        const result = await replaceReferencedCode({
            markdown,
            absolutePathToFernFolder,
            absolutePathToMarkdownFile,
            context,
            fileLoader: async (filepath) => {
                if (filepath === AbsoluteFilePath.of("/path/to/fern/snippets/test.py")) {
                    return "yarn add package";
                }
                if (filepath === AbsoluteFilePath.of("/path/to/fern/snippets/test.ts")) {
                    return "npm install package";
                }
                throw new Error(`Unexpected filepath: ${filepath}`);
            }
        });

        expect(result).toBe(`
            <CodeGroup>
                \`\`\`shell title={"yarn"} for={"yarn"}
                yarn add package
                \`\`\`

                \`\`\`shell title={"npm"} for={"npm"}
                npm install package
                \`\`\`

            </CodeGroup>
        `);
    });

    it("should preserve for attribute with curly brace syntax", async () => {
        const markdown = `
            <Code src="../snippets/test.py" title="yarn" language="shell" for={"yarn"} />
        `;

        const result = await replaceReferencedCode({
            markdown,
            absolutePathToFernFolder,
            absolutePathToMarkdownFile,
            context,
            fileLoader: async (filepath) => {
                if (filepath === AbsoluteFilePath.of("/path/to/fern/snippets/test.py")) {
                    return "yarn add package";
                }
                throw new Error(`Unexpected filepath: ${filepath}`);
            }
        });

        expect(result).toBe(`
            \`\`\`shell title={"yarn"} for={"yarn"}
            yarn add package
            \`\`\`

        `);
    });

    it("should handle unquoted numeric values like startLine=40", async () => {
        const markdown = `
            <Code src="../snippets/test.go" startLine=40 maxLines=25 />
        `;

        const result = await replaceReferencedCode({
            markdown,
            absolutePathToFernFolder,
            absolutePathToMarkdownFile,
            context,
            fileLoader: async (filepath) => {
                if (filepath === AbsoluteFilePath.of("/path/to/fern/snippets/test.go")) {
                    return 'package main\n\nfunc main() {\n    fmt.Println("Hello")\n}';
                }
                throw new Error(`Unexpected filepath: ${filepath}`);
            }
        });

        // Note: empty lines in the code get indented with spaces
        expect(result).toBe(
            '\n            ```go title={"test.go"} startLine={40} maxLines={25}\n            package main\n            \n            func main() {\n                fmt.Println("Hello")\n            }\n            ```\n\n        '
        );
    });

    it("should handle unquoted numeric values appearing before src", async () => {
        const markdown = `
            <Code startLine=40 src="../snippets/test.go" maxLines=25 />
        `;

        const result = await replaceReferencedCode({
            markdown,
            absolutePathToFernFolder,
            absolutePathToMarkdownFile,
            context,
            fileLoader: async (filepath) => {
                if (filepath === AbsoluteFilePath.of("/path/to/fern/snippets/test.go")) {
                    return "package main";
                }
                throw new Error(`Unexpected filepath: ${filepath}`);
            }
        });

        expect(result).toBe(`
            \`\`\`go title={"test.go"} startLine={40} maxLines={25}
            package main
            \`\`\`

        `);
    });

    it("should handle mixed prop formats including unquoted numbers", async () => {
        const markdown = `
            <Code src="../snippets/test.go" startLine=40 highlight={40-60} maxLines=25 title={"Go"} />
        `;

        const result = await replaceReferencedCode({
            markdown,
            absolutePathToFernFolder,
            absolutePathToMarkdownFile,
            context,
            fileLoader: async (filepath) => {
                if (filepath === AbsoluteFilePath.of("/path/to/fern/snippets/test.go")) {
                    return "package main";
                }
                throw new Error(`Unexpected filepath: ${filepath}`);
            }
        });

        expect(result).toBe(`
            \`\`\`go title={"Go"} startLine={40} highlight={40-60} maxLines={25}
            package main
            \`\`\`

        `);
    });

    it('should handle quoted numeric values like startLine="40"', async () => {
        const markdown = `
            <Code src="../snippets/test.go" startLine="40" maxLines="25" />
        `;

        const result = await replaceReferencedCode({
            markdown,
            absolutePathToFernFolder,
            absolutePathToMarkdownFile,
            context,
            fileLoader: async (filepath) => {
                if (filepath === AbsoluteFilePath.of("/path/to/fern/snippets/test.go")) {
                    return "package main";
                }
                throw new Error(`Unexpected filepath: ${filepath}`);
            }
        });

        expect(result).toBe(`
            \`\`\`go title={"test.go"} startLine={40} maxLines={25}
            package main
            \`\`\`

        `);
    });

    it("should handle curly brace numeric values like startLine={40}", async () => {
        const markdown = `
            <Code src="../snippets/test.go" startLine={40} maxLines={25} />
        `;

        const result = await replaceReferencedCode({
            markdown,
            absolutePathToFernFolder,
            absolutePathToMarkdownFile,
            context,
            fileLoader: async (filepath) => {
                if (filepath === AbsoluteFilePath.of("/path/to/fern/snippets/test.go")) {
                    return "package main";
                }
                throw new Error(`Unexpected filepath: ${filepath}`);
            }
        });

        expect(result).toBe(`
            \`\`\`go title={"test.go"} startLine={40} maxLines={25}
            package main
            \`\`\`

        `);
    });

    it("should use cached content when urlCache is provided", async () => {
        const markdown = `
            <Code src="https://example.com/snippets/test.py" />
        `;

        const urlCache = new Map([["https://example.com/snippets/test.py", "cached python content"]]);

        const originalFetch = globalThis.fetch;
        const mockFetch = vi.fn();
        globalThis.fetch = mockFetch as typeof fetch;

        try {
            const result = await replaceReferencedCode({
                markdown,
                absolutePathToFernFolder,
                absolutePathToMarkdownFile,
                context,
                urlCache
            });

            expect(mockFetch).not.toHaveBeenCalled();
            expect(result).toBe(`
            \`\`\`py title={"test.py"}
            cached python content
            \`\`\`

        `);
        } finally {
            globalThis.fetch = originalFetch;
        }
    });

    it("should fall back to live fetch for URLs not in the cache", async () => {
        const markdown = `
            <Code src="https://example.com/snippets/test.py" />
        `;

        const urlCache = new Map<string, string>();

        const originalFetch = globalThis.fetch;
        globalThis.fetch = vi.fn((url: string) => {
            if (url === "https://example.com/snippets/test.py") {
                return Promise.resolve({
                    ok: true,
                    text: async () => "fetched content"
                } as Response);
            }
            return Promise.reject(new Error(`Unexpected URL: ${url}`));
        }) as typeof fetch;

        try {
            const result = await replaceReferencedCode({
                markdown,
                absolutePathToFernFolder,
                absolutePathToMarkdownFile,
                context,
                urlCache
            });

            expect(globalThis.fetch).toHaveBeenCalledWith("https://example.com/snippets/test.py");
            expect(result).toBe(`
            \`\`\`py title={"test.py"}
            fetched content
            \`\`\`

        `);
        } finally {
            globalThis.fetch = originalFetch;
        }
    });

    it("should extract language and title from URL pathname when using cache", async () => {
        const markdown = `
            <Code src="https://static.example.com/app/sdk-setup/go-server/init.txt" />
        `;

        const urlCache = new Map([["https://static.example.com/app/sdk-setup/go-server/init.txt", "func main() {}"]]);

        const result = await replaceReferencedCode({
            markdown,
            absolutePathToFernFolder,
            absolutePathToMarkdownFile,
            context,
            urlCache
        });

        expect(result).toBe(`
            \`\`\`txt title={"init.txt"}
            func main() {}
            \`\`\`

        `);
    });

    it("should respect lines parameter with cached content", async () => {
        const markdown = `
            <Code src="https://example.com/snippets/test.py" lines="2-3" />
        `;

        const urlCache = new Map([["https://example.com/snippets/test.py", "line 1\nline 2\nline 3\nline 4\nline 5"]]);

        const result = await replaceReferencedCode({
            markdown,
            absolutePathToFernFolder,
            absolutePathToMarkdownFile,
            context,
            urlCache
        });

        expect(result).toBe(`
            \`\`\`py title={"test.py"}
            line 2
            line 3
            \`\`\`

        `);
    });
});

describe("collectCodeSrcUrls", () => {
    it("should return empty array for markdown without Code tags", () => {
        const markdown = "# Hello\n\nThis is plain markdown with no Code tags.";
        expect(collectCodeSrcUrls(markdown)).toEqual([]);
    });

    it("should return empty array for markdown with Code tags but no src", () => {
        const markdown = '<Code language="python">print("hello")</Code>';
        expect(collectCodeSrcUrls(markdown)).toEqual([]);
    });

    it("should extract only external URLs and skip relative file paths", () => {
        const markdown = `
            <Code src="https://example.com/test.py" />
            <Code src="../snippets/local.ts" />
            <Code src="https://raw.githubusercontent.com/user/repo/main/example.go" />
            <Code src="./relative.js" />
        `;
        const urls = collectCodeSrcUrls(markdown);
        expect(urls).toEqual([
            "https://example.com/test.py",
            "https://raw.githubusercontent.com/user/repo/main/example.go"
        ]);
    });

    it("should handle multiple URLs across multiple Code tags", () => {
        const markdown = `
            <Code src="https://example.com/a.py" />
            Some text in between.
            <Code src="https://example.com/b.py" />
            <Code src="https://example.com/c.py" />
        `;
        const urls = collectCodeSrcUrls(markdown);
        expect(urls).toEqual(["https://example.com/a.py", "https://example.com/b.py", "https://example.com/c.py"]);
    });

    it("should return all occurrences including duplicates", () => {
        const markdown = `
            <Code src="https://example.com/test.py" />
            <Code src="https://example.com/test.py" />
        `;
        const urls = collectCodeSrcUrls(markdown);
        expect(urls).toEqual(["https://example.com/test.py", "https://example.com/test.py"]);
    });

    it("should handle single quotes in src attribute", () => {
        const markdown = `<Code src='https://example.com/test.py' />`;
        const urls = collectCodeSrcUrls(markdown);
        expect(urls).toEqual(["https://example.com/test.py"]);
    });

    it("should handle curly-brace src syntax", () => {
        const markdown = `<Code src={'https://example.com/test.py'} />`;
        const urls = collectCodeSrcUrls(markdown);
        expect(urls).toEqual(["https://example.com/test.py"]);
    });

    it("should handle Code tags with additional attributes", () => {
        const markdown = `
            <Code src="https://example.com/test.py" language="python" title="Example" />
            <Code language="go" src="https://example.com/test.go" maxLines={20} />
        `;
        const urls = collectCodeSrcUrls(markdown);
        expect(urls).toEqual(["https://example.com/test.py", "https://example.com/test.go"]);
    });

    it("should handle http URLs", () => {
        const markdown = `<Code src="http://example.com/test.py" />`;
        const urls = collectCodeSrcUrls(markdown);
        expect(urls).toEqual(["http://example.com/test.py"]);
    });
});

describe("prefetchCodeSrcUrls", () => {
    it("should return empty map for empty input", async () => {
        const result = await prefetchCodeSrcUrls([], context);
        expect(result.size).toBe(0);
    });

    it("should deduplicate URLs before fetching", async () => {
        const originalFetch = globalThis.fetch;
        const mockFetch = vi.fn((url: string) =>
            Promise.resolve({
                ok: true,
                text: async () => `content for ${url}`
            } as Response)
        );
        globalThis.fetch = mockFetch as typeof fetch;

        try {
            const urls = [
                "https://example.com/a.py",
                "https://example.com/b.py",
                "https://example.com/a.py",
                "https://example.com/b.py",
                "https://example.com/a.py"
            ];
            await prefetchCodeSrcUrls(urls, context);
            expect(mockFetch).toHaveBeenCalledTimes(2);
        } finally {
            globalThis.fetch = originalFetch;
        }
    });

    it("should populate the map with successful fetches", async () => {
        const originalFetch = globalThis.fetch;
        globalThis.fetch = vi.fn((url: string) =>
            Promise.resolve({
                ok: true,
                text: async () => `content for ${url}`
            } as Response)
        ) as typeof fetch;

        try {
            const result = await prefetchCodeSrcUrls(["https://example.com/a.py", "https://example.com/b.py"], context);
            expect(result.size).toBe(2);
            expect(result.get("https://example.com/a.py")).toBe("content for https://example.com/a.py");
            expect(result.get("https://example.com/b.py")).toBe("content for https://example.com/b.py");
        } finally {
            globalThis.fetch = originalFetch;
        }
    });

    it("should exclude failed fetches (non-200) without throwing", async () => {
        const originalFetch = globalThis.fetch;
        globalThis.fetch = vi.fn((url: string) => {
            if (url === "https://example.com/good.py") {
                return Promise.resolve({
                    ok: true,
                    text: async () => "good content"
                } as Response);
            }
            return Promise.resolve({
                ok: false,
                status: 404
            } as Response);
        }) as typeof fetch;

        try {
            const result = await prefetchCodeSrcUrls(
                ["https://example.com/good.py", "https://example.com/not-found.py"],
                context
            );
            expect(result.size).toBe(1);
            expect(result.get("https://example.com/good.py")).toBe("good content");
            expect(result.has("https://example.com/not-found.py")).toBe(false);
        } finally {
            globalThis.fetch = originalFetch;
        }
    });

    it("should handle network errors (rejected promises) gracefully", async () => {
        const originalFetch = globalThis.fetch;
        globalThis.fetch = vi.fn((url: string) => {
            if (url === "https://example.com/good.py") {
                return Promise.resolve({
                    ok: true,
                    text: async () => "good content"
                } as Response);
            }
            return Promise.reject(new Error("Network error"));
        }) as typeof fetch;

        try {
            const result = await prefetchCodeSrcUrls(
                ["https://example.com/good.py", "https://example.com/error.py"],
                context
            );
            expect(result.size).toBe(1);
            expect(result.get("https://example.com/good.py")).toBe("good content");
            expect(result.has("https://example.com/error.py")).toBe(false);
        } finally {
            globalThis.fetch = originalFetch;
        }
    });

    it("should not throw on failed fetches and exclude them from result", async () => {
        const originalFetch = globalThis.fetch;
        globalThis.fetch = vi.fn(() =>
            Promise.resolve({
                ok: false,
                status: 500
            } as Response)
        ) as typeof fetch;

        try {
            const result = await prefetchCodeSrcUrls(["https://example.com/fail.py"], context);
            expect(result.size).toBe(0);
            expect(result.has("https://example.com/fail.py")).toBe(false);
        } finally {
            globalThis.fetch = originalFetch;
        }
    });
});
