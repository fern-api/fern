import { SourceResolverImpl } from "@fern-api/cli-source-resolver";
import { parseDocsConfiguration } from "@fern-api/configuration-loader";
import { FernNavigation } from "@fern-api/fdr-sdk";
import { AbsoluteFilePath, resolve } from "@fern-api/fs-utils";
import { generateIntermediateRepresentation } from "@fern-api/ir-generator";
import { createMockTaskContext } from "@fern-api/task-context";
import { loadAPIWorkspace, loadDocsWorkspace } from "@fern-api/workspace-loader";

import { ApiReferenceNodeConverter } from "../ApiReferenceNodeConverter.js";
import { DocsDefinitionResolver } from "../DocsDefinitionResolver.js";
import { NodeIdGenerator } from "../NodeIdGenerator.js";
import { convertIrToApiDefinition } from "../utils/convertIrToApiDefinition.js";
import { getFirstSentence, renderSectionEndpointsMarkdown } from "../utils/endpointIndexMarkdown.js";

const context = createMockTaskContext();

const FIXTURE_DIR = resolve(AbsoluteFilePath.of(__dirname), "fixtures/endpoint-index-pages/fern");

async function loadWorkspaces() {
    const docsWorkspace = await loadDocsWorkspace({ fernDirectory: FIXTURE_DIR, context });
    if (docsWorkspace == null) {
        throw new Error("Workspace is null");
    }
    const result = await loadAPIWorkspace({
        absolutePathToWorkspace: FIXTURE_DIR,
        context,
        cliVersion: "0.0.0",
        workspaceName: undefined
    });
    if (!result.didSucceed) {
        throw new Error("API workspace failed to load");
    }
    return { docsWorkspace, apiWorkspace: result.workspace };
}

async function resolvePages(): Promise<Record<string, string>> {
    const { docsWorkspace, apiWorkspace } = await loadWorkspaces();
    const resolver = new DocsDefinitionResolver({
        domain: "https://example.com",
        docsWorkspace,
        ossWorkspaces: [],
        apiWorkspaces: [apiWorkspace],
        taskContext: context,
        uploadFiles: async () => [],
        registerApi: async () => "test-api-id"
    });
    const resolved = await resolver.resolve();
    return Object.fromEntries(Object.entries(resolved.pages).map(([pageId, page]) => [pageId, page?.markdown ?? ""]));
}

async function loadConverterFactory(): Promise<
    (options: { endpointIndexPages: boolean }) => ApiReferenceNodeConverter
> {
    const { docsWorkspace, apiWorkspace } = await loadWorkspaces();
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
    if (!apiSection.endpointIndexPages) {
        throw new Error("Expected endpoint-index-pages to be enabled in the fixture");
    }

    const fernWorkspace = await apiWorkspace.toFernWorkspace({ context });
    const ir = generateIntermediateRepresentation({
        workspace: fernWorkspace,
        audiences: { type: "all" },
        generationLanguage: undefined,
        keywords: undefined,
        smartCasing: false,
        exampleGeneration: { disabled: false },
        readme: undefined,
        version: undefined,
        packageName: undefined,
        context,
        sourceResolver: new SourceResolverImpl(context, fernWorkspace)
    });
    const apiDefinition = convertIrToApiDefinition({ ir, apiDefinitionId: "test-api-id", context });
    const openApiTags: Record<string, { id: string; description: string | undefined }> = {
        plants: { id: "plants", description: "Plant operations" },
        store: { id: "store", description: "Order seeds and supplies from the garden store." }
    };
    return ({ endpointIndexPages }) =>
        new ApiReferenceNodeConverter(
            { ...apiSection, endpointIndexPages },
            apiDefinition,
            FernNavigation.V1.SlugGenerator.init("/docs"),
            docsWorkspace,
            context,
            new Map(),
            new Map(),
            new Map(),
            NodeIdGenerator.init(),
            new Map(),
            fernWorkspace,
            undefined,
            undefined,
            openApiTags
        );
}

