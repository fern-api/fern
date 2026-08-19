import { SourceResolverImpl } from "@fern-api/cli-source-resolver";
import { parseDocsConfiguration } from "@fern-api/configuration-loader";
import { FernNavigation } from "@fern-api/fdr-sdk";
import { AbsoluteFilePath, resolve } from "@fern-api/fs-utils";
import { generateIntermediateRepresentation } from "@fern-api/ir-generator";
import { createMockTaskContext } from "@fern-api/task-context";
import { loadAPIWorkspace, loadDocsWorkspace } from "@fern-api/workspace-loader";

import { ApiReferenceNodeConverter } from "../ApiReferenceNodeConverter.js";
import { NodeIdGenerator } from "../NodeIdGenerator.js";
import { convertIrToApiDefinition } from "../utils/convertIrToApiDefinition.js";

const apiDefinitionId = "550e8400-e29b-41d4-a716-446655440000";

describe("GraphQL Ambiguous Operations", () => {
    it("should detect ambiguous operations and warn while continuing", async () => {
        let warningMessages: string[] = [];

        const mockTaskContext = createMockTaskContext();
        const originalWarn = mockTaskContext.logger.warn;

        const context = {
            ...mockTaskContext,
            logger: {
                ...mockTaskContext.logger,
                warn: (message: string, error?: unknown) => {
                    warningMessages.push(message);
                    if (error != null) {
                        return originalWarn(message, String(error));
                    }
                    return originalWarn(message);
                }
            }
        };

        const docsWorkspace = await loadDocsWorkspace({
            fernDirectory: resolve(AbsoluteFilePath.of(__dirname), "fixtures/graphql-ambiguous-operations/fern"),
            context
        });

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

        if (parsedDocsConfig.navigation.items[0]?.type !== "apiSection") {
            throw new Error("Expected apiSection");
        }

        const apiSection = parsedDocsConfig.navigation.items[0];

        const result = await loadAPIWorkspace({
            absolutePathToWorkspace: resolve(
                AbsoluteFilePath.of(__dirname),
                "fixtures/graphql-ambiguous-operations/fern"
            ),
            context,
            cliVersion: "0.0.0",
            workspaceName: undefined
        });

        if (!result.didSucceed) {
            throw new Error("API workspace failed to load");
        }

        const apiWorkspace = await result.workspace.toFernWorkspace({ context });

        const slug = FernNavigation.V1.SlugGenerator.init("/base/path");

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

        const node = new ApiReferenceNodeConverter(
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
            apiWorkspace
        ).get();

        // Should have captured warning messages for ambiguous operations
        expect(warningMessages.length).toBeGreaterThan(0);

        // Should contain warnings about ambiguous "getInfo" operation
        const getInfoWarning = warningMessages.find((msg) =>
            msg.includes('Ambiguous operation reference: "QUERY getInfo"')
        );
        expect(getInfoWarning).toBeDefined();
        expect(getInfoWarning).toContain("Using first match:");

        // Should contain warnings about ambiguous "createRecord" operation
        const createRecordWarning = warningMessages.find((msg) =>
            msg.includes('Ambiguous operation reference: "MUTATION createRecord"')
        );
        expect(createRecordWarning).toBeDefined();
        expect(createRecordWarning).toContain("Using first match:");

        // Verify the navigation contains properly namespaced operations
        expect(node).toBeDefined();

        // Should include properly namespaced operations (no ambiguity)
        const adminInfoOp = node.children.find(
            (child) => child.type === "graphql" && child.title === "Admin Information"
        );
        expect(adminInfoOp).toBeDefined();

        const userInfoOp = node.children.find(
            (child) => child.type === "graphql" && child.title === "User Information"
        );
        expect(userInfoOp).toBeDefined();

        // Should also include ambiguous operations (they continue processing with first match)
        const ambiguousGetInfoOp = node.children.find(
            (child) => child.type === "graphql" && child.title === "Ambiguous Get Info"
        );
        expect(ambiguousGetInfoOp).toBeDefined(); // Should exist since it continues with first match

        const ambiguousCreateRecordOp = node.children.find(
            (child) => child.type === "graphql" && child.title === "Ambiguous Create Record"
        );
        expect(ambiguousCreateRecordOp).toBeDefined(); // Should exist since it continues with first match
    });

    it("should match snapshot for error handling", async () => {
        const context = createMockTaskContext();

        const docsWorkspace = await loadDocsWorkspace({
            fernDirectory: resolve(AbsoluteFilePath.of(__dirname), "fixtures/graphql-ambiguous-operations/fern"),
            context
        });

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

        if (parsedDocsConfig.navigation.items[0]?.type !== "apiSection") {
            throw new Error("Expected apiSection");
        }

        const apiSection = parsedDocsConfig.navigation.items[0];

        const result = await loadAPIWorkspace({
            absolutePathToWorkspace: resolve(
                AbsoluteFilePath.of(__dirname),
                "fixtures/graphql-ambiguous-operations/fern"
            ),
            context,
            cliVersion: "0.0.0",
            workspaceName: undefined
        });

        if (!result.didSucceed) {
            throw new Error("API workspace failed to load");
        }

        const apiWorkspace = await result.workspace.toFernWorkspace({ context });

        const slug = FernNavigation.V1.SlugGenerator.init("/base/path");

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

        const node = new ApiReferenceNodeConverter(
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
            apiWorkspace
        ).get();

        expect(node).toMatchSnapshot();
    });
});
