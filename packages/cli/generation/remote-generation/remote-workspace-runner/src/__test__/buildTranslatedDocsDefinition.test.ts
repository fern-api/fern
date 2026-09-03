import type { DocsDefinitionResolver } from "@fern-api/docs-resolver";
import { DocsV1Write, FernNavigation } from "@fern-api/fdr-sdk";
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { createMockTaskContext } from "@fern-api/task-context";
import { tmpdir } from "os";
import { describe, expect, it } from "vitest";
import { buildTranslatedDocsDefinition } from "../buildTranslatedDocsDefinition";

const context = createMockTaskContext();

function createResolverStub(): DocsDefinitionResolver {
    return {
        getCollectedFileIds: () => new Map(),
        getDocsWorkspacePath: () => AbsoluteFilePath.of(tmpdir()),
        getMarkdownFilesToPathName: () => ({})
    } as unknown as DocsDefinitionResolver;
}

function createBaseDefinition(pageId: string): DocsV1Write.DocsDefinition {
    return {
        pages: {
            [DocsV1Write.PageId(pageId)]: { markdown: "base" }
        },
        config: {
            root: {
                type: "root",
                version: "v1",
                id: FernNavigation.V1.NodeId("root"),
                title: "Docs",
                slug: FernNavigation.V1.Slug(""),
                child: {
                    type: "unversioned",
                    id: FernNavigation.V1.NodeId("unversioned"),
                    child: {
                        type: "sidebarRoot",
                        id: FernNavigation.V1.NodeId("sidebar"),
                        children: []
                    }
                }
            }
        }
    } as unknown as DocsV1Write.DocsDefinition;
}

describe("buildTranslatedDocsDefinition", () => {
    it("strips MDX comments from markdown but keeps them in rawMarkdown", async () => {
        const source =
            "---\ntitle: Bienvenue\n---\n\n{/* commentaire */}\n\nBonjour {/* inline */} monde.\n\n<!-- html comment -->\n";

        const result = await buildTranslatedDocsDefinition({
            docsDefinition: createBaseDefinition("welcome.mdx"),
            locale: "fr",
            localePages: { "welcome.mdx": source },
            translationNavigationOverlays: undefined,
            resolver: createResolverStub(),
            context
        });

        const page = result.pages[DocsV1Write.PageId("welcome.mdx")];
        expect(page).toBeDefined();
        expect(page?.markdown).not.toContain("{/*");
        expect(page?.markdown?.replace(/\s+/g, " ")).toContain("Bonjour monde.");
        expect(page?.markdown).toContain("<!-- html comment -->");
        expect(page?.rawMarkdown).toBe(source);
    });
});
