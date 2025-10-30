import { SourceResolverImpl } from "@fern-api/cli-source-resolver";
import { parseDocsConfiguration } from "@fern-api/configuration-loader";
import { FernNavigation } from "@fern-api/fdr-sdk";
import { AbsoluteFilePath, resolve } from "@fern-api/fs-utils";
import { generateIntermediateRepresentation } from "@fern-api/ir-generator";
import { createMockTaskContext } from "@fern-api/task-context";
import { loadAPIWorkspace, loadDocsWorkspace } from "@fern-api/workspace-loader";

import { ApiReferenceNodeConverter } from "../ApiReferenceNodeConverter";
import { NodeIdGenerator } from "../NodeIdGenerator";
import { convertIrToApiDefinition } from "../utils/convertIrToApiDefinition";

const context = createMockTaskContext();
const apiDefinitionId = "availability-test-id";

describe("availability inheritance", () => {
    it("should properly inherit availability from parent nodes", async () => {
        const docsWorkspace = await loadDocsWorkspace({
            fernDirectory: resolve(AbsoluteFilePath.of(__dirname), "fixtures/availability-inheritance/fern"),
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
            absolutePathToWorkspace: resolve(AbsoluteFilePath.of(__dirname), "fixtures/availability-inheritance/fern"),
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
            apiWorkspace
        ).get();

        // Test that the API section has stable availability
        expect(node.availability).toBe("stable");

        // Helper function to find a node by title/path in the tree
        const findNodeByTitle = (
            children: FernNavigation.V1.ApiPackageChild[],
            title: string
        ): FernNavigation.V1.ApiPackageChild | undefined => {
            for (const child of children) {
                const childTitle = child.type === "endpointPair" ? child.nonStream.title : child.title;
                if (childTitle === title) {
                    return child;
                }
                if (child.type === "apiPackage" && child.children) {
                    const found = findNodeByTitle(child.children, title);
                    if (found) return found;
                }
            }
            return undefined;
        };

        // Helper function to get availability from any node type
        const getAvailability = (node: FernNavigation.V1.ApiPackageChild | undefined) => {
            if (!node) return undefined;
            if (node.type === "endpointPair") return node.nonStream.availability;
            if (node.type === "link") return undefined; // Link nodes don't have availability
            return node.availability;
        };

        // Helper function to find endpoint by partial title match
        const findEndpointByTitle = (children: FernNavigation.V1.ApiPackageChild[], titlePart: string) => {
            return children.find((child) => {
                const title = child.type === "endpointPair" ? child.nonStream.title : child.title;
                return title.includes(titlePart);
            });
        };

        // Test Beta Features section - should have beta availability
        const betaSection = findNodeByTitle(node.children, "Beta Features");
        expect(getAvailability(betaSection)).toBe("beta");

        // Test Admin Operations package - should have deprecated availability
        const adminPackage = findNodeByTitle(node.children, "Admin Operations");
        expect(getAvailability(adminPackage)).toBe("deprecated");

        // Test Stable APIs section - should inherit stable from API section
        const stableSection = findNodeByTitle(node.children, "Stable APIs");
        expect(getAvailability(stableSection)).toBe("stable");

        // Test specific endpoints within Beta Features section
        if (betaSection?.type === "apiPackage") {
            const userManagement = findNodeByTitle(betaSection.children, "User Management");
            expect(getAvailability(userManagement)).toBe("beta"); // Should inherit from beta section

            if (userManagement?.type === "apiPackage") {
                const getUser = findEndpointByTitle(userManagement.children, "getUser");
                const createUser = findEndpointByTitle(userManagement.children, "createUser");
                const deleteUser = findEndpointByTitle(userManagement.children, "deleteUser");

                // getUser should inherit beta from section
                expect(getAvailability(getUser)).toBe("beta");

                // createUser has its own beta, but matches parent so should be beta
                expect(getAvailability(createUser)).toBe("beta");

                // deleteUser has its own deprecated, should override parent beta
                expect(getAvailability(deleteUser)).toBe("deprecated");
            }
        }

        // Test endpoints within Admin package
        if (adminPackage?.type === "apiPackage") {
            const healthCheck = findEndpointByTitle(adminPackage.children, "healthCheck");
            const reboot = findEndpointByTitle(adminPackage.children, "reboot");

            // healthCheck should inherit deprecated from admin package
            expect(getAvailability(healthCheck)).toBe("deprecated");

            // reboot has its own alpha, should override parent deprecated
            expect(getAvailability(reboot)).toBe("alpha");
        }

        // Test endpoints within Stable section
        if (stableSection?.type === "apiPackage") {
            const stableUserPackage = findNodeByTitle(stableSection.children, "users");
            expect(getAvailability(stableUserPackage)).toBe("stable"); // Should inherit stable from section

            if (stableUserPackage?.type === "apiPackage") {
                const stableGetUser = findEndpointByTitle(stableUserPackage.children, "getUser");
                const stableCreateUser = findEndpointByTitle(stableUserPackage.children, "createUser");

                // getUser should inherit stable from section
                expect(getAvailability(stableGetUser)).toBe("stable");

                // createUser has its own beta, should override parent stable
                expect(getAvailability(stableCreateUser)).toBe("beta");
            }
        }

        // Store the full snapshot for comprehensive testing
        expect(node).toMatchSnapshot();
    });
});
