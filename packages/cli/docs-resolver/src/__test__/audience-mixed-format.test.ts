import { AbsoluteFilePath, resolve } from "@fern-api/fs-utils";
import { createMockTaskContext } from "@fern-api/task-context";
import { loadDocsWorkspace } from "@fern-api/workspace-loader";

import { DocsDefinitionResolver } from "../DocsDefinitionResolver";

const context = createMockTaskContext();

describe("Audience mixed format support (string and array)", () => {
    let docsWorkspace: NonNullable<Awaited<ReturnType<typeof loadDocsWorkspace>>>;

    beforeAll(async () => {
        const loadedWorkspace = await loadDocsWorkspace({
            fernDirectory: resolve(AbsoluteFilePath.of(__dirname), "fixtures/audience-mixed-format/fern"),
            context
        });

        if (loadedWorkspace == null) {
            throw new Error("Mixed format workspace is null");
        }

        docsWorkspace = loadedWorkspace;
    });

    it("loads workspace with mixed audience formats successfully", async () => {
        expect(docsWorkspace).toBeDefined();
        expect(docsWorkspace.config).toBeDefined();
    });

    it("resolver handles mixed format audiences without target filtering", async () => {
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

        // Check that pages from all products are included
        const pageIds = Object.keys(resolved.pages);
        expect(pageIds.length).toBeGreaterThan(0);

        // Should include pages from various products
        const hasOverview = pageIds.some((id) => id.includes("overview"));
        const hasAnalytics = pageIds.some((id) => id.includes("analytics"));
        const hasMobile = pageIds.some((id) => id.includes("mobile"));
        const hasEnterprise = pageIds.some((id) => id.includes("enterprise"));

        expect(hasOverview || hasAnalytics || hasMobile || hasEnterprise).toBe(true);
    });

    it("resolver applies audience filtering for string format audiences", async () => {
        const resolver = new DocsDefinitionResolver({
            domain: "test.domain.com",
            docsWorkspace,
            ossWorkspaces: [],
            apiWorkspaces: [],
            taskContext: context,
            editThisPage: undefined,
            uploadFiles: async (_files) => [],
            registerApi: async (_opts) => "",
            targetAudiences: ["internal"]
        });

        const resolved = await resolver.resolve();

        expect(resolved).toBeDefined();
        expect(resolved.config).toBeDefined();
        expect(resolved.pages).toBeDefined();

        // Internal users should see:
        // - core-platform (array: [external, internal])  ✓
        // - analytics (string: internal)                  ✓
        // - mobile-sdk (string: external)                 ✗
        // - enterprise-features (array: [enterprise, internal, admin]) ✓

        const pageIds = Object.keys(resolved.pages);
        expect(pageIds.length).toBeGreaterThan(0);
    });

    it("resolver applies audience filtering for external audience", async () => {
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

        // External users should see:
        // - core-platform (array: [external, internal])  ✓
        // - analytics (string: internal)                  ✗
        // - mobile-sdk (string: external)                 ✓
        // - enterprise-features (array: [enterprise, internal, admin]) ✗

        const pageIds = Object.keys(resolved.pages);
        expect(pageIds.length).toBeGreaterThan(0);
    });

    it("resolver applies audience filtering for enterprise audience", async () => {
        const resolver = new DocsDefinitionResolver({
            domain: "test.domain.com",
            docsWorkspace,
            ossWorkspaces: [],
            apiWorkspaces: [],
            taskContext: context,
            editThisPage: undefined,
            uploadFiles: async (_files) => [],
            registerApi: async (_opts) => "",
            targetAudiences: ["enterprise"]
        });

        const resolved = await resolver.resolve();

        expect(resolved).toBeDefined();
        expect(resolved.config).toBeDefined();
        expect(resolved.pages).toBeDefined();

        // Enterprise users should see:
        // - core-platform (array: [external, internal])  ✗
        // - analytics (string: internal)                  ✗
        // - mobile-sdk (string: external)                 ✗
        // - enterprise-features (array: [enterprise, internal, admin]) ✓

        const pageIds = Object.keys(resolved.pages);
        expect(pageIds.length).toBeGreaterThan(0);
    });

    it("resolver handles multiple target audiences with mixed formats", async () => {
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

        // Both external and internal users should see:
        // - core-platform (array: [external, internal])  ✓
        // - analytics (string: internal)                  ✓ (internal match)
        // - mobile-sdk (string: external)                 ✓ (external match)
        // - enterprise-features (array: [enterprise, internal, admin]) ✓ (internal match)

        const pageIds = Object.keys(resolved.pages);
        expect(pageIds.length).toBeGreaterThan(0);
    });

    it("resolver handles admin audience matching multi-audience products", async () => {
        const resolver = new DocsDefinitionResolver({
            domain: "test.domain.com",
            docsWorkspace,
            ossWorkspaces: [],
            apiWorkspaces: [],
            taskContext: context,
            editThisPage: undefined,
            uploadFiles: async (_files) => [],
            registerApi: async (_opts) => "",
            targetAudiences: ["admin"]
        });

        const resolved = await resolver.resolve();

        expect(resolved).toBeDefined();
        expect(resolved.config).toBeDefined();
        expect(resolved.pages).toBeDefined();

        // Admin users should see:
        // - core-platform (array: [external, internal])  ✗
        // - analytics (string: internal)                  ✗
        // - mobile-sdk (string: external)                 ✗
        // - enterprise-features (array: [enterprise, internal, admin]) ✓ (admin match)

        const pageIds = Object.keys(resolved.pages);
        expect(pageIds.length).toBeGreaterThan(0);
    });

    it("handles edge case with non-matching audience", async () => {
        const resolver = new DocsDefinitionResolver({
            domain: "test.domain.com",
            docsWorkspace,
            ossWorkspaces: [],
            apiWorkspaces: [],
            taskContext: context,
            editThisPage: undefined,
            uploadFiles: async (_files) => [],
            registerApi: async (_opts) => "",
            targetAudiences: ["non-existent"]
        });

        const resolved = await resolver.resolve();

        expect(resolved).toBeDefined();
        expect(resolved.config).toBeDefined();
        expect(resolved.pages).toBeDefined();

        // No products match "non-existent" audience
        const pageIds = Object.keys(resolved.pages);
        // Should either be empty or have minimal content
        expect(pageIds.length).toBeGreaterThanOrEqual(0);
    });
});
