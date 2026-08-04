import { docsYml } from "@fern-api/configuration";
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { createMockTaskContext } from "@fern-api/task-context";
import { describe, expect, it } from "vitest";

import { parseDocsConfiguration } from "../parseDocsConfiguration.js";

const FAKE_FERN_DIR = "/fern" as AbsoluteFilePath;
const FAKE_CONFIG_PATH = "/fern/docs.yml" as AbsoluteFilePath;

async function parseRawDocsYml(rawDocsYml: unknown): Promise<docsYml.ParsedDocsConfiguration> {
    // mirrors loadDocsWorkspace: kebab-case docs.yml keys -> camelCase raw config
    const rawDocsConfiguration = docsYml.RawSchemas.Serializer.DocsConfiguration.parseOrThrow(rawDocsYml);
    return await parseDocsConfiguration({
        rawDocsConfiguration,
        absolutePathToFernFolder: FAKE_FERN_DIR,
        absoluteFilepathToDocsConfig: FAKE_CONFIG_PATH,
        context: createMockTaskContext()
    });
}

describe("parseDocsConfiguration — experimental.external-sitemaps", () => {
    it("is undefined when the experimental key is omitted", async () => {
        const parsed = await parseRawDocsYml({ instances: [], navigation: [] });
        expect(parsed.experimental?.externalSitemaps).toBeUndefined();
    });

    it("maps the kebab-case external-sitemaps key to the camelCase externalSitemaps field", async () => {
        const parsed = await parseRawDocsYml({
            instances: [],
            navigation: [],
            experimental: {
                "external-sitemaps": ["https://blog.example.com/sitemap.xml", "https://help.example.com/sitemap.xml"]
            }
        });
        expect(parsed.experimental?.externalSitemaps).toEqual([
            "https://blog.example.com/sitemap.xml",
            "https://help.example.com/sitemap.xml"
        ]);
    });
});
