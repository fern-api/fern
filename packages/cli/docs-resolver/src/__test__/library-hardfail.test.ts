import type { DocsV1Write } from "@fern-api/fdr-sdk";
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
    async function resolveFixture(fixture: string): Promise<DocsV1Write.DocsDefinition> {
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
        return await resolver.resolve();
    }

    it("warns and skips when the library is not configured in libraries", async () => {
        await expect(resolveFixture("missing-config")).resolves.toBeDefined();
    });

    it("warns and skips when the library has no generated output (missing _navigation.yml)", async () => {
        await expect(resolveFixture("missing-nav")).resolves.toBeDefined();
    });

    it("warns and skips a referenced generated page whose MDX is missing", async () => {
        await expect(resolveFixture("missing-mdx")).resolves.toBeDefined();
    });

    it("keeps the root page as section overview when the navigation has no public children", async () => {
        const definition = await resolveFixture("empty-nav");
        expect(Object.keys(definition.pages)).toContain("static/guardrails/guardrails-python-sdk/guardrails.mdx");
    });

    it("nests library pages under the tab and section the library entry is placed in", async () => {
        const definition = await resolveFixture("nested-under-tab");
        const slugs: Record<string, string> = {};
        const collect = (node: unknown): void => {
            if (node == null || typeof node !== "object") {
                return;
            }
            const record = node as Record<string, unknown>;
            const pageId = record.pageId ?? record.overviewPageId;
            if (typeof pageId === "string" && typeof record.slug === "string") {
                slugs[pageId] = record.slug;
            }
            for (const value of Object.values(record)) {
                collect(value);
            }
        };
        collect(definition.config.root);

        const base = "static/guardrails/guardrails-python-sdk/guardrails";
        expect(slugs).toEqual({
            [`${base}/index.mdx`]: "api-reference/python-api-reference/sdk-reference",
            [`${base}/client.mdx`]: "api-reference/python-api-reference/sdk-reference/client",
            [`${base}/validators/index.mdx`]: "api-reference/python-api-reference/sdk-reference/validators",
            [`${base}/validators/regex.mdx`]: "api-reference/python-api-reference/sdk-reference/validators/regex"
        });
        const indexPage = Object.entries(definition.pages).find(([id]) => id === `${base}/index.mdx`)?.[1];
        expect(indexPage?.markdown).toContain("](/api-reference/python-api-reference/sdk-reference/validators/regex)");
    });
});
