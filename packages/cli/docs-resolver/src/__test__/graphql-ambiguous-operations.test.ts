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
    it("should detect ambiguous operations and require namespacing", async () => {
        let errorMessages: string[] = [];

        const mockTaskContext = createMockTaskContext();
        const originalError = mockTaskContext.logger.error;

        const context = {
            ...mockTaskContext,
            logger: {
                ...mockTaskContext.logger,
                error: (message: string, error?: unknown) => {
                    errorMessages.push(message);
                    if (error != null) {
                        return originalError(message, String(error));
                    }
                    return originalError(message);
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

        // Should have captured error messages for ambiguous operations
        expect(errorMessages.length).toBeGreaterThan(0);

        // Should contain errors about ambiguous "getInfo" operation
        const getInfoError = errorMessages.find((msg) =>
            msg.includes('Ambiguous operation reference: "QUERY getInfo"')
        );
        expect(getInfoError).toBeDefined();

        // Should contain errors about ambiguous "createRecord" operation
        const createRecordError = errorMessages.find((msg) =>
            msg.includes('Ambiguous operation reference: "MUTATION createRecord"')
        );
        expect(createRecordError).toBeDefined();

        // Verify the navigation contains properly namespaced operations
        expect(node).toBeDefined();

        // Should include unique operation (no ambiguity)
        const uniqueOp = node.children.find((child) => child.type === "graphql" && child.title === "Unique Operation");
        expect(uniqueOp).toBeDefined();

        // Should include properly namespaced operations
        const adminInfoOp = node.children.find(
            (child) => child.type === "graphql" && child.title === "Admin Information"
        );
        expect(adminInfoOp).toBeDefined();

        const userInfoOp = node.children.find(
            (child) => child.type === "graphql" && child.title === "User Information"
        );
        expect(userInfoOp).toBeDefined();

        const billingInfoOp = node.children.find(
            (child) => child.type === "graphql" && child.title === "Billing Information"
        );
        expect(billingInfoOp).toBeDefined();
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
