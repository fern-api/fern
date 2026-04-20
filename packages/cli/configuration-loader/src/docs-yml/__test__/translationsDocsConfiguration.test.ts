import { docsYml } from "@fern-api/configuration";
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { createMockTaskContext } from "@fern-api/task-context";
import { describe, expect, it } from "vitest";

import { parseDocsConfiguration } from "../parseDocsConfiguration.js";

function makeMinimalRawConfig(
    overrides: Partial<docsYml.RawSchemas.DocsConfiguration> = {}
): docsYml.RawSchemas.DocsConfiguration {
    return {
        instances: [],
        // navigation is required by parseDocsConfiguration
        navigation: [],
        ...overrides
    } as unknown as docsYml.RawSchemas.DocsConfiguration;
}

const FAKE_FERN_DIR = "/fern" as AbsoluteFilePath;
const FAKE_CONFIG_PATH = "/fern/docs.yml" as AbsoluteFilePath;

describe("parseDocsConfiguration — translations", () => {
    it("should produce undefined translations when not specified", async () => {
        const parsed = await parseDocsConfiguration({
            rawDocsConfiguration: makeMinimalRawConfig(),
            absolutePathToFernFolder: FAKE_FERN_DIR,
            absoluteFilepathToDocsConfig: FAKE_CONFIG_PATH,
            context: createMockTaskContext()
        });

        expect(parsed.translations).toBeUndefined();
    });

    it("should pass through a single default translation", async () => {
        const parsed = await parseDocsConfiguration({
            rawDocsConfiguration: makeMinimalRawConfig({
                translations: [{ lang: "en", default: true }]
            }),
            absolutePathToFernFolder: FAKE_FERN_DIR,
            absoluteFilepathToDocsConfig: FAKE_CONFIG_PATH,
            context: createMockTaskContext()
        });

        expect(parsed.translations).toHaveLength(1);
        expect(parsed.translations?.[0]?.lang).toBe("en");
        expect(parsed.translations?.[0]?.default).toBe(true);
    });

    it("should pass through multiple translations", async () => {
        const parsed = await parseDocsConfiguration({
            rawDocsConfiguration: makeMinimalRawConfig({
                translations: [{ lang: "en", default: true }, { lang: "ja" }, { lang: "fr" }]
            }),
            absolutePathToFernFolder: FAKE_FERN_DIR,
            absoluteFilepathToDocsConfig: FAKE_CONFIG_PATH,
            context: createMockTaskContext()
        });

        expect(parsed.translations).toHaveLength(3);
        expect(parsed.translations?.[0]?.lang).toBe("en");
        expect(parsed.translations?.[1]?.lang).toBe("ja");
        expect(parsed.translations?.[1]?.default).toBeUndefined();
        expect(parsed.translations?.[2]?.lang).toBe("fr");
    });

    it("should pass through translations alongside languages", async () => {
        const parsed = await parseDocsConfiguration({
            rawDocsConfiguration: makeMinimalRawConfig({
                languages: ["en", "fr"],
                translations: [{ lang: "en", default: true }, { lang: "fr" }]
            }),
            absolutePathToFernFolder: FAKE_FERN_DIR,
            absoluteFilepathToDocsConfig: FAKE_CONFIG_PATH,
            context: createMockTaskContext()
        });

        expect(parsed.languages).toEqual(["en", "fr"]);
        expect(parsed.translations).toHaveLength(2);
    });
});
