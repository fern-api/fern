import { SourceResolverImpl } from "@fern-api/cli-source-resolver";
import { parseDocsConfiguration } from "@fern-api/configuration-loader";
import { FdrAPI, FernNavigation } from "@fern-api/fdr-sdk";
import { AbsoluteFilePath, resolve } from "@fern-api/fs-utils";
import { GraphQLConverter } from "@fern-api/graphql-to-fdr";
import { generateIntermediateRepresentation } from "@fern-api/ir-generator";
import { createMockTaskContext } from "@fern-api/task-context";
import { loadAPIWorkspace, loadDocsWorkspace } from "@fern-api/workspace-loader";

import { ApiReferenceNodeConverter } from "../ApiReferenceNodeConverter.js";
import { NodeIdGenerator } from "../NodeIdGenerator.js";
import { convertIrToApiDefinition } from "../utils/convertIrToApiDefinition.js";

const context = createMockTaskContext();

const apiDefinitionId = "550e8400-e29b-41d4-a716-446655440000";

const FIXTURE = "fixtures/graphql-type-navigation/fern";

async function convertFixture({ namespace }: { namespace?: string } = {}): Promise<FernNavigation.V1.ApiReferenceNode> {
    const fernDirectory = resolve(AbsoluteFilePath.of(__dirname), FIXTURE);

    const docsWorkspace = await loadDocsWorkspace({ fernDirectory, context });
    if (docsWorkspace == null) {
        throw new Error("Docs workspace is null");
    }

    const parsedDocsConfig = await parseDocsConfiguration({
        rawDocsConfiguration: docsWorkspace.config,
        context,
        absolutePathToFernFolder: docsWorkspace.absoluteFilePath,
        absoluteFilepathToDocsConfig: docsWorkspace.absoluteFilepathToDocsConfig
    });

    if (parsedDocsConfig.navigation.type !== "untabbed") {
        throw new Error("Expected untabbed navigation");
    }
    const apiSection = parsedDocsConfig.navigation.items[0];
    if (apiSection?.type !== "apiSection") {
        throw new Error("Expected apiSection");
    }

    const result = await loadAPIWorkspace({
        absolutePathToWorkspace: fernDirectory,
        context,
        cliVersion: "0.0.0",
        workspaceName: undefined
    });
    if (!result.didSucceed) {
        throw new Error("API workspace failed to load");
    }
    const apiWorkspace = await result.workspace.toFernWorkspace({ context });

    const graphqlResult = await new GraphQLConverter({
        context,
        filePath: [resolve(AbsoluteFilePath.of(__dirname), `${FIXTURE}/definition/schema.graphql`)],
        namespace,
        examples: []
    }).convert();

    const ir = generateIntermediateRepresentation({
        workspace: apiWorkspace,
        audiences: { type: "all" },
        generationLanguage: undefined,
        keywords: undefined,
        smartCasing: false,
        exampleGeneration: { disabled: false },
        readme: undefined,
        version: undefined,
        packageName: undefined,
        context,
        sourceResolver: new SourceResolverImpl(context, apiWorkspace)
    });

    const apiDefinition = convertIrToApiDefinition({
        ir,
        apiDefinitionId,
        context,
        graphqlOperations: graphqlResult.graphqlOperations,
        graphqlTypes: graphqlResult.types
    });

    return new ApiReferenceNodeConverter(
        apiSection,
        apiDefinition,
        FernNavigation.V1.SlugGenerator.init("/base/path"),
        docsWorkspace,
        context,
        new Map(),
        new Map(),
        new Map(),
        NodeIdGenerator.init(),
        new Map(),
        apiWorkspace,
        undefined,
        undefined,
        undefined,
        undefined,
        graphqlResult.typeCategories
    ).get();
}

function typeSection(
    node: FernNavigation.V1.ApiReferenceNode,
    title: string
): FernNavigation.V1.ApiPackageNode | undefined {
    const typesSections = node.children.filter(
        (child): child is FernNavigation.V1.ApiPackageNode =>
            child.type === "apiPackage" && child.slug.includes("/types/")
    );
    return typesSections.find((child) => child.title === title);
}

