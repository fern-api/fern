import { SourceResolverImpl } from "@fern-api/cli-source-resolver";
import { parseDocsConfiguration } from "@fern-api/configuration-loader";
import { FdrAPI, FernNavigation } from "@fern-api/fdr-sdk";
import { AbsoluteFilePath, resolve } from "@fern-api/fs-utils";
import { generateIntermediateRepresentation } from "@fern-api/ir-generator";
import { createMockTaskContext } from "@fern-api/task-context";
import { loadAPIWorkspace, loadDocsWorkspace } from "@fern-api/workspace-loader";

import { ApiReferenceNodeConverter } from "../ApiReferenceNodeConverter.js";
import { NodeIdGenerator } from "../NodeIdGenerator.js";
import { collectInlineTypeIds } from "../utils/collectInlineTypeIds.js";
import { convertIrToApiDefinition } from "../utils/convertIrToApiDefinition.js";

const context = createMockTaskContext();

const apiDefinitionId = "550e8400-e29b-41d4-a716-446655440000";

const FIXTURE = "fixtures/api-type-navigation/fern";

async function convertFixture({ types = true }: { types?: boolean } = {}): Promise<FernNavigation.V1.ApiReferenceNode> {
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

    const apiDefinition = convertIrToApiDefinition({ ir, apiDefinitionId, context });

    return new ApiReferenceNodeConverter(
        { ...apiSection, types },
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
        undefined,
        types ? collectInlineTypeIds(ir) : undefined
    ).get();
}

function typesSection(node: FernNavigation.V1.ApiReferenceNode): FernNavigation.V1.ApiPackageNode | undefined {
    return node.children.find(
        (child): child is FernNavigation.V1.ApiPackageNode => child.type === "apiPackage" && child.title === "Types"
    );
}

function apiTypeChildren(section: FernNavigation.V1.ApiPackageNode | undefined) {
    return (section?.children ?? []).filter(
        (child): child is Extract<FernNavigation.V1.ApiPackageChild, { type: "apiType" }> => child.type === "apiType"
    );
}

describe("API type navigation (`types: true`)", () => {
    it("emits one page per schema no operation references, sorted by title", async () => {
        const node = await convertFixture();
        const section = typesSection(node);
        expect(section).toBeDefined();
        // `Pet` is the endpoint's response and `Owner` is reached through it, so neither gets a
        // page; `Break` is reached only through the unreferenced `Say`, so it does.
        expect(apiTypeChildren(section).map((child) => child.title)).toEqual(["Break", "Dial", "Say"]);
    });

    it("places the section last, after the endpoint packages, under <api>/types/<type>", async () => {
        const node = await convertFixture();
        const last = node.children[node.children.length - 1];
        expect(last?.type === "apiPackage" && last.title === "Types").toBe(true);
        const children = apiTypeChildren(typesSection(node));
        expect(children.map((child) => child.slug)).toEqual([
            "base/path/api-reference/types/break",
            "base/path/api-reference/types/dial",
            "base/path/api-reference/types/say"
        ]);
        expect(children.map((child) => child.typeId)).toEqual(["type_:Break", "type_:Dial", "type_:Say"]);
        for (const child of children) {
            expect(child.apiDefinitionId).toBe(apiDefinitionId);
        }
    });

    it("emits nothing when the flag is off", async () => {
        const node = await convertFixture({ types: false });
        expect(typesSection(node)).toBeUndefined();
    });
});
