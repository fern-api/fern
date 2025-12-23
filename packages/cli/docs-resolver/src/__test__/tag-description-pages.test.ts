import { parseDocsConfiguration } from "@fern-api/configuration-loader";
import { FernNavigation } from "@fern-api/fdr-sdk";
import { AbsoluteFilePath, resolve } from "@fern-api/fs-utils";
import { createMockTaskContext } from "@fern-api/task-context";
import { loadAPIWorkspace, loadDocsWorkspace } from "@fern-api/workspace-loader";

import { DocsDefinitionResolver } from "../DocsDefinitionResolver";

const context = createMockTaskContext();

describe("tag-description-pages", () => {
    it("parses tag-description-pages configuration correctly", async () => {
        const docsWorkspace = await loadDocsWorkspace({
            fernDirectory: resolve(AbsoluteFilePath.of(__dirname), "fixtures/tag-description-pages/fern"),
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

        // Verify tag-description-pages is enabled
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

        // Verify tag-description-pages defaults to false
        expect(apiSection.tagDescriptionPages).toBe(false);
        expect(apiSection.tagDescriptionPages).toMatchSnapshot("tag-description-pages-disabled");
    });

    it("validates that tag description content is accessible", async () => {
        // This is a simple test to ensure the getter method works
        // More comprehensive integration tests would require a full setup
        const docsWorkspace = await loadDocsWorkspace({
            fernDirectory: resolve(AbsoluteFilePath.of(__dirname), "fixtures/tag-description-pages/fern"),
            context
        });

        expect(docsWorkspace).toBeDefined();
        expect(docsWorkspace?.config).toBeDefined();

        if (!docsWorkspace) {
            throw Error("Unexpected null docs workspace");
        }

        // This validates that our test fixture is properly set up
        // and the configuration parsing works correctly
        const parsedDocsConfig = await parseDocsConfiguration({
            rawDocsConfiguration: docsWorkspace.config,
            context,
            absolutePathToFernFolder: docsWorkspace.absoluteFilePath,
            absoluteFilepathToDocsConfig: docsWorkspace.absoluteFilepathToDocsConfig
        });

        // Verify the tag-description-pages setting is enabled in our test fixture
        if (
            parsedDocsConfig.navigation.type === "untabbed" &&
            parsedDocsConfig.navigation.items[0]?.type === "apiSection"
        ) {
            expect(parsedDocsConfig.navigation.items[0].tagDescriptionPages).toBe(true);
        }
    });

    it("generates pages for tags with description but no endpoints", async () => {
        const fernDirectory = resolve(AbsoluteFilePath.of(__dirname), "fixtures/tag-description-pages-empty-tag/fern");

        const docsWorkspace = await loadDocsWorkspace({
            fernDirectory,
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

        // Verify tag-description-pages is enabled
        if (parsedDocsConfig.navigation.type !== "untabbed") {
            throw new Error("Expected untabbed navigation");
        }

        if (parsedDocsConfig.navigation.items[0]?.type !== "apiSection") {
            throw new Error("Expected apiSection");
        }

        expect(parsedDocsConfig.navigation.items[0].tagDescriptionPages).toBe(true);

        // Load the API workspace to test the full resolution
        const apiWorkspace = await loadAPIWorkspace({
            absolutePathToWorkspace: fernDirectory,
            context,
            cliVersion: "0.0.0",
            workspaceName: undefined
        });

        if (apiWorkspace == null || !apiWorkspace.didSucceed) {
            throw new Error("API workspace failed to load");
        }

        // Create the resolver and resolve the docs definition
        const resolver = new DocsDefinitionResolver({
            domain: "test-domain.docs.buildwithfern.com",
            docsWorkspace,
            ossWorkspaces: [],
            apiWorkspaces: [apiWorkspace.workspace],
            taskContext: context,
            uploadFiles: async () => [],
            registerApi: async () => ""
        });

        const resolved = await resolver.resolve();

        // Find the API reference node in the navigation tree
        expect(resolved.config.root).toBeDefined();

        if (!resolved.config.root) {
            throw new Error("Failed to resolve docs root");
        }

        // Helper function to find API reference nodes in the navigation tree
        function findApiReferenceNodes(node: FernNavigation.V1.NavigationNode): FernNavigation.V1.ApiReferenceNode[] {
            const apiReferenceNodes: FernNavigation.V1.ApiReferenceNode[] = [];

            if (node.type === "apiReference") {
                apiReferenceNodes.push(node);
            } else if ("children" in node && Array.isArray(node.children)) {
                for (const child of node.children) {
                    apiReferenceNodes.push(...findApiReferenceNodes(child));
                }
            } else if ("child" in node && node.child) {
                apiReferenceNodes.push(...findApiReferenceNodes(node.child));
            }

            return apiReferenceNodes;
        }

        const apiReferenceNodes = findApiReferenceNodes(resolved.config.root);
        expect(apiReferenceNodes.length).toBeGreaterThan(0);

        const apiReferenceNode = apiReferenceNodes[0];
        expect(apiReferenceNode).toBeDefined();

        // The "users" tag has a description but no endpoints
        // With the fix, it should still be included in the navigation
        const usersPackage = apiReferenceNode?.children.find(
            (child) => child.type === "apiPackage" && child.title === "Users"
        );

        // Verify that the users tag (which has no endpoints) is included
        expect(usersPackage).toBeDefined();

        if (usersPackage?.type === "apiPackage") {
            // The users package should have an overviewPageId (the tag description page)
            expect(usersPackage.overviewPageId).toBeDefined();
        }

        // The "products" tag has endpoints and should also be included
        const productsPackage = apiReferenceNode?.children.find(
            (child) => child.type === "apiPackage" && child.title === "Products"
        );

        expect(productsPackage).toBeDefined();
    });
});
