import { FernNavigation } from "@fern-api/fdr-sdk";
import { AbsoluteFilePath, resolve } from "@fern-api/fs-utils";
import { createMockTaskContext } from "@fern-api/task-context";
import { loadDocsWorkspace } from "@fern-api/workspace-loader";
import { DocsDefinitionResolver } from "../DocsDefinitionResolver.js";

async function resolveFixture(fixture: string): Promise<FernNavigation.V1.RootNode> {
    const context = createMockTaskContext();
    const docsWorkspace = await loadDocsWorkspace({
        fernDirectory: resolve(AbsoluteFilePath.of(__dirname), `fixtures/tab-menu/${fixture}/fern`),
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
    const resolved = await resolver.resolve();
    if (resolved.config.root == null) {
        throw new Error("Failed to resolve docs root");
    }
    return resolved.config.root;
}

function collect(root: FernNavigation.V1.RootNode): {
    tabs: FernNavigation.V1.TabNode[];
    varianted: FernNavigation.V1.VariantedNode[];
    pageSlugs: string[];
} {
    const tabs: FernNavigation.V1.TabNode[] = [];
    const varianted: FernNavigation.V1.VariantedNode[] = [];
    const pageSlugs: string[] = [];
    FernNavigation.V1.traverseDF(root, (node) => {
        if (node.type === "tab") {
            tabs.push(node);
        } else if (node.type === "varianted") {
            varianted.push(node);
        } else if (node.type === "page") {
            pageSlugs.push(node.slug);
        }
    });
    return { tabs, varianted, pageSlugs };
}

describe("tab-menu", () => {
    it("nests member URLs under the menu tab, in menu order", async () => {
        const { tabs, varianted, pageSlugs } = collect(await resolveFixture("header"));
        expect(tabs.map((tab) => tab.title)).toEqual(["Guides", "Products"]);
        expect(varianted).toHaveLength(1);
        const [menu] = varianted;
        expect(menu?.location).toBe("tab");
        expect(menu?.columnHeight).toBe(2);
        expect(menu?.children.map((variant) => [variant.title, variant.slug])).toEqual([
            ["Agents", "products/agents"],
            ["Studio", "products/studio"],
            ["Agents", "products/agents-legacy"]
        ]);
        expect(pageSlugs).toEqual(
            expect.arrayContaining([
                "guides/guides",
                "products/agents/overview",
                "products/studio/overview",
                "products/agents-legacy/overview"
            ])
        );
    });

    it("keeps menu groups, links, defaults and hidden members", async () => {
        const [menu] = collect(await resolveFixture("header")).varianted;
        expect(menu?.children.map((variant) => [variant.default, variant.hidden ?? false])).toEqual([
            [false, false],
            [true, false],
            [false, true]
        ]);
        expect(menu?.children[0]?.subtitle).toBe("Build AI agents");
        expect(menu?.menu?.map((entry) => entry.type)).toEqual(["group", "variant", "variant"]);
        const [group] = menu?.menu ?? [];
        expect(group?.type === "group" ? group.children.map((entry) => entry.type) : []).toEqual(["variant", "link"]);
    });

    it("gives members with the same display name distinct ids", async () => {
        const [menu] = collect(await resolveFixture("header")).varianted;
        const variantIds = menu?.children.map((variant) => variant.variantId) ?? [];
        expect(variantIds).toEqual(["agents", "studio", "agents-legacy"]);
        const ids = menu?.children.map((variant) => variant.id) ?? [];
        expect(new Set(ids).size).toBe(ids.length);
    });

    it("falls back to a single-list sidebar selector without header tabs", async () => {
        const [menu] = collect(await resolveFixture("sidebar")).varianted;
        expect(menu?.location).toBe("sidebar");
        expect(menu?.columnHeight).toBeUndefined();
        expect(menu?.children.map((variant) => variant.slug)).toEqual([
            "products/agents",
            "products/studio",
            "products/agents-legacy"
        ]);
    });
});
