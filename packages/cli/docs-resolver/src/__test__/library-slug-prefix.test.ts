import { AbsoluteFilePath, resolve } from "@fern-api/fs-utils";
import { createMockTaskContext } from "@fern-api/task-context";
import { loadDocsWorkspace } from "@fern-api/workspace-loader";
import { describe, expect, it } from "vitest";

import { DocsDefinitionResolver } from "../DocsDefinitionResolver.js";

const context = createMockTaskContext();

interface LibraryNodeSummary {
    type: string;
    slug: string;
    pageId?: string;
    overviewPageId?: string;
}

function collectLibraryNodes(node: unknown, out: LibraryNodeSummary[] = []): LibraryNodeSummary[] {
    if (Array.isArray(node)) {
        for (const child of node) {
            collectLibraryNodes(child, out);
        }
        return out;
    }
    if (node == null || typeof node !== "object") {
        return out;
    }
    const record = node as Record<string, unknown>;
    if ((record.type === "page" || record.type === "section") && typeof record.slug === "string") {
        out.push({
            type: record.type,
            slug: record.slug,
            ...(typeof record.pageId === "string" ? { pageId: record.pageId } : {}),
            ...(typeof record.overviewPageId === "string" ? { overviewPageId: record.overviewPageId } : {})
        });
    }
    for (const value of Object.values(record)) {
        collectLibraryNodes(value, out);
    }
    return out;
}

describe("library section with a slug prefix that differs from its file layout", () => {
    it("slugs pages by the nav slug and reads files from the nav path", async () => {
        const docsWorkspace = await loadDocsWorkspace({
            fernDirectory: resolve(AbsoluteFilePath.of(__dirname), "fixtures/library-slug-prefix/fern"),
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

        const root = (await resolver.resolve()).config.root;

        expect(collectLibraryNodes(root)).toEqual([
            {
                type: "section",
                slug: "python-api-reference",
                overviewPageId: "static/prismo/prismo/index.mdx"
            },
            {
                type: "section",
                slug: "api-reference/python/prismo/network",
                overviewPageId: "static/prismo/prismo/network/index.mdx"
            },
            {
                type: "page",
                slug: "api-reference/python/prismo/network/topology",
                pageId: "static/prismo/prismo/network/topology.mdx"
            },
            {
                type: "page",
                slug: "api-reference/python/prismo/utils",
                pageId: "static/prismo/prismo/utils.mdx"
            }
        ]);
    });
});
