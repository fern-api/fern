import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { createMockTaskContext } from "@fern-api/task-context";
import path from "path";
import { UnusedAssetsRule } from "../../rules/unused-assets/unused-assets.js";
import { runRulesOnDocsWorkspace } from "../../validateDocsWorkspace.js";

const FIXTURES_DIR = path.join(__dirname, "fixtures", "fern");

describe("unused-assets", () => {
    it("should detect unused asset files", async () => {
        const context = createMockTaskContext();
        const fernFolder = AbsoluteFilePath.of(FIXTURES_DIR);
        const configPath = AbsoluteFilePath.of(path.join(FIXTURES_DIR, "docs.yml"));

        const violations = await runRulesOnDocsWorkspace({
            workspace: {
                type: "docs",
                workspaceName: "test",
                absoluteFilePath: fernFolder,
                absoluteFilepathToDocsConfig: configPath,
                config: {
                    instances: [{ url: "test.docs.buildwithfern.com" }],
                    navigation: [
                        {
                            page: "Test",
                            path: "./pages/test.mdx"
                        }
                    ]
                }
            },
            rules: [UnusedAssetsRule],
            context,
            apiWorkspaces: [],
            ossWorkspaces: []
        });

        // Should find unused.png and unused.css but not used.png (referenced in test.mdx)
        const unusedViolations = violations.filter((v) => v.name === "unused-assets");
        expect(unusedViolations.length).toBeGreaterThanOrEqual(2);

        const messages = unusedViolations.map((v) => v.message);
        expect(messages.some((m) => m.includes("unused.png"))).toBe(true);
        expect(messages.some((m) => m.includes("unused.css"))).toBe(true);
        // used.png should NOT be flagged
        expect(messages.some((m) => m.includes("used.png"))).toBe(false);

        // All should be warnings
        for (const v of unusedViolations) {
            expect(v.severity).toBe("warning");
        }
    });

    it("should return no violations when all assets are used", async () => {
        const context = createMockTaskContext();
        const fernFolder = AbsoluteFilePath.of(FIXTURES_DIR);
        const configPath = AbsoluteFilePath.of(path.join(FIXTURES_DIR, "docs.yml"));

        const violations = await runRulesOnDocsWorkspace({
            workspace: {
                type: "docs",
                workspaceName: "test",
                absoluteFilePath: fernFolder,
                absoluteFilepathToDocsConfig: configPath,
                config: {
                    instances: [{ url: "test.docs.buildwithfern.com" }],
                    css: ["./assets/unused.css"],
                    navigation: [
                        {
                            page: "Test",
                            path: "./pages/test.mdx"
                        }
                    ]
                }
            },
            rules: [UnusedAssetsRule],
            context,
            apiWorkspaces: [],
            ossWorkspaces: []
        });

        // unused.css is now referenced via css config, and used.png is in markdown
        // Only unused.png should remain
        const unusedViolations = violations.filter((v) => v.name === "unused-assets");
        const messages = unusedViolations.map((v) => v.message);
        expect(messages.some((m) => m.includes("unused.css"))).toBe(false);
        expect(messages.some((m) => m.includes("unused.png"))).toBe(true);
    });
});
