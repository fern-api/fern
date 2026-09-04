import { DocsV1Write } from "@fern-api/fdr-sdk";
import { AbsoluteFilePath, resolve } from "@fern-api/fs-utils";
import { createMockTaskContext } from "@fern-api/task-context";
import { loadDocsWorkspace } from "@fern-api/workspace-loader";
import { readFile } from "fs/promises";
import { DocsDefinitionResolver } from "../DocsDefinitionResolver.js";

const context = createMockTaskContext();

describe("MDX comments", () => {
    it("strips comments from rendered markdown but keeps them in rawMarkdown", async () => {
        const fixtureDir = resolve(AbsoluteFilePath.of(__dirname), "fixtures/mdx-comments/fern");
        const docsWorkspace = await loadDocsWorkspace({ fernDirectory: fixtureDir, context });
        if (!docsWorkspace) {
            throw new Error("Failed to load docs workspace");
        }

        const resolver = new DocsDefinitionResolver({
            domain: "https://example.com",
            docsWorkspace,
            ossWorkspaces: [],
            apiWorkspaces: [],
            taskContext: context,
            uploadFiles: async () => [],
            registerApi: async () => ""
        });
        const resolved = await resolver.resolve();

        const page = resolved.pages[DocsV1Write.PageId("welcome.mdx")];
        if (page == null) {
            throw new Error("welcome.mdx was not resolved");
        }

        expect(page.markdown).not.toContain("{/*");
        expect(page.markdown.replace(/\s+/g, " ")).toContain("Some text more text.");
        expect(page.markdown).toContain("<!-- html comment -->");
        expect(page.markdown).toContain("More text <!-- inline html comment --> here.");

        const source = await readFile(resolve(fixtureDir, "welcome.mdx"), "utf-8");
        expect(page.rawMarkdown).toBe(source);
        expect(page.rawMarkdown).toContain("{/* top-level comment */}");
        expect(page.rawMarkdown).toContain("{/* nested comment */}");
        expect(page.rawMarkdown).toContain("Some text {/* inline comment */} more text.");
        expect(page.rawMarkdown).toContain("<!-- html comment -->");
        expect(page.rawMarkdown).toContain("More text <!-- inline html comment --> here.");
    });
});
