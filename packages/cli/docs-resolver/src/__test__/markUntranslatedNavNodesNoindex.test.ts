import { FernNavigation } from "@fern-api/fdr-sdk";
import { describe, expect, it } from "vitest";

import { markUntranslatedNavNodesNoindex } from "../markUntranslatedNavNodesNoindex.js";

function asRoot(obj: unknown): FernNavigation.V1.RootNode {
    return obj as FernNavigation.V1.RootNode;
}

const root = asRoot({
    type: "root",
    child: {
        type: "sidebarRoot",
        children: [
            {
                type: "section",
                overviewPageId: "pages/section.mdx",
                children: [
                    { type: "page", pageId: "pages/translated.mdx" },
                    { type: "page", pageId: "pages/untranslated.mdx" },
                    { type: "link", url: "https://example.com" }
                ]
            },
            {
                type: "apiReference",
                apiDefinitionId: "translated-api",
                children: [
                    { type: "endpoint", apiDefinitionId: "translated-api", endpointId: "a" },
                    { type: "webhook", apiDefinitionId: "base-api", webhookId: "b" }
                ]
            }
        ]
    }
});

interface TestNode {
    type: string;
    noindex?: boolean;
    children: TestNode[];
}

function sidebarChildren(tree: FernNavigation.V1.RootNode | undefined): TestNode[] {
    return (tree as unknown as { child: { children: TestNode[] } }).child.children;
}

describe("markUntranslatedNavNodesNoindex", () => {
    it("marks untranslated pages, overviews, and API leaves noindex", () => {
        const result = markUntranslatedNavNodesNoindex(root, {
            translatedPageIds: new Set(["pages/translated.mdx"]),
            translatedApiDefinitionIds: new Set(["translated-api"])
        });
        const [section, apiReference] = sidebarChildren(result);
        expect(section?.noindex).toBe(true);
        expect(section?.children.map((child) => child.noindex)).toEqual([undefined, true, undefined]);
        expect(apiReference?.noindex).toBeUndefined();
        expect(apiReference?.children.map((child) => child.noindex)).toEqual([undefined, true]);
    });

    it("skips categories whose translated set is omitted", () => {
        const result = markUntranslatedNavNodesNoindex(root, {
            translatedApiDefinitionIds: new Set(["translated-api"])
        });
        const [section, apiReference] = sidebarChildren(result);
        expect(section?.noindex).toBeUndefined();
        expect(section?.children.map((child) => child.noindex)).toEqual([undefined, undefined, undefined]);
        expect(apiReference?.children.map((child) => child.noindex)).toEqual([undefined, true]);
    });

    it("does not mutate the input tree", () => {
        const snapshot = structuredClone(root);
        markUntranslatedNavNodesNoindex(root, {
            translatedPageIds: new Set(),
            translatedApiDefinitionIds: new Set()
        });
        expect(root).toEqual(snapshot);
    });
});
