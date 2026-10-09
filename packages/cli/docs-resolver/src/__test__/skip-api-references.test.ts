import { FernNavigation } from "@fern-api/fdr-sdk";
import { AbsoluteFilePath, resolve } from "@fern-api/fs-utils";
import { createMockTaskContext } from "@fern-api/task-context";
import { loadDocsWorkspace } from "@fern-api/workspace-loader";
import { describe, expect, it, vi } from "vitest";

import { DocsDefinitionResolver, type RegisterApiFn } from "../DocsDefinitionResolver.js";

const context = createMockTaskContext();

interface ChildSummary {
    type: string;
    title: string | undefined;
    children?: ChildSummary[];
}

function summarizeChild(child: FernNavigation.V1.ApiPackageChild): ChildSummary {
    const title = "title" in child ? child.title : undefined;
    if (child.type === "apiPackage") {
        return { type: child.type, title, children: child.children.map(summarizeChild) };
    }
    return { type: child.type, title };
}

function findApiReferenceNodes(node: unknown): FernNavigation.V1.ApiReferenceNode[] {
    if (node == null || typeof node !== "object") {
        return [];
    }
    if ((node as { type?: unknown }).type === "apiReference") {
        return [node as FernNavigation.V1.ApiReferenceNode];
    }
    return Object.values(node).flatMap((value) =>
        Array.isArray(value) ? value.flatMap(findApiReferenceNodes) : findApiReferenceNodes(value)
    );
}

describe("skipApiReferences", () => {
    it("keeps the overview and markdown pages of an API section and registers an empty API", async () => {
        const docsWorkspace = await loadDocsWorkspace({
            fernDirectory: resolve(AbsoluteFilePath.of(__dirname), "fixtures/skip-api-references/fern"),
            context
        });
        if (docsWorkspace == null) {
            throw new Error("Failed to load docs workspace");
        }

        const registerApi = vi.fn<RegisterApiFn>(async () => "registered-api");
        const resolver = new DocsDefinitionResolver({
            domain: "https://example.com",
            docsWorkspace,
            ossWorkspaces: [],
            apiWorkspaces: [],
            taskContext: context,
            uploadFiles: async () => [],
            registerApi,
            skipApiReferences: true
        });

        const resolved = await resolver.resolve();
        const root = resolved.config.root;
        if (root == null) {
            throw new Error("Failed to resolve docs root");
        }

        const apiReferences = findApiReferenceNodes(root);

        expect(registerApi).not.toHaveBeenCalled();
        expect(apiReferences).toHaveLength(1);
        const apiReference = apiReferences[0];
        if (apiReference == null) {
            throw new Error("Expected an API reference node");
        }

        expect(Object.keys(resolver.getSkippedApiDefinitions())).toEqual([apiReference.apiDefinitionId]);
        expect(apiReference.overviewPageId).toBe("api-overview.mdx");
        expect(apiReference.children.map(summarizeChild)).toEqual([
            { type: "page", title: "Getting started" },
            { type: "link", title: "Status page" },
            { type: "apiPackage", title: "Guides", children: [{ type: "page", title: "Authentication" }] }
        ]);
    });
});
