import { AbsoluteFilePath, RelativeFilePath, resolve } from "@fern-api/fs-utils";
import { createMockTaskContext } from "@fern-api/task-context";
import { loadDocsWorkspace } from "@fern-api/workspace-loader";
import { describe, expect, it } from "vitest";

import { DocsDefinitionResolver } from "../DocsDefinitionResolver.js";

const context = createMockTaskContext();

async function resolveFixture(): Promise<{ uploadedFiles: string[] }> {
    const docsWorkspace = await loadDocsWorkspace({
        fernDirectory: resolve(AbsoluteFilePath.of(__dirname), RelativeFilePath.of("fixtures/translation-images/fern")),
        context
    });

    if (!docsWorkspace) {
        throw new Error("Failed to load docs workspace");
    }

    const uploadedFiles: string[] = [];
    const resolver = new DocsDefinitionResolver({
        domain: "https://translation-images.docs.buildwithfern.com",
        docsWorkspace,
        ossWorkspaces: [],
        apiWorkspaces: [],
        taskContext: context,
        uploadFiles: async (files) =>
            files.map((file) => {
                uploadedFiles.push(String(file.relativeFilePath));
                return { ...file, fileId: String(file.relativeFilePath) };
            }),
        registerApi: async () => ""
    });

    await resolver.resolve();
    return { uploadedFiles };
}

describe("images in translated pages", () => {
    it("uploads images that only a translated page references", async () => {
        const { uploadedFiles } = await resolveFixture();

        // Authored relative to the translated file, and relative to the default-locale page.
        expect(uploadedFiles).toContain("assets/logo-tr.png");
        expect(uploadedFiles).toContain("assets/logo-pt.png");
    });

    it("skips references that are not uploadable assets", async () => {
        const { uploadedFiles } = await resolveFixture();

        // A reference with no file on disk, and a `<Markdown src/>` include.
        expect(uploadedFiles).not.toContain("assets/missing.png");
        expect(uploadedFiles).not.toContain("snippets/shared.mdx");
    });
});
