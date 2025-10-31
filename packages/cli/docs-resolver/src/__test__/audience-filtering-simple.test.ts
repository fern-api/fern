import { AbsoluteFilePath, resolve } from "@fern-api/fs-utils";
import { createMockTaskContext } from "@fern-api/task-context";
import { loadDocsWorkspace } from "@fern-api/workspace-loader";

import { DocsDefinitionResolver } from "../DocsDefinitionResolver";

const context = createMockTaskContext();

describe("Audience filtering basic functionality", () => {
    let docsWorkspace: NonNullable<Awaited<ReturnType<typeof loadDocsWorkspace>>>;

    beforeAll(async () => {
        const loadedWorkspace = await loadDocsWorkspace({
            fernDirectory: resolve(AbsoluteFilePath.of(__dirname), "fixtures/audience-versioned/fern"),
            context
        });

        if (loadedWorkspace == null) {
            throw new Error("Workspace is null");
        }

        docsWorkspace = loadedWorkspace;
    });

    describe("basic functionality", () => {
        it("resolver creates successfully without target audiences", async () => {
            const resolver = new DocsDefinitionResolver({
                domain: "test.domain.com",
                docsWorkspace,
                ossWorkspaces: [],
                apiWorkspaces: [],
                taskContext: context,
                editThisPage: undefined,
                uploadFiles: async (_files) => [],
                registerApi: async (_opts) => "",
                targetAudiences: undefined
            });

            const resolved = await resolver.resolve();

            expect(resolved).toBeDefined();
            expect(resolved.config).toBeDefined();
            expect(resolved.pages).toBeDefined();
        });

        it("resolver creates successfully with target audiences", async () => {
            const resolver = new DocsDefinitionResolver({
                domain: "test.domain.com",
                docsWorkspace,
                ossWorkspaces: [],
                apiWorkspaces: [],
                taskContext: context,
                editThisPage: undefined,
                uploadFiles: async (_files) => [],
                registerApi: async (_opts) => "",
                targetAudiences: ["external"]
            });

            const resolved = await resolver.resolve();

            expect(resolved).toBeDefined();
            expect(resolved.config).toBeDefined();
            expect(resolved.pages).toBeDefined();
        });

        it("resolver processes multiple target audiences", async () => {
            const resolver = new DocsDefinitionResolver({
                domain: "test.domain.com",
                docsWorkspace,
                ossWorkspaces: [],
                apiWorkspaces: [],
                taskContext: context,
                editThisPage: undefined,
                uploadFiles: async (_files) => [],
                registerApi: async (_opts) => "",
                targetAudiences: ["external", "internal"]
            });

            const resolved = await resolver.resolve();

            expect(resolved).toBeDefined();
            expect(resolved.config).toBeDefined();
            expect(resolved.pages).toBeDefined();
        });

        it("resolver handles empty target audiences array", async () => {
            const resolver = new DocsDefinitionResolver({
                domain: "test.domain.com",
                docsWorkspace,
                ossWorkspaces: [],
                apiWorkspaces: [],
                taskContext: context,
                editThisPage: undefined,
                uploadFiles: async (_files) => [],
                registerApi: async (_opts) => "",
                targetAudiences: []
            });

            const resolved = await resolver.resolve();

            expect(resolved).toBeDefined();
            expect(resolved.config).toBeDefined();
            expect(resolved.pages).toBeDefined();
        });

        it("resolver handles non-matching audiences", async () => {
            const resolver = new DocsDefinitionResolver({
                domain: "test.domain.com",
                docsWorkspace,
                ossWorkspaces: [],
                apiWorkspaces: [],
                taskContext: context,
                editThisPage: undefined,
                uploadFiles: async (_files) => [],
                registerApi: async (_opts) => "",
                targetAudiences: ["non-existent-audience"]
            });

            const resolved = await resolver.resolve();

            expect(resolved).toBeDefined();
            expect(resolved.config).toBeDefined();
            expect(resolved.pages).toBeDefined();
        });

        it("includes expected pages from fixtures", async () => {
            const resolver = new DocsDefinitionResolver({
                domain: "test.domain.com",
                docsWorkspace,
                ossWorkspaces: [],
                apiWorkspaces: [],
                taskContext: context,
                editThisPage: undefined,
                uploadFiles: async (_files) => [],
                registerApi: async (_opts) => "",
                targetAudiences: undefined
            });

            const resolved = await resolver.resolve();

            // Check that some pages are processed
            const pageIds = Object.keys(resolved.pages);
            expect(pageIds.length).toBeGreaterThan(0);

            // Check that fixture pages are included
            const hasV1Overview = pageIds.some((id) => id.includes("v1/overview"));
            const hasV2Overview = pageIds.some((id) => id.includes("v2/overview"));
            const hasV3Beta = pageIds.some((id) => id.includes("v3/beta"));

            expect(hasV1Overview || hasV2Overview || hasV3Beta).toBe(true);
        });
    });
});
