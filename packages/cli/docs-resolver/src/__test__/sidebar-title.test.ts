import { FernNavigation } from "@fern-api/fdr-sdk";
import { AbsoluteFilePath, resolve } from "@fern-api/fs-utils";
import { createMockTaskContext } from "@fern-api/task-context";
import { loadDocsWorkspace } from "@fern-api/workspace-loader";
import { readFile } from "fs/promises";
import matter from "gray-matter";
import { DocsDefinitionResolver } from "../DocsDefinitionResolver";

const context = createMockTaskContext();

// Helper function to recursively find page nodes in the navigation tree
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

describe("sidebar-title frontmatter override", () => {
    it("should parse sidebar-title from frontmatter", async () => {
        const fixtureDir = resolve(AbsoluteFilePath.of(__dirname), "fixtures/sidebar-title/fern");

        const pageWithSidebarTitle = await readFile(resolve(fixtureDir, "page-with-sidebar-title.mdx"), "utf-8");
        const frontmatter1 = matter(pageWithSidebarTitle);
        expect(frontmatter1.data["sidebar-title"]).toBe("Custom Sidebar Title");

        const pageWithoutOverride = await readFile(resolve(fixtureDir, "page-without-override.mdx"), "utf-8");
        const frontmatter2 = matter(pageWithoutOverride);
        expect(frontmatter2.data["sidebar-title"]).toBeUndefined();

        const sectionOverview = await readFile(resolve(fixtureDir, "section-overview.mdx"), "utf-8");
        const frontmatter3 = matter(sectionOverview);
        expect(frontmatter3.data["sidebar-title"]).toBe("Custom Section Title");
    });

    it("should load docs workspace with sidebar-title pages", async () => {
        const docsWorkspace = await loadDocsWorkspace({
            fernDirectory: resolve(AbsoluteFilePath.of(__dirname), "fixtures/sidebar-title/fern"),
            context
        });

        expect(docsWorkspace).toBeDefined();
        expect(docsWorkspace?.config).toBeDefined();
    });

    it("should use sidebar-title from frontmatter in resolved page nodes", async () => {
        const docsWorkspace = await loadDocsWorkspace({
            fernDirectory: resolve(AbsoluteFilePath.of(__dirname), "fixtures/sidebar-title/fern"),
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

        // Extract all page nodes from the navigation tree
        const pageNodes = findPageNodesInTree(resolvedDocs.config.root);

        // Find the nested page that has sidebar-title override
        const nestedPage = pageNodes.find((node) => node.pageId.includes("nested-page.mdx"));
        expect(nestedPage).toBeDefined();
        // This should use the sidebar-title frontmatter override, not the original title
        expect(nestedPage?.title).toBe("Custom Nested Title");

        // This test verifies that:
        // 1. The docs resolver correctly processes sidebar-title frontmatter
        // 2. The resolved page node uses the custom sidebar title instead of the original title
        // 3. The sidebar-title override functionality works after docs definition resolution
    });
});
