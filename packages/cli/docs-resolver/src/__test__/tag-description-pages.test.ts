import { SourceResolverImpl } from "@fern-api/cli-source-resolver";
import { parseDocsConfiguration } from "@fern-api/configuration-loader";
import { FernNavigation } from "@fern-api/fdr-sdk";
import { AbsoluteFilePath, resolve } from "@fern-api/fs-utils";
import { generateIntermediateRepresentation } from "@fern-api/ir-generator";
import { createMockTaskContext } from "@fern-api/task-context";
import { loadAPIWorkspace, loadDocsWorkspace } from "@fern-api/workspace-loader";
import { camelCase } from "lodash-es";

import { ApiReferenceNodeConverter } from "../ApiReferenceNodeConverter.js";
import { NodeIdGenerator } from "../NodeIdGenerator.js";
import { convertIrToApiDefinition } from "../utils/convertIrToApiDefinition.js";

const context = createMockTaskContext();

const FIXTURE_DIR = resolve(AbsoluteFilePath.of(__dirname), "fixtures/tag-description-pages/fern");

describe("tag-description-pages", () => {
    describe("tag name normalization for subpackage lookup", () => {
        it("normalizes tags with spaces to match subpackage names", () => {
            // Subpackage names are derived using camelCase (see getEndpointLocation.ts).
            expect(camelCase("Study Collections")).toBe("studyCollections");
            expect(camelCase("User Management")).toBe("userManagement");
        });

        it("normalizes tags with hyphens to match subpackage names", () => {
            expect(camelCase("study-collections")).toBe("studyCollections");
            expect(camelCase("user-management")).toBe("userManagement");
        });

        it("ensures different tag formats normalize to the same subpackage name", () => {
            const tagWithSpaces = "Study Collections";
            const tagWithHyphens = "study-collections";
            const expectedSubpackageName = "studyCollections";

            expect(camelCase(tagWithSpaces)).toBe(expectedSubpackageName);
            expect(camelCase(tagWithHyphens)).toBe(expectedSubpackageName);
            expect(camelCase(tagWithSpaces)).toBe(camelCase(tagWithHyphens));
        });
    });

    it("parses tag-description-pages configuration correctly", async () => {
        const docsWorkspace = await loadDocsWorkspace({
            fernDirectory: FIXTURE_DIR,
            context
        });

        if (docsWorkspace == null) {
            throw new Error("Workspace is null");
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

        if (parsedDocsConfig.navigation.items[0]?.type !== "apiSection") {
            throw new Error("Expected apiSection");
        }

        const apiSection = parsedDocsConfig.navigation.items[0];

        expect(apiSection.tagDescriptionPages).toBe(true);
        expect(apiSection.tagDescriptionPages).toMatchSnapshot("tag-description-pages-enabled");
    });

    it("defaults to false when not specified", async () => {
        const docsWorkspace = await loadDocsWorkspace({
            fernDirectory: resolve(AbsoluteFilePath.of(__dirname), "fixtures/openapi-latest/fern"),
            context
        });

        if (docsWorkspace == null) {
            throw new Error("Workspace is null");
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

        if (parsedDocsConfig.navigation.items[0]?.type !== "apiSection") {
            throw new Error("Expected apiSection");
        }

        const apiSection = parsedDocsConfig.navigation.items[0];

        expect(apiSection.tagDescriptionPages).toBe(false);
        expect(apiSection.tagDescriptionPages).toMatchSnapshot("tag-description-pages-disabled");
    });

    describe("overviewPageId inheritance", () => {
        it("does not inherit child tag overviewPageId when tag-description-pages is enabled", async () => {
            const docsWorkspace = await loadDocsWorkspace({
                fernDirectory: FIXTURE_DIR,
                context
            });

            if (docsWorkspace == null) {
                throw new Error("Workspace is null");
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

            if (parsedDocsConfig.navigation.items[0]?.type !== "apiSection") {
                throw new Error("Expected apiSection");
            }

            const apiSection = parsedDocsConfig.navigation.items[0];
            expect(apiSection.tagDescriptionPages).toBe(true);

            const result = await loadAPIWorkspace({
                absolutePathToWorkspace: FIXTURE_DIR,
                context,
                cliVersion: "0.0.0",
                workspaceName: undefined
            });

            if (!result.didSucceed) {
                throw new Error("API workspace failed to load");
            }

            const apiWorkspace = await result.workspace.toFernWorkspace({ context });
            const slug = FernNavigation.V1.SlugGenerator.init("/docs");

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
                apiDefinitionId: "test-api-id",
                context
            });

            const openApiTags: Record<string, { id: string; description: string | undefined }> = {
                pet: { id: "pet", description: "Everything about your Pets" },
                store: { id: "store", description: "Access to Petstore orders" },
                user: { id: "user", description: "Operations about user" }
            };

            const converter = new ApiReferenceNodeConverter(
                apiSection,
                apiDefinition,
                slug,
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
                openApiTags
            );

            const node = converter.get();

            // The top-level API reference should NOT inherit a child tag's overviewPageId
            // when tag-description-pages is enabled. Each tag keeps its own overview page;
            // the parent title should remain non-clickable.
            expect(node.overviewPageId).toBeUndefined();
            expect(node.type).toBe("apiReference");

            // Verify that child apiPackage nodes DO have overviewPageIds (tag description pages)
            const childrenWithOverview = node.children.filter(
                (child) => child.type === "apiPackage" && child.overviewPageId != null
            );
            expect(childrenWithOverview.length).toBeGreaterThan(0);
        });
    });

    describe("tag description content preservation", () => {
        it("does not escape curly braces or angle brackets in tag descriptions", async () => {
            const docsWorkspace = await loadDocsWorkspace({
                fernDirectory: FIXTURE_DIR,
                context
            });

            if (docsWorkspace == null) {
                throw new Error("Workspace is null");
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

            if (parsedDocsConfig.navigation.items[0]?.type !== "apiSection") {
                throw new Error("Expected apiSection");
            }

            const apiSection = parsedDocsConfig.navigation.items[0];

            const result = await loadAPIWorkspace({
                absolutePathToWorkspace: FIXTURE_DIR,
                context,
                cliVersion: "0.0.0",
                workspaceName: undefined
            });

            if (!result.didSucceed) {
                throw new Error("API workspace failed to load");
            }

            const apiWorkspace = await result.workspace.toFernWorkspace({ context });
            const slug = FernNavigation.V1.SlugGenerator.init("/docs");

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
                apiDefinitionId: "test-api-id",
                context
            });

            // Provide openApiTags with descriptions containing special characters
            const openApiTags: Record<string, { id: string; description: string | undefined }> = {
                pet: {
                    id: "pet",
                    description: [
                        "Everything about your Pets.",
                        "",
                        "Use the `{petId}` path parameter to identify a specific pet.",
                        "For example: `GET /pets/{petId}`",
                        "",
                        "```json",
                        "{",
                        '  "id": 10,',
                        '  "name": "doggie",',
                        '  "status": "available"',
                        "}",
                        "```",
                        "",
                        "Filter pets with query params like `status=available` or `tags=<indoor>`."
                    ].join("\n")
                },
                store: { id: "store", description: "Access to Petstore orders" },
                user: { id: "user", description: "Operations about user" },
                studyCollections: {
                    id: "Study Collections",
                    description: "Manage study collections and their contents"
                },
                userManagement: { id: "user-management", description: "User management operations" }
            };

            const converter = new ApiReferenceNodeConverter(
                apiSection,
                apiDefinition,
                slug,
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
                openApiTags
            );

            const tagDescriptionContent = converter.getTagDescriptionContent();

            // Find the pet tag description entry
            let petContent: string | undefined;
            for (const [, content] of tagDescriptionContent.entries()) {
                if (content.startsWith("# Pet")) {
                    petContent = content;
                    break;
                }
            }

            expect(petContent).toBeDefined();

            // Verify curly braces are NOT escaped (the bug was adding backslashes)
            expect(petContent).not.toContain("\\{");
            expect(petContent).not.toContain("\\}");

            // Verify angle brackets are NOT HTML-entity-encoded
            expect(petContent).not.toContain("&lt;");
            expect(petContent).not.toContain("&gt;");

            // Verify the raw content is preserved as-is
            expect(petContent).toContain("{petId}");
            expect(petContent).toContain("```json");
            expect(petContent).toContain('"id": 10');
            expect(petContent).toContain("<indoor>");
        });

        it("preserves plain text descriptions without modification", async () => {
            const docsWorkspace = await loadDocsWorkspace({
                fernDirectory: FIXTURE_DIR,
                context
            });

            if (docsWorkspace == null) {
                throw new Error("Workspace is null");
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

            if (parsedDocsConfig.navigation.items[0]?.type !== "apiSection") {
                throw new Error("Expected apiSection");
            }

            const apiSection = parsedDocsConfig.navigation.items[0];

            const result = await loadAPIWorkspace({
                absolutePathToWorkspace: FIXTURE_DIR,
                context,
                cliVersion: "0.0.0",
                workspaceName: undefined
            });

            if (!result.didSucceed) {
                throw new Error("API workspace failed to load");
            }

            const apiWorkspace = await result.workspace.toFernWorkspace({ context });
            const slug = FernNavigation.V1.SlugGenerator.init("/docs");

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
                apiDefinitionId: "test-api-id",
                context
            });

            const openApiTags: Record<string, { id: string; description: string | undefined }> = {
                pet: { id: "pet", description: "Everything about your Pets" },
                store: { id: "store", description: "Access to Petstore orders" },
                user: { id: "user", description: "Operations about user" },
                studyCollections: {
                    id: "Study Collections",
                    description: "Manage study collections and their contents"
                },
                userManagement: { id: "user-management", description: "User management operations" }
            };

            const converter = new ApiReferenceNodeConverter(
                apiSection,
                apiDefinition,
                slug,
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
                openApiTags
            );

            const tagDescriptionContent = converter.getTagDescriptionContent();

            // Verify plain text descriptions are stored without any transformation
            for (const [, content] of tagDescriptionContent.entries()) {
                expect(content).not.toContain("\\{");
                expect(content).not.toContain("\\}");
                expect(content).not.toContain("&lt;");
                expect(content).not.toContain("&gt;");
            }
        });
    });
});
