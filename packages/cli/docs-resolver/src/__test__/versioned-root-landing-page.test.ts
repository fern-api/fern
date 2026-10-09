import { FernNavigation } from "@fern-api/fdr-sdk";
import { AbsoluteFilePath, resolve } from "@fern-api/fs-utils";
import { createMockTaskContext } from "@fern-api/task-context";
import { loadDocsWorkspace } from "@fern-api/workspace-loader";
import { DocsDefinitionResolver } from "../DocsDefinitionResolver.js";

const context = createMockTaskContext();

/**
 * Narrowed repro from the Extend docset (docs.extend.ai): docs.yml declares a
 * root-level `landing-page` (slug `overview`) pointing at the SAME mdx as the
 * "Overview" page inside the default version's tabbed navigation.
 *
 * On the legacy publish path (CLI < 5.58.0), a root landing page combined with
 * `versions:` was silently dropped, so `/overview` resolved to the sidebar
 * page and rendered with the full sidebar. CLI 5.58.0 (#16794) started cloning
 * the root landing page into every version node; the clone is visited before
 * the version's tabs during slug collection, so it shadows the real page and
 * the docs UI renders `/overview` as a landing page — with no sidebar.
 */
describe("root landing page with versioned navigation", () => {
    it("does not shadow a page that owns the landing slug (renders with sidebar)", async () => {
        const docsWorkspace = await loadDocsWorkspace({
            fernDirectory: resolve(AbsoluteFilePath.of(__dirname), "fixtures/versioned-root-landing-page/fern"),
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
        const v1Root = resolvedDocs.config.root;

        if (v1Root == null) {
            throw new Error("Failed to resolve docs root");
        }

        // End-to-end: run the exact node resolution the docs UI performs at
        // request time (both the v2 and ledger loaders share this code path).
        const latestRoot = FernNavigation.migrate.FernNavigationV1ToLatest.create().root(v1Root);
        const found = FernNavigation.utils.findNode(latestRoot, FernNavigation.Slug("overview"));

        expect(found.type).toBe("found");
        if (found.type !== "found") {
            throw new Error("Expected /overview to resolve to a node");
        }

        // The version's own "Overview" page must win the slug — NOT a landing
        // page cloned from the root config. A landing page here loses the
        // sidebar (it has no sidebarRoot ancestor in tabbed navigation).
        expect(found.node.type).toBe("page");
        expect(found.sidebar).toBeDefined();
        expect(found.breadcrumb.map((item) => item.title)).toContain("Getting Started");
    });
});
