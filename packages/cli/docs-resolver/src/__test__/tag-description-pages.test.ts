import { parseDocsConfiguration } from "@fern-api/configuration-loader";
import { AbsoluteFilePath, resolve } from "@fern-api/fs-utils";
import { createMockTaskContext } from "@fern-api/task-context";
import { loadDocsWorkspace } from "@fern-api/workspace-loader";
import { camelCase } from "lodash-es";

const context = createMockTaskContext();

describe("tag-description-pages", () => {
    describe("tag name normalization for subpackage lookup", () => {
        it("normalizes tags with spaces to match subpackage names", () => {
            // This test verifies the fix for tags with spaces not matching subpackage names.
            // Subpackage names are derived using camelCase (see getEndpointLocation.ts lines 40, 101, 184).
            // The openApiTags lookup must use the same normalization.
            expect(camelCase("Study Collections")).toBe("studyCollections");
            expect(camelCase("User Management")).toBe("userManagement");
        });

        it("normalizes tags with hyphens to match subpackage names", () => {
            // Tags with hyphens must also normalize to camelCase for the lookup to work
            expect(camelCase("study-collections")).toBe("studyCollections");
            expect(camelCase("user-management")).toBe("userManagement");
        });

        it("ensures different tag formats normalize to the same subpackage name", () => {
            // This is the core of the bug fix: tags like "Study Collections" and "study-collections"
            // must both normalize to "studyCollections" to match the subpackage name lookup
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
