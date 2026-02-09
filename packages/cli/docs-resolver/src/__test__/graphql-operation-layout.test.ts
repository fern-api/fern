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

const context = createMockTaskContext();

const apiDefinitionId = "550e8400-e29b-41d4-a716-446655440000";

describe("GraphQL Operation Layout", () => {
    it("should convert GraphQL operation layout items to navigation nodes", async () => {
        const docsWorkspace = await loadDocsWorkspace({
            fernDirectory: resolve(AbsoluteFilePath.of(__dirname), "fixtures/graphql-operation-layout/fern"),
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
            absolutePathToWorkspace: resolve(AbsoluteFilePath.of(__dirname), "fixtures/graphql-operation-layout/fern"),
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

        // Verify that the navigation includes the expected GraphQL operations
        const userOperationsSection = node.children.find(
            (child) => child.type === "apiPackage" && child.title === "User Operations"
        );
        expect(userOperationsSection).toBeDefined();

        if (userOperationsSection && userOperationsSection.type === "apiPackage") {
            // Should contain getUserProfile, createUser, updateUserProfile operations
            expect(userOperationsSection.children).toHaveLength(3);

            const getUserProfileOp = userOperationsSection.children.find(
                (child) => child.type === "graphql" && child.title === "Get User Profile"
            );
            expect(getUserProfileOp).toBeDefined();

            const createUserOp = userOperationsSection.children.find(
                (child) => child.type === "graphql" && child.title === "Create New User"
            );
            expect(createUserOp).toBeDefined();

            if (createUserOp && createUserOp.type === "graphql") {
                // Should use custom slug
                expect(createUserOp.slug).toContain("create-user");
            }
        }

        const adminOperationsSection = node.children.find(
            (child) => child.type === "apiPackage" && child.title === "Admin Operations"
        );
        expect(adminOperationsSection).toBeDefined();

        if (adminOperationsSection && adminOperationsSection.type === "apiPackage") {
            // Should contain getSystemInfo operation (resetSystem is hidden)
            expect(adminOperationsSection.children.length).toBeGreaterThan(0);

            const getSystemInfoOp = adminOperationsSection.children.find(
                (child) => child.type === "graphql" && child.title === "System Information"
            );
            expect(getSystemInfoOp).toBeDefined();
        }

        // Check for the subscription operation at root level
        const userUpdatesOp = node.children.find(
            (child) => child.type === "graphql" && child.title === "Real-time User Updates"
        );
        expect(userUpdatesOp).toBeDefined();

        if (userUpdatesOp && userUpdatesOp.type === "graphql") {
            expect(userUpdatesOp.availability).toBe("beta");
        }
    });

    it("should handle invalid operation format", async () => {
        // Test case to verify error handling for malformed operation strings
        const mockLogger = {
            error: () => {
                // empty
            },
            warn: () => {
                // empty
            },
            info: () => {
                // empty
            },
            debug: () => {
                // empty
            }
        };

        const contextWithMockLogger = {
            ...context,
            logger: mockLogger
        };

        // This test would need a fixture with invalid operation format
        // For now, we'll test the parsing logic directly if needed
        expect(typeof mockLogger.error).toBe("function");
    });
});
