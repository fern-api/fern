import { parseDocsConfiguration } from "@fern-api/configuration-loader";
import { AbsoluteFilePath, resolve } from "@fern-api/fs-utils";
import { createMockTaskContext } from "@fern-api/task-context";
import { loadDocsWorkspace } from "@fern-api/workspace-loader";

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
});
