import { AbsoluteFilePath, resolve } from "@fern-api/fs-utils";
import { createMockTaskContext } from "@fern-api/task-context";
import { loadDocsWorkspace } from "@fern-api/workspace-loader";
import { DocsDefinitionResolver } from "../DocsDefinitionResolver.js";

const context = createMockTaskContext();

async function resolveFixture() {
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

    if (root == null) {
        throw new Error("Failed to resolve docs root");
    }

    const rootChild = root.child;
    if (rootChild.type !== "productgroup") {
        throw new Error(`Expected productgroup, got ${rootChild.type}`);
    }

    return rootChild;
}

describe("product-level landing page in product groups", () => {
    it("should resolve landing page for unversioned products within a product group", async () => {
        const productGroup = await resolveFixture();

        // Sunflower has a landing page configured
        const sunflower = productGroup.children[0];
        if (sunflower?.type !== "product") {
            throw new Error("Expected product node");
        }
        if (sunflower.child.type !== "unversioned") {
            throw new Error("Expected unversioned child");
        }

        const landingPage = sunflower.child.landingPage;
        expect(landingPage).toBeDefined();
        expect(landingPage?.type).toBe("landingPage");
        expect(landingPage?.pageId).toContain("sunflower-landing.mdx");

        // Cactus has no landing page configured
        const cactus = productGroup.children[1];
        if (cactus?.type !== "product") {
            throw new Error("Expected product node");
        }
        if (cactus.child.type !== "unversioned") {
            throw new Error("Expected unversioned child");
        }

        expect(cactus.child.landingPage).toBeUndefined();
    });

    it("should propagate product landing page to versioned navigation nodes as fallback", async () => {
        const productGroup = await resolveFixture();

        // Rose is the third product — versioned with a product-level landing page
        const rose = productGroup.children[2];
        if (rose?.type !== "product") {
            throw new Error("Expected product node");
        }
        if (rose.child.type !== "versioned") {
            throw new Error(`Expected versioned child, got ${rose.child.type}`);
        }

        // Both versions should inherit the product-level landing page as fallback
        const versions = rose.child.children;
        expect(versions.length).toBe(2);

        const v2 = versions[0];
        if (v2?.type !== "version") {
            throw new Error("Expected version node");
        }
        expect(v2.landingPage).toBeDefined();
        expect(v2.landingPage?.type).toBe("landingPage");
        expect(v2.landingPage?.pageId).toContain("rose-landing.mdx");

        const v1 = versions[1];
        if (v1?.type !== "version") {
            throw new Error("Expected version node");
        }
        expect(v1.landingPage).toBeDefined();
        expect(v1.landingPage?.type).toBe("landingPage");
        expect(v1.landingPage?.pageId).toContain("rose-landing.mdx");
    });
});