function graphqlTypeChildren(section: FernNavigation.V1.ApiPackageNode | undefined) {
    return (section?.children ?? []).filter(
        (child): child is Extract<FernNavigation.V1.ApiPackageChild, { type: "graphqlType" }> =>
            child.type === "graphqlType"
    );
}

describe("GraphQL type navigation", () => {
    it("emits one page per named type, grouped by GraphQL kind", async () => {
        const node = await convertFixture();

        const objects = typeSection(node, "Objects");
        expect(graphqlTypeChildren(objects).map((child) => child.title)).toEqual(["Collection", "Product"]);
        expect(graphqlTypeChildren(objects).map((child) => child.slug)).toEqual([
            "base/path/graph-ql-api-reference/types/objects/collection",
            "base/path/graph-ql-api-reference/types/objects/product"
        ]);

        expect(graphqlTypeChildren(typeSection(node, "Inputs")).map((child) => child.slug)).toEqual([
            "base/path/graph-ql-api-reference/types/inputs/product-input"
        ]);
        expect(graphqlTypeChildren(typeSection(node, "Interfaces")).map((child) => child.slug)).toEqual([
            "base/path/graph-ql-api-reference/types/interfaces/node"
        ]);
        expect(graphqlTypeChildren(typeSection(node, "Enums")).map((child) => child.slug)).toEqual([
            "base/path/graph-ql-api-reference/types/enums/product-sort-keys"
        ]);
        expect(graphqlTypeChildren(typeSection(node, "Unions")).map((child) => child.slug)).toEqual([
            "base/path/graph-ql-api-reference/types/unions/search-result"
        ]);
        expect(graphqlTypeChildren(typeSection(node, "Scalars")).map((child) => child.slug)).toEqual([
            "base/path/graph-ql-api-reference/types/scalars/date-time"
        ]);
    });

    it("records the category on every node and never emits a Query or Mutation page", async () => {
        const node = await convertFixture();

        const categoriesByTitle = new Map<string, FernNavigation.GraphQlTypeCategory>();
        for (const { category, title } of [
            { category: "object", title: "Objects" },
            { category: "input", title: "Inputs" },
            { category: "interface", title: "Interfaces" },
            { category: "enum", title: "Enums" },
            { category: "union", title: "Unions" },
            { category: "scalar", title: "Scalars" }
        ] as const) {
            for (const child of graphqlTypeChildren(typeSection(node, title))) {
                expect(child.typeCategory).toBe(category);
                categoriesByTitle.set(child.title, child.typeCategory);
            }
        }

        expect(categoriesByTitle.has("Query")).toBe(false);
        expect(categoriesByTitle.has("Mutation")).toBe(false);
        expect(categoriesByTitle.size).toBe(7);
    });

    it("does not create a section for a kind the schema does not declare", async () => {
        const node = await convertFixture();

        // The fixture declares no subscriptions, so the operations side has no Subscriptions
        // section; every types section that exists has at least one page.
        for (const child of node.children) {
            if (child.type === "apiPackage" && child.slug.includes("/types/")) {
                expect(graphqlTypeChildren(child).length).toBeGreaterThan(0);
            }
        }

        expect(typeSection(node, "Objects")).toBeDefined();
        expect(node.children.find((child) => child.type === "apiPackage" && child.title === "Scalars")).toBeDefined();
    });

    it("keeps namespaced type ids and slugs distinct so same-named types do not collide", async () => {
        const node = await convertFixture({ namespace: "storefront" });

        const objects = graphqlTypeChildren(typeSection(node, "Objects"));
        expect(objects.map((child) => child.typeId)).toEqual([
            FdrAPI.TypeId("storefront_Collection"),
            FdrAPI.TypeId("storefront_Product")
        ]);
        expect(objects.map((child) => child.slug)).toEqual([
            "base/path/graph-ql-api-reference/types/objects/storefront-collection",
            "base/path/graph-ql-api-reference/types/objects/storefront-product"
        ]);
    });
});
