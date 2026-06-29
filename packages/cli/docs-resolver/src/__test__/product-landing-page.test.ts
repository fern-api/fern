import { FernNavigation } from "@fern-api/fdr-sdk";
import { AbsoluteFilePath, resolve } from "@fern-api/fs-utils";
import { createMockTaskContext } from "@fern-api/task-context";
import { loadDocsWorkspace } from "@fern-api/workspace-loader";
import { DocsDefinitionResolver } from "../DocsDefinitionResolver.js";

const context = createMockTaskContext();

describe("product-level landing page in product groups", () => {
    it("should resolve landing page for unversioned products within a product group", async () => {
        const docsWorkspace = await loadDocsWorkspace({
            fernDirectory: resolve(AbsoluteFilePath.of(__dirname), "fixtures/product-landing-page/fern"),
            context
        });

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

        const resolvedDocs = await resolver.resolve();
        const root = resolvedDocs.config.root;
        expect(root).toBeDefined();

        // The root child should be a product group
        const rootChild = root!.child;
        expect(rootChild.type).toBe("productgroup");

        if (rootChild.type !== "productgroup") {
            throw new Error("Expected productgroup");
        }

        // First product (Sunflower) has a landing page configured
        const sunflower = rootChild.children[0];
        expect(sunflower).toBeDefined();
        expect(sunflower!.type).toBe("product");

        if (sunflower!.type !== "product") {
            throw new Error("Expected product node");
        }

        // The product's child should be an unversioned node
        expect(sunflower!.child.type).toBe("unversioned");

        if (sunflower!.child.type !== "unversioned") {
            throw new Error("Expected unversioned child");
        }

        // The unversioned node should have a landing page
        const landingPage = sunflower!.child.landingPage;
        expect(landingPage).toBeDefined();
        expect(landingPage!.type).toBe("landingPage");
        expect(landingPage!.pageId).toContain("sunflower-landing.mdx");

        // Second product (Cactus) has no landing page configured
        const cactus = rootChild.children[1];
        expect(cactus).toBeDefined();
        expect(cactus!.type).toBe("product");

        if (cactus!.type !== "product") {
            throw new Error("Expected product node");
        }

        expect(cactus!.child.type).toBe("unversioned");

        if (cactus!.child.type !== "unversioned") {
            throw new Error("Expected unversioned child");
        }

        // Cactus should NOT have a landing page
        expect(cactus!.child.landingPage).toBeUndefined();
    });
});
