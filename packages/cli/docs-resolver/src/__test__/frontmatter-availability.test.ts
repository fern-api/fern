import { FernNavigation } from "@fern-api/fdr-sdk";
import { AbsoluteFilePath, resolve } from "@fern-api/fs-utils";
import { createMockTaskContext } from "@fern-api/task-context";
import { loadDocsWorkspace } from "@fern-api/workspace-loader";
import { readFile } from "fs/promises";
import matter from "gray-matter";
import { DocsDefinitionResolver } from "../DocsDefinitionResolver.js";

const context = createMockTaskContext();

function findPageNodesInTree(node: FernNavigation.V1.NavigationNode): FernNavigation.V1.PageNode[] {
    const pageNodes: FernNavigation.V1.PageNode[] = [];

    if (node.type === "page") {
        pageNodes.push(node);
    } else if (node.type === "section") {
        node.children.forEach((child) => {
            pageNodes.push(...findPageNodesInTree(child));
        });
    } else if (node.type === "sidebarGroup") {
        node.children?.forEach((child) => {
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

function findSectionNodesInTree(node: FernNavigation.V1.NavigationNode): FernNavigation.V1.SectionNode[] {
    const sectionNodes: FernNavigation.V1.SectionNode[] = [];

    if (node.type === "section") {
        sectionNodes.push(node);
        node.children.forEach((child) => {
            sectionNodes.push(...findSectionNodesInTree(child));
        });
    } else if (node.type === "sidebarRoot") {
        node.children?.forEach((child) => {
            sectionNodes.push(...findSectionNodesInTree(child));
        });
    } else if (node.type === "root") {
        if (node.child.type === "productgroup" || node.child.type === "versioned") {
            node.child.children.forEach((child) => {
                sectionNodes.push(...findSectionNodesInTree(child));
            });
        } else if (node.child.type === "unversioned") {
            if (node.child.child.type === "sidebarRoot") {
                node.child.child.children?.forEach((child) => {
                    sectionNodes.push(...findSectionNodesInTree(child));
                });
            } else {
                sectionNodes.push(...findSectionNodesInTree(node.child.child));
            }
        } else {
            sectionNodes.push(...findSectionNodesInTree(node.child));
        }
    }

    return sectionNodes;
}

describe("frontmatter availability override", () => {
    it("should parse availability from frontmatter", async () => {
        const fixtureDir = resolve(AbsoluteFilePath.of(__dirname), "fixtures/frontmatter-availability/fern");

        const pageWithBeta = await readFile(resolve(fixtureDir, "page-with-beta.mdx"), "utf-8");
        const frontmatter1 = matter(pageWithBeta);
        expect(frontmatter1.data.availability).toBe("beta");

        const pageWithoutAvailability = await readFile(resolve(fixtureDir, "page-without-availability.mdx"), "utf-8");
        const frontmatter2 = matter(pageWithoutAvailability);
        expect(frontmatter2.data.availability).toBeUndefined();

        const pageOverride = await readFile(resolve(fixtureDir, "page-override-nav.mdx"), "utf-8");
        const frontmatter3 = matter(pageOverride);
        expect(frontmatter3.data.availability).toBe("in-development");

        const sectionOverview = await readFile(resolve(fixtureDir, "section-overview.mdx"), "utf-8");
        const frontmatter4 = matter(sectionOverview);
        expect(frontmatter4.data.availability).toBe("pre-release");
    });

    it("should load docs workspace with availability pages", async () => {
        const docsWorkspace = await loadDocsWorkspace({
            fernDirectory: resolve(AbsoluteFilePath.of(__dirname), "fixtures/frontmatter-availability/fern"),
            context
        });

        expect(docsWorkspace).toBeDefined();
        expect(docsWorkspace?.config).toBeDefined();
    });

    it("should use availability from frontmatter in resolved page nodes", async () => {
        const docsWorkspace = await loadDocsWorkspace({
            fernDirectory: resolve(AbsoluteFilePath.of(__dirname), "fixtures/frontmatter-availability/fern"),
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

        const pageNodes = findPageNodesInTree(resolvedDocs.config.root as FernNavigation.V1.NavigationNode);

        const pageWithBeta = pageNodes.find((node) => node.pageId.includes("page-with-beta.mdx"));
        expect(pageWithBeta).toBeDefined();
        expect(pageWithBeta?.availability).toBe("beta");

        const pageWithoutAvailability = pageNodes.find((node) => node.pageId.includes("page-without-availability.mdx"));
        expect(pageWithoutAvailability).toBeDefined();
        expect(pageWithoutAvailability?.availability).toBeUndefined();

        const pageWithNavAvailability = pageNodes.find((node) =>
            node.pageId.includes("page-with-nav-availability.mdx")
        );
        expect(pageWithNavAvailability).toBeDefined();
        expect(pageWithNavAvailability?.availability).toBe("deprecated");

        const pageOverride = pageNodes.find((node) => node.pageId.includes("page-override-nav.mdx"));
        expect(pageOverride).toBeDefined();
        expect(pageOverride?.availability).toBe("in-development");

        const nestedPage = pageNodes.find((node) => node.pageId.includes("nested-page.mdx"));
        expect(nestedPage).toBeDefined();
        expect(nestedPage?.availability).toBe("generally-available");
    });

    it("should use availability from frontmatter in section overview", async () => {
        const docsWorkspace = await loadDocsWorkspace({
            fernDirectory: resolve(AbsoluteFilePath.of(__dirname), "fixtures/frontmatter-availability/fern"),
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

        const sectionNodes = findSectionNodesInTree(resolvedDocs.config.root as FernNavigation.V1.NavigationNode);

        const sectionWithOverview = sectionNodes.find((node) => node.title === "Section With Overview");
        expect(sectionWithOverview).toBeDefined();
        expect(sectionWithOverview?.availability).toBe("pre-release");
    });
});
