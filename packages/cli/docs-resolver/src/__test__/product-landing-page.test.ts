import { FernNavigation } from "@fern-api/fdr-sdk";
import { AbsoluteFilePath, resolve } from "@fern-api/fs-utils";
import { createMockTaskContext } from "@fern-api/task-context";
import { loadDocsWorkspace } from "@fern-api/workspace-loader";
import { DocsDefinitionResolver } from "../DocsDefinitionResolver.js";

const context = createMockTaskContext();

/**
 * Product-level `landing-page:` config inside product yml files is intentionally
 * NOT emitted into the navigation tree. This matches the legacy (< 5.58.0)
 * publish behavior that live docs sites were authored against: emitting the
 * landing page would make it the first node visited during slug collection,
 * shadowing any page in the product that shares its slug and stripping that
 * page's sidebar at render time (see versioned-root-landing-page.test.ts for
 * the versioned equivalent, narrowed from a real customer docset).
 */
describe("product-level landing page in product groups", () => {
    it("does not emit product-level landing pages (legacy parity)", async () => {
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

        // The root child should be a product group
        const rootChild = root.child;
        expect(rootChild.type).toBe("productgroup");

        if (rootChild.type !== "productgroup") {
            throw new Error("Expected productgroup");
        }

        // First product (Sunflower) has a landing page configured in its
        // product yml — it must NOT be emitted into the tree.
        const sunflower = rootChild.children[0];
        expect(sunflower).toBeDefined();
        expect(sunflower?.type).toBe("product");

        if (sunflower?.type !== "product") {
            throw new Error("Expected product node");
        }

        expect(sunflower?.child.type).toBe("unversioned");

        if (sunflower?.child.type !== "unversioned") {
            throw new Error("Expected unversioned child");
        }

        expect(sunflower?.child.landingPage).toBeUndefined();

        // Second product (Cactus) has no landing page configured
        const cactus = rootChild.children[1];
        expect(cactus).toBeDefined();
        expect(cactus?.type).toBe("product");

        if (cactus?.type !== "product") {
            throw new Error("Expected product node");
        }

        expect(cactus?.child.type).toBe("unversioned");

        if (cactus?.child.type !== "unversioned") {
            throw new Error("Expected unversioned child");
        }

        expect(cactus?.child.landingPage).toBeUndefined();

        // End-to-end: the product's navigation pages still resolve as regular
        // pages via the shared request-time resolution path (both the v2 and
        // ledger docs loaders execute this code).
        const latestRoot = FernNavigation.migrate.FernNavigationV1ToLatest.create().root(root);
        const found = FernNavigation.utils.findNode(latestRoot, FernNavigation.Slug("sunflower/growing-guide"));

        expect(found.type).toBe("found");
        if (found.type !== "found") {
            throw new Error("Expected sunflower guide page to resolve");
        }
        expect(found.node.type).toBe("page");
        expect(found.sidebar).toBeDefined();
    });
});
