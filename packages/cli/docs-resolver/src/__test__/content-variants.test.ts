import { DocsV1Write, FernNavigation } from "@fern-api/fdr-sdk";
import { AbsoluteFilePath, resolve } from "@fern-api/fs-utils";
import { createMockTaskContext } from "@fern-api/task-context";
import { loadDocsWorkspace } from "@fern-api/workspace-loader";
import { describe, expect, it } from "vitest";

import { DocsDefinitionResolver } from "../DocsDefinitionResolver.js";

const context = createMockTaskContext();

function collectPageNodes(node: FernNavigation.V1.NavigationNode): FernNavigation.V1.PageNode[] {
    if (node.type === "page") {
        return [node];
    }
    const children: FernNavigation.V1.NavigationNode[] =
        "children" in node && Array.isArray(node.children)
            ? node.children
            : "child" in node && node.child != null
              ? [node.child]
              : [];
    return children.flatMap(collectPageNodes);
}

describe("content variants", () => {
    it("renders one page per variant from a single markdown file", async () => {
        const docsWorkspace = await loadDocsWorkspace({
            fernDirectory: resolve(AbsoluteFilePath.of(__dirname), "fixtures/content-variants/fern"),
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
        const resolvedDocs = await resolver.resolve();
        if (resolvedDocs.config.root == null) {
            throw new Error("Failed to resolve docs root");
        }

        const pageIds = Object.keys(resolvedDocs.pages).sort();
        expect(pageIds).toEqual([
            "pages/plain.mdx",
            "pages/shared/server-config~apache.mdx",
            "pages/shared/server-config~nginx.mdx"
        ]);

        const nginx = resolvedDocs.pages[DocsV1Write.PageId("pages/shared/server-config~nginx.mdx")];
        const apache = resolvedDocs.pages[DocsV1Write.PageId("pages/shared/server-config~apache.mdx")];

        expect(nginx?.markdown).toMatchInlineSnapshot(`
          "---
          title: Configure NGINX
          ---

          Edit \`/etc/nginx/nginx.conf\` on your NGINX server. See the [NGINX reference](https://nginx.org/en/docs/).

          \`\`\`nginx
          server {
            listen 80;
          }
          \`\`\`



          Restart NGINX with \`nginx -s reload\`.

          "
        `);
        expect(apache?.markdown).toContain("title: Configure Apache");
        expect(apache?.markdown).toContain("Listen 80");
        expect(apache?.markdown).not.toContain("listen 80;");
        expect(apache?.markdown).toContain("Restart Apache with `apachectl graceful`.");
        expect(apache?.markdown).not.toContain("{{variant.");

        const pageNodes = collectPageNodes(resolvedDocs.config.root as FernNavigation.V1.NavigationNode);
        const slugsByPageId = Object.fromEntries(pageNodes.map((node) => [node.pageId, node.slug]));
        expect(slugsByPageId).toEqual({
            "pages/shared/server-config~nginx.mdx": "nginx/configuration",
            "pages/shared/server-config~apache.mdx": "apache/configuration",
            "pages/plain.mdx": "plain"
        });
    });
});
