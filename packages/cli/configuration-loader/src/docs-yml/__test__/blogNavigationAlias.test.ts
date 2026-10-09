import { docsYml } from "@fern-api/configuration";
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { createMockTaskContext } from "@fern-api/task-context";
import { describe, expect, it } from "vitest";

import { parseDocsConfiguration } from "../parseDocsConfiguration.js";

const FAKE_FERN_DIR = "/fern" as AbsoluteFilePath;
const FAKE_CONFIG_PATH = "/fern/docs.yml" as AbsoluteFilePath;

async function parseRawDocsYml(rawDocsYml: unknown): Promise<docsYml.ParsedDocsConfiguration> {
    const rawDocsConfiguration = docsYml.RawSchemas.Serializer.DocsConfiguration.parseOrThrow(rawDocsYml);
    return await parseDocsConfiguration({
        rawDocsConfiguration,
        absolutePathToFernFolder: FAKE_FERN_DIR,
        absoluteFilepathToDocsConfig: FAKE_CONFIG_PATH,
        context: createMockTaskContext()
    });
}

describe("blog navigation alias", () => {
    it("normalizes a top-level blog item to a changelog item", async () => {
        const changelog = await parseRawDocsYml({
            instances: [],
            navigation: [{ changelog: "blog" }]
        });
        const blog = await parseRawDocsYml({
            instances: [],
            navigation: [{ blog: "blog" }]
        });
        if (changelog.navigation.type !== "untabbed" || blog.navigation.type !== "untabbed") {
            throw new Error("Expected untabbed navigation");
        }

        expect(changelog.navigation).toEqual({
            type: "untabbed",
            items: [
                {
                    type: "changelog",
                    changelog: [],
                    hidden: false,
                    icon: undefined,
                    title: "Changelog",
                    slug: undefined,
                    viewers: undefined,
                    orphaned: undefined,
                    featureFlags: undefined
                }
            ]
        });
        expect(blog.navigation).toEqual({
            ...changelog.navigation,
            items: [{ ...changelog.navigation.items[0], title: "Blog" }]
        });
    });

    it("normalizes a tab blog item to a changelog child", async () => {
        const changelog = await parseRawDocsYml({
            instances: [],
            tabs: {
                posts: {
                    "display-name": "Posts",
                    changelog: "blog"
                }
            },
            navigation: [{ tab: "posts" }]
        });
        const blog = await parseRawDocsYml({
            instances: [],
            tabs: {
                posts: {
                    "display-name": "Posts",
                    blog: "blog"
                }
            },
            navigation: [{ tab: "posts" }]
        });

        expect(changelog.navigation).toEqual({
            type: "tabbed",
            items: [
                {
                    title: "Posts",
                    icon: undefined,
                    slug: undefined,
                    skipUrlSlug: undefined,
                    hidden: undefined,
                    child: {
                        type: "changelog",
                        changelog: []
                    },
                    viewers: undefined,
                    orphaned: undefined,
                    featureFlags: undefined
                }
            ]
        });
        expect(blog.navigation).toEqual(changelog.navigation);
    });

    it("preserves an explicit blog title", async () => {
        const parsed = await parseRawDocsYml({
            instances: [],
            navigation: [{ blog: "blog", title: "Engineering Blog" }]
        });

        if (parsed.navigation.type !== "untabbed") {
            throw new Error("Expected untabbed navigation");
        }
        expect(parsed.navigation.items[0]).toMatchObject({
            type: "changelog",
            title: "Engineering Blog"
        });
    });
});