describe("endpoint-index-pages", () => {
    describe("flag off", () => {
        it("defaults to false and generates nothing", async () => {
            const createConverter = await loadConverterFactory();
            const disabled = createConverter({ endpointIndexPages: false });
            const disabledNode = disabled.get();
            expect(disabled.getEndpointIndexContent().size).toBe(0);
            expect(disabled.getEndpointIndexAppendices().size).toBe(0);
            expect(disabledNode.children.some((child) => child.type === "page")).toBe(false);
            const usersSection = disabledNode.children.find(
                (child) => child.type === "apiPackage" && child.title === "users"
            );
            expect(usersSection?.type).toBe("apiPackage");
            expect(usersSection?.type === "apiPackage" ? usersSection.overviewPageId : undefined).toBeUndefined();

            // Enabling the flag only adds pages; the rest of the navigation tree is unchanged.
            const enabledNode = createConverter({ endpointIndexPages: true }).get();
            const withoutGeneratedPages = (children: FernNavigation.V1.ApiPackageChild[]) =>
                children
                    .filter((child) => child.type !== "page")
                    .map((child) => (child.type === "apiPackage" ? { ...child, overviewPageId: undefined } : child));
            expect(withoutGeneratedPages(enabledNode.children)).toEqual(withoutGeneratedPages(disabledNode.children));
        });
    });

    describe("tag description pages", () => {
        it("keeps the tag description and appends the endpoint list", async () => {
            const createConverter = await loadConverterFactory();
            const converter = createConverter({ endpointIndexPages: true });
            converter.get();
            const storePage = [...converter.getTagDescriptionContent().values()].find((content) =>
                content.includes("Order seeds")
            );
            expect(storePage).toMatchSnapshot("store-tag-description");
            expect(storePage).toMatch(/Order seeds and supplies from the garden store\.\n\n## Endpoints\n/);
            expect(storePage).toContain("[Create order](/docs/api-reference/store/create-order)");
            // Sections with a tag description page don't get a second generated summary page.
            expect([...converter.getEndpointIndexContent().keys()].some((path) => path.includes("store"))).toBe(false);
        });
    });

    describe("flag on", () => {
        let pages: Record<string, string>;

        beforeAll(async () => {
            pages = await resolvePages();
        });

        it("generates an All Endpoints page grouped by section", () => {
            const allEndpoints = pages["endpoint-index-api-reference-all-endpoints.md"];
            expect(allEndpoints).toMatchSnapshot("all-endpoints");
            expect(allEndpoints).toContain("## [plants](/api-reference/plants)");
            expect(allEndpoints).toContain("| [List plants](/api-reference/plants/list-plants) | `GET` | `/plants` |");
        });

        it("generates a summary page for a section without one", () => {
            const usersPage = pages["endpoint-index-api-reference-users.md"];
            expect(usersPage).toMatchSnapshot("users-section");
            expect(usersPage).toMatch(/^# users\n\n## Endpoints/);
        });

        it("keeps a manual summary and appends the endpoint list", () => {
            const plantsPage = pages["pages/plants-summary.mdx"];
            expect(plantsPage).toMatchSnapshot("plants-section");
            expect(plantsPage).toContain("Manage the plants in your garden.");
            expect(plantsPage?.indexOf("Manage the plants")).toBeLessThan(plantsPage?.indexOf("## Endpoints") ?? -1);
        });

        it("excludes hidden endpoints", () => {
            const allMarkdown = Object.values(pages).join("\n");
            expect(allMarkdown).toContain("List users");
            expect(allMarkdown).not.toContain("Delete user");
        });

        it("marks deprecated and beta endpoints", () => {
            const allEndpoints = pages["endpoint-index-api-reference-all-endpoints.md"];
            expect(allEndpoints).toContain("[Delete plant](/api-reference/plants/delete-plant) *(Deprecated)*");
            expect(allEndpoints).toContain("[Create plant](/api-reference/plants/create-plant) *(Beta)*");
        });
    });

    describe("getFirstSentence", () => {
        it.each([
            ["Returns all plants. Results are paginated.", "Returns all plants."],
            ["Uses `v1.2` of the API. Other text.", "Uses `v1.2` of the API."],
            ["See [the guide](https://example.com) for details.\n\nMore.", "See the guide for details."],
            ["No trailing period", "No trailing period"],
            ["Line one\ncontinues here. Next.", "Line one continues here."],
            ["Returns a <b>plant</b> | or not.", "Returns a plant \\| or not."]
        ])("%j -> %j", (input, expected) => {
            expect(getFirstSentence(input)).toBe(expected);
        });

        it("keeps spec-derived paths and slugs inert in the table", () => {
            const markdown = renderSectionEndpointsMarkdown({
                title: "Odd",
                slug: FernNavigation.V1.Slug("api/odd"),
                rows: [
                    {
                        title: "Odd path",
                        slug: FernNavigation.V1.Slug("api/odd/a)b"),
                        method: "GET",
                        path: "/a`b|c",
                        description: undefined,
                        availability: undefined
                    }
                ],
                subgroups: []
            });
            expect(markdown).toContain("| [Odd path](/api/odd/a%29b) | `GET` | `` /a`b\\|c `` |  |");
        });

        it("escapes text after a code span cut open by truncation", () => {
            const result = getFirstSentence(`${"word ".repeat(38)}\`code [x] and more words in the code span\``);
            expect(result.endsWith("…")).toBe(true);
            expect(result).toContain("`code \\[x\\]");
            expect(result).not.toContain("`code [x]");
        });
    });
});
