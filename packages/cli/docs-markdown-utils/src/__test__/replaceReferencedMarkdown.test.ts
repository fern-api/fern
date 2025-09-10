import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { createMockTaskContext } from "@fern-api/task-context";
import { vi } from "vitest";

import { replaceReferencedMarkdown } from "../replaceReferencedMarkdown";

const absolutePathToFernFolder = AbsoluteFilePath.of("/path/to/fern");
const absolutePathToMarkdownFile = AbsoluteFilePath.of("/path/to/fern/pages/test.mdx");
const context = createMockTaskContext();

describe("replaceReferencedMarkdown", () => {
    it("should replace the referenced markdown with the content of the markdown file", async () => {
        const markdown = `
            <Markdown src="test.md" />
            <Markdown src="test2.md" />
        `;

        const result = await replaceReferencedMarkdown({
            markdown,
            absolutePathToFernFolder,
            absolutePathToMarkdownFile,
            context,
            markdownLoader: async (filepath) => {
                if (filepath === AbsoluteFilePath.of("/path/to/fern/pages/test.md")) {
                    return "test content";
                }
                if (filepath === AbsoluteFilePath.of("/path/to/fern/pages/test2.md")) {
                    return "test2 content\nwith multiple lines";
                }
                throw new Error(`Unexpected filepath: ${filepath}`);
            }
        });

        expect(result).toBe(`
            test content
            test2 content
            with multiple lines
        `);
    });

    it("should ignore references where the filename doesn't include md or mdx", async () => {
        const markdown = `
            <Markdown src="test.txt" />
            <Markdown src="test2" />
        `;

        const result = await replaceReferencedMarkdown({
            markdown,
            absolutePathToFernFolder,
            absolutePathToMarkdownFile,
            context,
            markdownLoader: async (filepath) => {
                throw new Error(`Unexpected filepath: ${filepath}`);
            }
        });

        expect(result).toBe(markdown);
    });

    it("should match on multiple formats", async () => {
        const markdown = `
            <Markdown
                src="test.md"
            />
            <Markdown src={"test2.mdx"} />
            <Markdown src='test3.md' />
            <Markdown src={'test4.md'} />
        `;

        const markdownLoader = vi.fn().mockResolvedValue("test content");

        await replaceReferencedMarkdown({
            markdown,
            absolutePathToFernFolder,
            absolutePathToMarkdownFile,
            context,
            markdownLoader
        });

        expect(markdownLoader).toHaveBeenCalledTimes(4);
    });
});
