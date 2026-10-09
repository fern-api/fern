import { DocsV1Read } from "@fern-api/fdr-sdk";
import { AbsoluteFilePath } from "@fern-api/fs-utils";

import { describe, expect, it } from "vitest";

import { getExternalDocsWatchPaths } from "../getExternalDocsWatchPaths.js";

const FERN_DIR = AbsoluteFilePath.of("/repo/fern");

function docsDefinitionWithPages(pageIds: string[]): Pick<DocsV1Read.DocsDefinition, "pages"> {
    const pages: DocsV1Read.DocsDefinition["pages"] = {};
    for (const pageId of pageIds) {
        pages[DocsV1Read.PageId(pageId)] = { markdown: "" };
    }
    return { pages };
}

describe("getExternalDocsWatchPaths", () => {
    it("ignores pages inside the fern folder", () => {
        expect(getExternalDocsWatchPaths(FERN_DIR, docsDefinitionWithPages(["pages/intro.mdx"]))).toEqual([]);
    });

    it("returns the directory of a page outside the fern folder", () => {
        expect(getExternalDocsWatchPaths(FERN_DIR, docsDefinitionWithPages(["../docs/intro.mdx"]))).toEqual([
            "/repo/docs"
        ]);
    });

    it("returns the directory of a redirects file outside the fern folder", () => {
        expect(
            getExternalDocsWatchPaths(FERN_DIR, docsDefinitionWithPages([]), [
                AbsoluteFilePath.of("/repo/redirects/a.yml"),
                AbsoluteFilePath.of("/repo/fern/redirects/b.yml")
            ])
        ).toEqual(["/repo/redirects"]);
    });
});
