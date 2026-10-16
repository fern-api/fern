import { FernNavigation } from "@fern-api/fdr-sdk";
import { AbsoluteFilePath, resolve } from "@fern-api/fs-utils";
import { createMockTaskContext } from "@fern-api/task-context";
import { loadDocsWorkspace } from "@fern-api/workspace-loader";
import { DocsDefinitionResolver } from "../DocsDefinitionResolver.js";

async function resolveFixture(fixture: string) {
    const context = createMockTaskContext();
    const docsWorkspace = await loadDocsWorkspace({
        fernDirectory: resolve(AbsoluteFilePath.of(__dirname), `fixtures/version-default/${fixture}/fern`),
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

async function resolveLatestRoot(fixture: string) {
    const resolvedDocs = await resolveFixture(fixture);
    const v1Root = resolvedDocs.config.root;
    if (v1Root == null) {
        throw new Error("Failed to resolve docs root");
    }
    return { resolvedDocs, root: FernNavigation.migrate.FernNavigationV1ToLatest.create().root(v1Root) };
}

function getVersionNodes(root: FernNavigation.RootNode): FernNavigation.VersionNode[] {
    const versioned = root.child;
    if (versioned.type !== "versioned") {
        throw new Error(`Expected versioned root, got ${versioned.type}`);
    }
    return versioned.children;
}

function getPageContent(
    resolvedDocs: Awaited<ReturnType<typeof resolveFixture>>,
    root: FernNavigation.RootNode,
    slug: string
): string {
    const found = FernNavigation.utils.findNode(root, FernNavigation.Slug(slug));
    if (found.type !== "found" || found.node.type !== "page") {
        throw new Error(`Expected /${slug} to resolve to a page, got ${found.type}`);
    }
    const page = resolvedDocs.pages[found.node.pageId as keyof typeof resolvedDocs.pages];
    if (page == null) {
        throw new Error(`No page content for /${slug}`);
    }
    return page.markdown;
}

describe("version `default: true`", () => {
    it("makes a non-first version the default while keeping list order", async () => {
        const { resolvedDocs, root } = await resolveLatestRoot("explicit");
        const versions = getVersionNodes(root);

        expect(versions.map((version) => version.title)).toEqual(["Develop", "3.3.0", "Older releases"]);
        expect(versions.map((version) => version.default)).toEqual([false, true, false]);

        expect(getPageContent(resolvedDocs, root, "guides/getting-started")).toContain("Getting started with 3.3.0.");
        expect(getPageContent(resolvedDocs, root, "develop/guides/getting-started")).toContain(
            "Getting started with Develop."
        );
        expect(getPageContent(resolvedDocs, root, "archive/guides/getting-started")).toContain(
            "Getting started with Older releases."
        );
    });

    it("resolves links to pages shared with the default version to unversioned slugs", async () => {
        const { resolvedDocs, root } = await resolveLatestRoot("explicit");
        const markdown = getPageContent(resolvedDocs, root, "guides/getting-started");
        expect(markdown).toContain("(/guides/shared)");
        expect(markdown).not.toContain("/develop/guides/shared");
    });

    it("falls back to the first version when no version sets `default`", async () => {
        const { resolvedDocs, root } = await resolveLatestRoot("fallback");
        const versions = getVersionNodes(root);

        expect(versions.map((version) => version.default)).toEqual([true, false, false]);
        expect(getPageContent(resolvedDocs, root, "guides/getting-started")).toContain("Getting started with Develop.");
        expect(getPageContent(resolvedDocs, root, "3-3-0/guides/getting-started")).toContain(
            "Getting started with 3.3.0."
        );
    });

    it("rejects more than one `default: true`", async () => {
        await expect(resolveFixture("multiple")).rejects.toThrow(
            "Only one version can set 'default: true', but 2 do: 'Develop', '3.3.0'."
        );
    });

    it("rejects a hidden default version", async () => {
        await expect(resolveFixture("hidden")).rejects.toThrow('The default version "3.3.0" cannot be hidden.');
    });
});
