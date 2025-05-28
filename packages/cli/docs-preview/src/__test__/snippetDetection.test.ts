import { AbsoluteFilePath, relative } from "@fern-api/fs-utils";

// Test just the snippet detection logic (extracted from our fix)
function detectSnippetFiles(
    editedAbsoluteFilepaths: AbsoluteFilePath[],
    docsWorkspaceAbsolutePath: AbsoluteFilePath
): boolean {
    return editedAbsoluteFilepaths.some((filepath) => {
        const relativePath = relative(docsWorkspaceAbsolutePath, filepath);
        return relativePath.startsWith("snippets/") || relativePath.includes("/snippets/");
    });
}

describe("Snippet Detection Logic", () => {
    const docsWorkspacePath = AbsoluteFilePath.of("/mock/fern");

    it("should detect snippet files in root snippets directory", () => {
        const editedFiles = [AbsoluteFilePath.of("/mock/fern/snippets/test-snippet.mdx")];
        const result = detectSnippetFiles(editedFiles, docsWorkspacePath);
        expect(result).toBe(true);
    });

    it("should detect snippet files in nested snippets directory", () => {
        const editedFiles = [AbsoluteFilePath.of("/mock/fern/docs/snippets/nested/test-snippet.mdx")];
        const result = detectSnippetFiles(editedFiles, docsWorkspacePath);
        expect(result).toBe(true);
    });

    it("should not detect non-snippet files", () => {
        const editedFiles = [AbsoluteFilePath.of("/mock/fern/pages/some-page.mdx")];
        const result = detectSnippetFiles(editedFiles, docsWorkspacePath);
        expect(result).toBe(false);
    });

    it("should detect snippet files in mixed file list", () => {
        const editedFiles = [
            AbsoluteFilePath.of("/mock/fern/pages/some-page.mdx"),
            AbsoluteFilePath.of("/mock/fern/snippets/test-snippet.mdx")
        ];
        const result = detectSnippetFiles(editedFiles, docsWorkspacePath);
        expect(result).toBe(true);
    });

    it("should not detect when no snippet files in mixed list", () => {
        const editedFiles = [
            AbsoluteFilePath.of("/mock/fern/pages/some-page.mdx"),
            AbsoluteFilePath.of("/mock/fern/content/another-page.mdx")
        ];
        const result = detectSnippetFiles(editedFiles, docsWorkspacePath);
        expect(result).toBe(false);
    });

    it("should handle multiple snippet files", () => {
        const editedFiles = [
            AbsoluteFilePath.of("/mock/fern/snippets/snippet1.mdx"),
            AbsoluteFilePath.of("/mock/fern/docs/snippets/snippet2.mdx")
        ];
        const result = detectSnippetFiles(editedFiles, docsWorkspacePath);
        expect(result).toBe(true);
    });
});
