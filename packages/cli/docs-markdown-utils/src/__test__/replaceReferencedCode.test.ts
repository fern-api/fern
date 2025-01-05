import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { createMockTaskContext } from "@fern-api/task-context";

import { replaceReferencedCode } from "../replaceReferencedCode";

const absolutePathToFernFolder = AbsoluteFilePath.of("/path/to/fern");
const absolutePathToMdx = AbsoluteFilePath.of("/path/to/fern/pages/test.mdx");
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
            absolutePathToMdx,
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
            \`\`\`py title="test.py"
            test content
            \`\`\`

            \`\`\`ts title="test.ts"
            test2 content
            with multiple lines
            \`\`\`

        `);
    });
});
