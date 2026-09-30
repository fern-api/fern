import { docsYml } from "@fern-api/configuration";
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { createLogger, LogLevel } from "@fern-api/logger";
import { createMockTaskContext } from "@fern-api/task-context";
import { mkdirSync, mkdtempSync } from "fs";
import { tmpdir } from "os";
import path from "path";
import { describe, expect, it } from "vitest";

import { parseDocsConfiguration } from "../parseDocsConfiguration.js";

async function parseWithWarnings(rawDocsYml: unknown): Promise<{
    parsed: docsYml.ParsedDocsConfiguration;
    warnings: string[];
}> {
    const warnings: string[] = [];
    const logger = createLogger((level, ...parts) => {
        if (level === LogLevel.Warn) {
            warnings.push(parts.join(" "));
        }
    });
    const fernDir = mkdtempSync(path.join(tmpdir(), "fern-ai-search-datasources-")) as AbsoluteFilePath;
    mkdirSync(path.join(fernDir, "translations", "ja-JP"), { recursive: true });
    const parsed = await parseDocsConfiguration({
        rawDocsConfiguration: docsYml.RawSchemas.Serializer.DocsConfiguration.parseOrThrow(rawDocsYml),
        absolutePathToFernFolder: fernDir,
        absoluteFilepathToDocsConfig: path.join(fernDir, "docs.yml") as AbsoluteFilePath,
        context: createMockTaskContext({ logger })
    });
    return { parsed, warnings };
}

describe("parseDocsConfiguration — ai-search.datasources", () => {
    it("passes url, title, and locale through to aiChatConfig", async () => {
        const { parsed, warnings } = await parseWithWarnings({
            instances: [],
            navigation: [],
            translations: [{ lang: "en", default: true }, { lang: "ja-JP" }],
            "ai-search": {
                datasources: [
                    { url: "https://help.example.com", title: "Help Center" },
                    { url: "https://help.example.com/ja-jp", title: "ヘルプ", locale: "ja" }
                ]
            }
        });
        expect(parsed.aiChatConfig?.datasources).toEqual([
            { url: "https://help.example.com", title: "Help Center" },
            { url: "https://help.example.com/ja-jp", title: "ヘルプ", locale: "ja" }
        ]);
        expect(warnings).toHaveLength(0);
    });

    it("warns when a datasource locale does not match any site locale", async () => {
        const { warnings } = await parseWithWarnings({
            instances: [],
            navigation: [],
            translations: [{ lang: "en", default: true }, { lang: "ja-JP" }],
            "ai-search": {
                datasources: [
                    { url: "https://help.example.com/ja-jp", locale: "ja" },
                    { url: "https://help.example.com/nl", locale: "nl" }
                ]
            }
        });
        expect(warnings).toHaveLength(1);
        expect(warnings[0]).toContain("ai-search.datasources: locale 'nl'");
        expect(warnings[0]).toContain("https://help.example.com/nl");
    });
});
