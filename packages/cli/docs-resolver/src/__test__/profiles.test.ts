import { AbsoluteFilePath, resolve } from "@fern-api/fs-utils";
import { createMockTaskContext } from "@fern-api/task-context";
import { loadDocsWorkspace } from "@fern-api/workspace-loader";
import { DocsDefinitionResolver } from "../DocsDefinitionResolver.js";

interface PageLike {
    type: string;
    slug: string;
    profileVars?: Record<string, string>;
}

function collectPages(node: unknown, pages: PageLike[] = []): PageLike[] {
    if (Array.isArray(node)) {
        node.forEach((child) => collectPages(child, pages));
    } else if (node != null && typeof node === "object") {
        const record = node as Record<string, unknown>;
        if (
            record.type === "page" ||
            record.type === "landingPage" ||
            record.type === "changelog" ||
            record.type === "changelogEntry"
        ) {
            pages.push(record as unknown as PageLike);
        }
        collectPages(record.landingPage, pages);
        collectPages(record.child, pages);
        collectPages(record.children, pages);
    }
    return pages;
}

describe("profiles", () => {
    it("attaches the innermost profile's values that each page uses", async () => {
        const context = createMockTaskContext();
        const docsWorkspace = await loadDocsWorkspace({
            fernDirectory: resolve(AbsoluteFilePath.of(__dirname), "fixtures/profiles/fern"),
            context
        });
        if (docsWorkspace == null) {
            throw new Error("Failed to load docs workspace");
        }
        const resolver = new DocsDefinitionResolver({
            domain: "https://profiles.docs.buildwithfern.com",
            docsWorkspace,
            ossWorkspaces: [],
            apiWorkspaces: [],
            taskContext: context,
            uploadFiles: async () => [],
            registerApi: async () => "",
            skipApiReferences: true
        });
        const resolved = await resolver.resolve();
        const bySlug = Object.fromEntries(collectPages(resolved.config.root).map((page) => [page.slug, page]));

        // site profile
        expect(bySlug["guides/community/install"]?.profileVars).toEqual({ CLI: "acme" });
        // tab variant replaces site profile
        expect(bySlug["guides/enterprise/install"]?.profileVars).toEqual({ CLI: "acme-ent" });
        // section profile replaces variant profile; no merge, so CLI is left for CI env vars
        expect(bySlug["guides/enterprise/old/old-install"]?.profileVars).toEqual({ PRODUCT: "Acme Old" });
        // page profile wins
        expect(bySlug["guides/enterprise/override"]?.profileVars).toEqual({ CLI: "acme" });
        // pages without profile vars carry none, so search keeps stored sections
        expect(bySlug["guides/enterprise/plain"]).toBeDefined();
        expect(bySlug["guides/enterprise/plain"]?.profileVars).toBeUndefined();
        // landing page takes its own profile
        expect(bySlug["welcome"]?.profileVars).toEqual({ PRODUCT: "Acme" });
        // a name used only in a translation still gets its value
        expect(bySlug["guides/enterprise/translated"]?.profileVars).toEqual({ CLI: "acme-ent" });
        // markdown pages inside an API reference layout
        expect(bySlug["guides/enterprise/api/api-guide"]?.profileVars).toEqual({ CLI: "acme-ent" });
        // changelog overview and entries
        expect(bySlug["guides/enterprise/changelog"]?.profileVars).toEqual({ CLI: "acme-ent" });
        expect(bySlug["guides/enterprise/changelog/2026/1/1"]?.profileVars).toEqual({ CLI: "acme-ent" });
    });
});
