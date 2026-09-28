import { docsYml } from "@fern-api/configuration";
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { createLogger, LogLevel } from "@fern-api/logger";
import { createMockTaskContext } from "@fern-api/task-context";
import { mkdirSync, mkdtempSync } from "fs";
import { tmpdir } from "os";
import path from "path";
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

    it("accepts object entries with a url and optional locale", async () => {
        const parsed = await parseRawDocsYml({
            instances: [],
            navigation: [],
            experimental: {
                "external-sitemaps": [
                    "https://blog.example.com/sitemap.xml",
                    { url: "https://help.example.com/nl/sitemap.xml", locale: "nl" },
                    { url: "https://help.example.com/sitemap.xml" }
                ]
            }
        });
        expect(parsed.experimental?.externalSitemaps).toEqual([
            "https://blog.example.com/sitemap.xml",
            { url: "https://help.example.com/nl/sitemap.xml", locale: "nl" },
            { url: "https://help.example.com/sitemap.xml" }
        ]);
    });

    it("warns when an explicit locale does not match any site locale", async () => {
        const warnings: string[] = [];
        const logger = createLogger((level, ...parts) => {
            if (level === LogLevel.Warn) {
                warnings.push(parts.join(" "));
            }
        });
        const rawDocsConfiguration = docsYml.RawSchemas.Serializer.DocsConfiguration.parseOrThrow({
            instances: [],
            navigation: [],
            translations: [{ lang: "en", default: true }, { lang: "ja-JP" }],
            experimental: {
                "external-sitemaps": [
                    { url: "https://help.example.com/sitemap.xml", locale: "ja" },
                    { url: "https://help.example.com/nl/sitemap.xml", locale: "nl" }
                ]
            }
        });
        const fernDir = mkdtempSync(path.join(tmpdir(), "fern-external-sitemaps-")) as AbsoluteFilePath;
        mkdirSync(path.join(fernDir, "translations", "ja-JP"), { recursive: true });
        await parseDocsConfiguration({
            rawDocsConfiguration,
            absolutePathToFernFolder: fernDir,
            absoluteFilepathToDocsConfig: path.join(fernDir, "docs.yml") as AbsoluteFilePath,
            context: createMockTaskContext({ logger })
        });
        expect(warnings).toHaveLength(1);
        expect(warnings[0]).toContain("locale 'nl'");
        expect(warnings[0]).toContain("https://help.example.com/nl/sitemap.xml");
    });
});
