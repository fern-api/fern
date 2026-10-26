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

describe("parseDocsConfiguration — settings.require-analytics-consent", () => {
    it("defaults to false when settings are present but the key is omitted", async () => {
        const parsed = await parseRawDocsYml({
            instances: [],
            navigation: [],
            settings: { "disable-analytics": false }
        });
        expect(parsed.settings?.requireAnalyticsConsent).toBe(false);
    });

    it("passes require-analytics-consent through as requireAnalyticsConsent", async () => {
        const parsed = await parseRawDocsYml({
            instances: [],
            navigation: [],
            settings: { "require-analytics-consent": true }
        });
        expect(parsed.settings?.requireAnalyticsConsent).toBe(true);
    });

    it("rejects a non-boolean value", () => {
        expect(() =>
            docsYml.RawSchemas.Serializer.DocsConfiguration.parseOrThrow({
                instances: [],
                navigation: [],
                settings: { "require-analytics-consent": "yes" }
            })
        ).toThrow();
    });

    it("is preserved by the docs.yml zod schema", () => {
        const result = docsYml.DocsYmlSchemas.DocsSettingsConfig.parse({ "require-analytics-consent": true });
        expect(result["require-analytics-consent"]).toBe(true);
    });
});
