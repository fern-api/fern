import { docsYml } from "@fern-api/configuration-loader";
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { createMockTaskContext } from "@fern-api/task-context";
import { DocsWorkspace } from "@fern-api/workspace-loader";
import path from "path";
import { UnusedAssetsRule } from "../../rules/unused-assets/unused-assets.js";

const FIXTURES_DIR = path.join(__dirname, "fixtures", "fern");

function makeDocsWorkspace(
    fernFolder: AbsoluteFilePath,
    configPath: AbsoluteFilePath,
    config: docsYml.RawSchemas.DocsConfiguration
): DocsWorkspace {
    return {
        type: "docs",
        workspaceName: "test",
        absoluteFilePath: fernFolder,
        absoluteFilepathToDocsConfig: configPath,
        config
    } as DocsWorkspace;
}

describe("unused-assets", () => {
    it("should detect unused asset files", async () => {
        const context = createMockTaskContext();
        const fernFolder = AbsoluteFilePath.of(FIXTURES_DIR);
        const configPath = AbsoluteFilePath.of(path.join(FIXTURES_DIR, "docs.yml"));

        const workspace = makeDocsWorkspace(fernFolder, configPath, {
            instances: [{ url: "test.docs.buildwithfern.com" }],
            navigation: [
                {
                    page: "Test",
                    path: "./pages/test.mdx"
                }
            ]
        });

        const visitor = await UnusedAssetsRule.create({
            workspace,
            logger: context.logger,
            apiWorkspaces: [],
            ossWorkspaces: []
        });

        // The rule pre-computes violations in create() and returns them from the file visitor
        const dummyFileNode = { config: workspace.config };
        const fileViolations = visitor.file != null ? await visitor.file(dummyFileNode) : [];

        // Should find unused.png and unused.css but not used.png (referenced in test.mdx)
        expect(fileViolations.length).toBeGreaterThanOrEqual(2);

        const messages = fileViolations.map((v) => v.message);
        expect(messages.some((m) => m.includes("unused.png"))).toBe(true);
        expect(messages.some((m) => m.includes("unused.css"))).toBe(true);
        // used.png should NOT be flagged (use path separator to avoid matching "unused.png")
        expect(messages.some((m) => m.includes("assets/used.png"))).toBe(false);

        // All should be warnings
        for (const v of fileViolations) {
            expect(v.severity).toBe("warning");
        }
    });

    it("should return no violations when all assets are used", async () => {
        const context = createMockTaskContext();
        const fernFolder = AbsoluteFilePath.of(FIXTURES_DIR);
        const configPath = AbsoluteFilePath.of(path.join(FIXTURES_DIR, "docs.yml"));

        const workspace = makeDocsWorkspace(fernFolder, configPath, {
            instances: [{ url: "test.docs.buildwithfern.com" }],
            css: ["./assets/unused.css"],
            navigation: [
                {
                    page: "Test",
                    path: "./pages/test.mdx"
                }
            ]
        });

        const visitor = await UnusedAssetsRule.create({
            workspace,
            logger: context.logger,
            apiWorkspaces: [],
            ossWorkspaces: []
        });

        const dummyFileNode = { config: workspace.config };
        const fileViolations = visitor.file != null ? await visitor.file(dummyFileNode) : [];

        // unused.css is now referenced via css config, and used.png is in markdown
        // Only unused.png should remain
        const messages = fileViolations.map((v) => v.message);
        expect(messages.some((m) => m.includes("unused.css"))).toBe(false);
        expect(messages.some((m) => m.includes("unused.png"))).toBe(true);
    });
});
