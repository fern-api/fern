import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { createMockTaskContext } from "@fern-api/task-context";
import { DocsWorkspace } from "@fern-api/workspace-loader";

import { DocsDefinitionResolver } from "../DocsDefinitionResolver.js";

const context = createMockTaskContext();

describe("DocsDefinitionResolver path normalization", () => {
    // Create a mock docs workspace for testing
    const mockDocsWorkspace: DocsWorkspace = {
        type: "docs",
        workspaceName: "test-workspace",
        absoluteFilePath: AbsoluteFilePath.of("/project/fern"), // fern folder
        absoluteFilepathToDocsConfig: AbsoluteFilePath.of("/project/fern/docs.yml"),
        config: {} as any
    };

    const resolver = new DocsDefinitionResolver({
        domain: "test-domain",
        docsWorkspace: mockDocsWorkspace,
        ossWorkspaces: [],
        apiWorkspaces: [],
        taskContext: context,
        editThisPage: undefined,
        uploadFiles: async (_files) => [],
        registerApi: async (_opts) => "",
        targetAudiences: undefined
    });

    // Access the private method for testing
    const toRelativeFilepath = (resolver as any).toRelativeFilepath.bind(resolver);

    it("returns normal relative paths for files inside fern folder", () => {
        const filepath = AbsoluteFilePath.of("/project/fern/docs/assets/logo.svg");
        const result = toRelativeFilepath(filepath);
        expect(result).toBe("docs/assets/logo.svg");
    });

    it("normalizes paths with ../ segments for files outside fern folder", () => {
        const filepath = AbsoluteFilePath.of("/project/docs/assets/logo.svg");
        const result = toRelativeFilepath(filepath);
        // Should replace ../ with _up_/
        expect(result).toBe("_up_/docs/assets/logo.svg");
        expect(result).not.toContain("../");
    });

    it("handles deeply nested outside files", () => {
        const filepath = AbsoluteFilePath.of("/project/assets/images/icons/favicon.ico");
        const result = toRelativeFilepath(filepath);
        expect(result).toBe("_up_/assets/images/icons/favicon.ico");
        expect(result).not.toContain("../");
    });

    it("handles files at project root", () => {
        const filepath = AbsoluteFilePath.of("/project/README.md");
        const result = toRelativeFilepath(filepath);
        expect(result).toBe("_up_/README.md");
        expect(result).not.toContain("../");
    });

    it("handles files outside project root", () => {
        const filepath = AbsoluteFilePath.of("/other-project/assets/logo.svg");
        const result = toRelativeFilepath(filepath);
        // Should replace multiple ../ segments
        expect(result).toBe("_up_/_up_/other-project/assets/logo.svg");
        expect(result).not.toContain("../");
    });

    it("handles undefined filepath", () => {
        const result = toRelativeFilepath(undefined);
        expect(result).toBeUndefined();
    });

    it("ensures same file produces same path from different references", () => {
        // Simulate the same file being referenced from different contexts
        // The normalized path should be the same regardless
        const filepath = AbsoluteFilePath.of("/project/docs/assets/logo.svg");

        // Both should produce the same normalized path
        const result1 = toRelativeFilepath(filepath);
        const result2 = toRelativeFilepath(filepath);

        expect(result1).toBe(result2);
        expect(result1).toBe("_up_/docs/assets/logo.svg");
    });

    it("handles multiple ../ segments", () => {
        // File that requires multiple ../ to reach from fern folder
        const filepath = AbsoluteFilePath.of("/other-root/project/assets/logo.svg");
        const result = toRelativeFilepath(filepath);

        // All ../ segments should be replaced
        expect(result).not.toContain("../");
        expect(result.split("_up_/").length - 1).toBeGreaterThan(0); // Contains at least one _up_/
    });
});
