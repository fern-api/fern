import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { createMockTaskContext } from "@fern-api/task-context";
import { mkdir, mkdtemp, rm, writeFile } from "fs/promises";
import os from "os";
import path from "path";
import { describe, expect, it } from "vitest";

import { MarkdownFileReader } from "../../utils/markdownFileReader.js";
import { visitNavigationAst } from "../visitNavigationAst.js";

describe("visitNavigationAst", () => {
    it("visits markdown files inside a blog navigation folder", async () => {
        const fernFolder = AbsoluteFilePath.of(await mkdtemp(path.join(os.tmpdir(), "fern-blog-validation-")));
        const blogFolder = join(fernFolder, RelativeFilePath.of("blog"));
        const docsConfig = join(fernFolder, RelativeFilePath.of("docs.yml"));
        const blogPost = join(blogFolder, RelativeFilePath.of("post.mdx"));
        await mkdir(blogFolder, { recursive: true });
        await writeFile(docsConfig, "navigation:\n  - blog: blog\n");
        await writeFile(blogPost, "[broken link](/missing)");

        const reportedBrokenLinks: string[] = [];
        try {
            await visitNavigationAst({
                absolutePathToFernFolder: fernFolder,
                navigation: [{ blog: "blog" }],
                visitor: {
                    markdownPage: async ({ content }) => {
                        if (content.includes("[broken link](/missing)")) {
                            reportedBrokenLinks.push("/missing");
                        }
                    }
                },
                nodePath: [],
                absoluteFilepathToConfiguration: docsConfig,
                apiWorkspaces: [],
                context: createMockTaskContext(),
                markdownReader: new MarkdownFileReader()
            });
        } finally {
            await rm(fernFolder, { recursive: true, force: true });
        }

        expect(reportedBrokenLinks).toEqual(["/missing"]);
    });

    it("visits a markdown page once when several navigation items reference it", async () => {
        const fernFolder = AbsoluteFilePath.of(await mkdtemp(path.join(os.tmpdir(), "fern-shared-page-validation-")));
        const docsConfig = join(fernFolder, RelativeFilePath.of("docs.yml"));
        await writeFile(docsConfig, "");
        await writeFile(join(fernFolder, RelativeFilePath.of("plants.mdx")), "# Plants");

        const visitedPaths: string[] = [];
        try {
            await visitNavigationAst({
                absolutePathToFernFolder: fernFolder,
                navigation: [
                    { page: "Plants", path: "plants.mdx" },
                    { section: "Garden", contents: [{ page: "Plants again", path: "plants.mdx" }] }
                ],
                visitor: {
                    markdownPage: async ({ absoluteFilepath }) => {
                        visitedPaths.push(absoluteFilepath);
                    }
                },
                nodePath: [],
                absoluteFilepathToConfiguration: docsConfig,
                apiWorkspaces: [],
                context: createMockTaskContext(),
                markdownReader: new MarkdownFileReader()
            });
        } finally {
            await rm(fernFolder, { recursive: true, force: true });
        }

        expect(visitedPaths).toEqual([join(fernFolder, RelativeFilePath.of("plants.mdx"))]);
    });
});
