import { FernNavigation } from "@fern-api/fdr-sdk";
import { AbsoluteFilePath, resolve } from "@fern-api/fs-utils";
import { createMockTaskContext } from "@fern-api/task-context";
import { loadDocsWorkspace } from "@fern-api/workspace-loader";
import { DocsDefinitionResolver } from "../DocsDefinitionResolver.js";

const context = createMockTaskContext();

// The published @fern-api/fdr-sdk does not yet declare `ProductGroupNode.changelog`;
// narrow structurally until the SDK is bumped.
function hasRootChangelog(
    node: FernNavigation.V1.ProductGroupNode
): node is FernNavigation.V1.ProductGroupNode & { changelog: FernNavigation.V1.ChangelogNode } {
    return "changelog" in node && node.changelog != null;
}

async function resolveProductGroup(): Promise<FernNavigation.V1.ProductGroupNode> {
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

    const root = (await resolver.resolve()).config.root;
    if (root == null || root.child.type !== "productgroup") {
        throw new Error("Expected a productgroup root");
    }
    return root.child;
}

describe("site-level changelog on a product group", () => {
    it("hangs the changelog off the root, slugged at /changelog", async () => {
        const productGroup = await resolveProductGroup();

        if (!hasRootChangelog(productGroup)) {
            throw new Error("Expected productgroup.changelog to be set");
        }
        const changelog = productGroup.changelog;
        expect(changelog.type).toBe("changelog");
        expect(changelog.title).toBe("Changelog");
        expect(changelog.slug).toBe("changelog");
        expect(changelog.hidden).toBeFalsy();

        const entries = changelog.children
            .flatMap((year) => year.children)
            .flatMap((month) => month.children)
            .map((entry) => ({ slug: entry.slug, pageId: entry.pageId }));
        expect(entries).toEqual([
            { slug: "changelog/2026/6/2", pageId: "changelog/2026-06-02.mdx" },
            { slug: "changelog/2026/6/1", pageId: "changelog/2026-06-01.mdx" }
        ]);
    });

    it("does not add the changelog to the product switcher", async () => {
        const productGroup = await resolveProductGroup();

        expect(productGroup.children.map((product) => product.productId)).toEqual([
            "Sunflower API",
            "Cactus API",
            "Rose API"
        ]);
        expect(productGroup.children.every((product) => product.type === "product")).toBe(true);
    });
});
