import { FernNavigation } from "@fern-api/fdr-sdk";
import { AbsoluteFilePath, resolve } from "@fern-api/fs-utils";
import { createMockTaskContext } from "@fern-api/task-context";
import { loadDocsWorkspace } from "@fern-api/workspace-loader";
import { DocsDefinitionResolver } from "../DocsDefinitionResolver";

const context = createMockTaskContext();

function findPageNodesInTree(node: FernNavigation.V1.NavigationNode): FernNavigation.V1.PageNode[] {
    const pageNodes: FernNavigation.V1.PageNode[] = [];

    if (node.type === "page") {
        pageNodes.push(node);
    } else if (node.type === "section") {
        node.children.forEach((child) => {
            pageNodes.push(...findPageNodesInTree(child));
        });
    } else if (node.type === "sidebarRoot") {
        node.children?.forEach((child) => {
            pageNodes.push(...findPageNodesInTree(child));
        });
    } else if (node.type === "sidebarGroup") {
        node.children?.forEach((child) => {
            pageNodes.push(...findPageNodesInTree(child));
        });
    } else if (node.type === "root") {
        if (node.child.type === "productgroup" || node.child.type === "versioned") {
            node.child.children.forEach((child) => {
                pageNodes.push(...findPageNodesInTree(child));
            });
        } else if (node.child.type === "unversioned") {
            if (node.child.child.type === "sidebarRoot") {
                node.child.child.children?.forEach((child) => {
                    pageNodes.push(...findPageNodesInTree(child));
                });
            } else {
                pageNodes.push(...findPageNodesInTree(node.child.child));
            }
        } else {
            pageNodes.push(...findPageNodesInTree(node.child));
        }
    }

    return pageNodes;
}

describe("absolute slug validation", () => {
    it("should not use absolute URLs as slugs in frontmatter", async () => {
        const docsWorkspace = await loadDocsWorkspace({
            fernDirectory: resolve(AbsoluteFilePath.of(__dirname), "fixtures/absolute-slug-validation/fern"),
            context
        });

        if (!docsWorkspace) {
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

        const resolvedDocs = await resolver.resolve();
        expect(resolvedDocs.config.root).toBeDefined();

        if (!resolvedDocs.config.root) {
            throw new Error("Failed to resolve docs root");
        }

        const pageNodes = findPageNodesInTree(resolvedDocs.config.root);

        const pageWithAbsoluteSlug = pageNodes.find((node) => node.pageId.includes("page-with-absolute-slug.mdx"));
        expect(pageWithAbsoluteSlug).toBeDefined();
        expect(pageWithAbsoluteSlug?.slug).not.toBe("https://google.com");
        expect(pageWithAbsoluteSlug?.slug).not.toContain("https://");
        expect(pageWithAbsoluteSlug?.slug).not.toContain("http://");

        const pageWithRelativeSlug = pageNodes.find((node) => node.pageId.includes("page-with-relative-slug.mdx"));
        expect(pageWithRelativeSlug).toBeDefined();
        expect(pageWithRelativeSlug?.slug).toBe("custom-relative-slug");

        const pageWithoutSlug = pageNodes.find((node) => node.pageId.includes("page-without-slug.mdx"));
        expect(pageWithoutSlug).toBeDefined();
        expect(pageWithoutSlug?.slug).not.toContain("https://");
        expect(pageWithoutSlug?.slug).not.toContain("http://");
    });

    it("should reject protocol-relative URLs as slugs", async () => {
        const docsWorkspace = await loadDocsWorkspace({
            fernDirectory: resolve(AbsoluteFilePath.of(__dirname), "fixtures/absolute-slug-validation/fern"),
            context
        });

        if (!docsWorkspace) {
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

        const resolvedDocs = await resolver.resolve();

        if (!resolvedDocs.config.root) {
            throw new Error("Failed to resolve docs root");
        }

        const pageNodes = findPageNodesInTree(resolvedDocs.config.root);

        for (const pageNode of pageNodes) {
            expect(pageNode.slug).not.toMatch(/^\/\/[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
        }
    });
});
