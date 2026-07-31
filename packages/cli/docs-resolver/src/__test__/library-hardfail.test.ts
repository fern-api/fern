import { AbsoluteFilePath, resolve } from "@fern-api/fs-utils";
import { createMockTaskContext } from "@fern-api/task-context";
import { loadDocsWorkspace } from "@fern-api/workspace-loader";
import { describe, expect, it } from "vitest";

import { DocsDefinitionResolver } from "../DocsDefinitionResolver.js";

const context = createMockTaskContext();

/**
 * When a library section is unconfigured or its generated output is missing, the
 * resolver warns and omits the section rather than failing the build. These fixtures
 * exercise the three missing-output cases and assert resolution still succeeds.
 */
describe("library section missing output", () => {
    async function resolveFixture(fixture: string): Promise<void> {
        const docsWorkspace = await loadDocsWorkspace({
            fernDirectory: resolve(AbsoluteFilePath.of(__dirname), `fixtures/library-hardfail/${fixture}/fern`),
            context
        });
        if (docsWorkspace == null) {
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
        await resolver.resolve();
    }

    it("warns and skips when the library is not configured in libraries", async () => {
        await expect(resolveFixture("missing-config")).resolves.toBeUndefined();
    });

    it("warns and skips when the library has no generated output (missing _navigation.yml)", async () => {
        await expect(resolveFixture("missing-nav")).resolves.toBeUndefined();
    });

    it("warns and skips a referenced generated page whose MDX is missing", async () => {
        await expect(resolveFixture("missing-mdx")).resolves.toBeUndefined();
    });
});
