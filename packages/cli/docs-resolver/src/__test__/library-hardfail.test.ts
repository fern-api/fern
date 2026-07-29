import { AbsoluteFilePath, resolve } from "@fern-api/fs-utils";
import { createMockTaskContext } from "@fern-api/task-context";
import { loadDocsWorkspace } from "@fern-api/workspace-loader";
import { describe, expect, it } from "vitest";

import { DocsDefinitionResolver } from "../DocsDefinitionResolver.js";

const context = createMockTaskContext();

/**
 * Library sections used to warn-and-continue when a library was unconfigured or its
 * generated output was missing, silently publishing a site missing the section. They
 * now hard-fail like `api:` sections, naming the library (and version/ref when the
 * section comes from a git-ref-backed version).
 */
describe("library section hard failures", () => {
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

    it("fails when the library is not configured in libraries", async () => {
        await expect(resolveFixture("missing-config")).rejects.toThrow(
            /library 'guardrails-python-sdk' is not configured in libraries/
        );
    });

    it("fails when the library has no generated output (missing _navigation.yml)", async () => {
        await expect(resolveFixture("missing-nav")).rejects.toThrow(
            /library 'guardrails-python-sdk' has no generated output.*missing _navigation\.yml/s
        );
    });

    it("fails when a referenced generated page MDX is missing", async () => {
        await expect(resolveFixture("missing-mdx")).rejects.toThrow(
            /library 'guardrails-python-sdk' is missing generated page 'quickstart\.mdx'/
        );
    });
});
