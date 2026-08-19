import { AbsoluteFilePath, RelativeFilePath, resolve } from "@fern-api/fs-utils";
import { createMockTaskContext } from "@fern-api/task-context";
import { loadDocsWorkspace } from "@fern-api/workspace-loader";
import { describe, expect, it } from "vitest";

import { DocsDefinitionResolver } from "../DocsDefinitionResolver.js";

const context = createMockTaskContext();

async function resolveFixture(): Promise<DocsDefinitionResolver> {
    const docsWorkspace = await loadDocsWorkspace({
        fernDirectory: resolve(AbsoluteFilePath.of(__dirname), RelativeFilePath.of("fixtures/translation-images/fern")),
        context
    });

    if (!docsWorkspace) {
        throw new Error("Failed to load docs workspace");
    }

    const resolver = new DocsDefinitionResolver({
        domain: "https://translation-images.docs.buildwithfern.com",
        docsWorkspace,
        ossWorkspaces: [],
        apiWorkspaces: [],
        taskContext: context,
        uploadFiles: async (files) => files.map((file) => ({ ...file, fileId: String(file.relativeFilePath) })),
        registerApi: async () => ""
    });

    await resolver.resolve();
    return resolver;
}

describe("images in translated pages", () => {
    it("replaces image paths in translated pages with the uploaded file ids", async () => {
        const resolver = await resolveFixture();
        const translationPages = resolver.getTranslationPages();

        expect(translationPages?.tr?.[RelativeFilePath.of("pages/landing.mdx")]).toContain(
            'src="file:assets/logo.png"'
        );
    });

    it("falls back to the default-locale page's location when the translation mirrors its image paths", async () => {
        const resolver = await resolveFixture();
        const translationPages = resolver.getTranslationPages();

        expect(translationPages?.pt?.[RelativeFilePath.of("pages/landing.mdx")]).toContain(
            'src="file:assets/logo.png"'
        );
    });
});
