import { SourceResolverImpl } from "@fern-api/cli-source-resolver";
import { parseDocsConfiguration } from "@fern-api/configuration-loader";
import { FdrAPI, FernNavigation } from "@fern-api/fdr-sdk";
import { AbsoluteFilePath, resolve } from "@fern-api/fs-utils";
import { generateIntermediateRepresentation } from "@fern-api/ir-generator";
import { createMockTaskContext } from "@fern-api/task-context";
import { loadAPIWorkspace, loadDocsWorkspace } from "@fern-api/workspace-loader";

import { ApiReferenceNodeConverter, type ErrorPageRedirect } from "../ApiReferenceNodeConverter.js";
import { NodeIdGenerator } from "../NodeIdGenerator.js";
import { convertIrToApiDefinition } from "../utils/convertIrToApiDefinition.js";

const context = createMockTaskContext();

const apiDefinitionId = "550e8400-e29b-41d4-a716-446655440000";

const FIXTURE = "fixtures/api-error-navigation/fern";

async function convertFixture({ errorPages = true }: { errorPages?: boolean } = {}): Promise<{
    node: FernNavigation.V1.ApiReferenceNode;
    apiDefinition: FdrAPI.api.v1.read.ApiDefinition;
    redirects: ErrorPageRedirect[];
}> {
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

    const converter = new ApiReferenceNodeConverter(
        { ...apiSection, errorPages },
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
        undefined
    );
    const node = converter.get();
    return { node, apiDefinition, redirects: converter.getErrorPageRedirects(node) };
}

type ApiErrorChild = Extract<FernNavigation.V1.ApiPackageChild, { type: "apiError" }>;

function errorsSection(node: FernNavigation.V1.ApiReferenceNode): FernNavigation.V1.ApiPackageNode | undefined {
    return node.children.find(
        (child): child is FernNavigation.V1.ApiPackageNode => child.type === "apiPackage" && child.title === "Errors"
    );
}

function apiErrorChildren(section: FernNavigation.V1.ApiPackageNode | undefined): ApiErrorChild[] {
    return (section?.children ?? []).filter((child): child is ApiErrorChild => child.type === "apiError");
}

describe("API error navigation (`error-pages: true`)", () => {
    it("emits one hidden page per distinct declared error under <api>/errors/<error-name>", async () => {
        const { node } = await convertFixture();
        const section = errorsSection(node);
        expect(section?.hidden).toBe(true);
        const children = apiErrorChildren(section);
        expect(
            children.map((child) => [child.errorName, child.statusCode, child.slug, child.hidden])
        ).toMatchSnapshot();
        for (const child of children) {
            expect(child.apiDefinitionId).toBe(apiDefinitionId);
        }
    });

    it("leaves wildcard status codes out", async () => {
        const { node } = await convertFixture();
        const children = apiErrorChildren(errorsSection(node));
        expect(children.every((child) => child.statusCode !== 400)).toBe(true);
        expect(new Set(children.map((child) => child.slug)).size).toBe(children.length);
    });

    it("emits nothing when the flag is off", async () => {
        const { node } = await convertFixture({ errorPages: false });
        expect(errorsSection(node)).toBeUndefined();
    });

    it("adds no redirects when the flag is on", async () => {
        const { redirects } = await convertFixture();
        expect(redirects).toEqual([]);
    });

    it("redirects each error page URL to the first endpoint returning it when the flag is off", async () => {
        const { node, redirects } = await convertFixture({ errorPages: false });
        const endpointSlugs = new Map<string, string>();
        FernNavigation.V1.traverseDF(node, (child) => {
            if (child.type === "endpoint") {
                endpointSlugs.set(child.endpointId, child.slug);
            }
        });
        const slugFor = (suffix: string) => [...endpointSlugs].find(([id]) => id.endsWith(suffix))?.[1];
        expect(redirects).toEqual([
            {
                source: "/base/path/api-reference/errors/not-found-error",
                destination: `/${slugFor("getPlant")}`,
                permanent: false
            },
            {
                source: "/base/path/api-reference/errors/gone-error",
                destination: `/${slugFor("deletePlant")}`,
                permanent: false
            },
            {
                source: "/base/path/api-reference/errors/too-many-requests-error",
                destination: `/${slugFor("getPlant")}`,
                permanent: false
            }
        ]);
        expect(redirects.every(({ destination }) => destination !== "/undefined")).toBe(true);
    });
});
