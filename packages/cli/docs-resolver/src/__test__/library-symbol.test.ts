import { DocsV1Write } from "@fern-api/fdr-sdk";
import { AbsoluteFilePath, RelativeFilePath, resolve } from "@fern-api/fs-utils";
import { createMockTaskContext } from "@fern-api/task-context";
import { loadDocsWorkspace } from "@fern-api/workspace-loader";
import { describe, expect, it } from "vitest";

import { DocsDefinitionResolver } from "../DocsDefinitionResolver.js";

const context = createMockTaskContext();

async function resolveFixture(fixture: string): Promise<DocsV1Write.DocsDefinition> {
    const docsWorkspace = await loadDocsWorkspace({
        fernDirectory: resolve(AbsoluteFilePath.of(__dirname), `fixtures/${fixture}/fern`),
        context
    });
    if (docsWorkspace == null) {
        throw new Error("Failed to load docs workspace");
    }
    const resolver = new DocsDefinitionResolver({
        domain: "https://example.com",
        docsWorkspace,
        ossWorkspaces: [],
        apiWorkspaces: [],
        taskContext: context,
        uploadFiles: async () => [],
        registerApi: async () => ""
    });
    return resolver.resolve();
}

function collectPageIds(node: unknown, out: string[] = []): string[] {
    if (node == null || typeof node !== "object") {
        return out;
    }
    if ("pageId" in node && typeof node.pageId === "string") {
        out.push(node.pageId);
    }
    for (const value of Object.values(node)) {
        if (Array.isArray(value)) {
            for (const child of value) {
                collectPageIds(child, out);
            }
        } else if (typeof value === "object") {
            collectPageIds(value, out);
        }
    }
    return out;
}

/**
 * `<LibrarySymbol />` tags in authored pages are resolved at build time from the IR
 * persisted by `fern docs md generate` (`<output.path>/.fern/library-ir.json`).
 */
describe("<LibrarySymbol /> in authored pages", () => {
    it("renders symbols from the persisted IR with the generated-page anchors", async () => {
        const docs = await resolveFixture("library-symbol");
        const page = docs.pages[DocsV1Write.PageId(RelativeFilePath.of("pages/c-api.mdx"))];
        expect(page).toBeDefined();
        const markdown = page?.markdown ?? "";

        expect(markdown).not.toContain("<LibrarySymbol");
        expect(markdown).toContain("### `cuopt_int_t` [#cuoptintt]");
        expect(markdown).toContain("The integer type used by the solver.");
        expect(markdown).toContain("#### `cuOptGetIntSize` [#cuoptgetintsize]");
        expect(markdown).toContain("Returns the size in bytes of cuopt_int_t.");
        // Authored prose around the includes is preserved
        expect(markdown).toContain("Use the following to inspect the width at runtime:");

        expect(collectPageIds(docs.config.root)).toContain("static/cuopt/solver.mdx");
    });

    it("output.pages: false keeps <LibrarySymbol /> working but omits the generated navigation", async () => {
        const docs = await resolveFixture("library-symbol-no-pages");
        const page = docs.pages[DocsV1Write.PageId(RelativeFilePath.of("pages/c-api.mdx"))];
        expect(page?.markdown).toContain("#### `cuOptGetIntSize` [#cuoptgetintsize]");
        expect(collectPageIds(docs.config.root)).not.toContain("static/cuopt/solver.mdx");
    });
});
