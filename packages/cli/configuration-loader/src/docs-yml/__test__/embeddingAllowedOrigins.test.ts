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

describe("parseDocsConfiguration — settings.embedding.allowed-origins", () => {
    it("is undefined when the embedding key is omitted", async () => {
        const parsed = await parseRawDocsYml({ instances: [], navigation: [] });
        expect(parsed.settings?.embedding).toBeUndefined();
    });

    it("passes allowed-origins through as allowedOrigins", async () => {
        const parsed = await parseRawDocsYml({
            instances: [],
            navigation: [],
            settings: { embedding: { "allowed-origins": ["https://app.fernwood.example", "https://*.moss.example"] } }
        });
        expect(parsed.settings?.embedding).toEqual({
            allowedOrigins: ["https://app.fernwood.example", "https://*.moss.example"]
        });
    });

    it("fails parsing when an allowed origin could inject into the CSP directive", async () => {
        await expect(
            parseRawDocsYml({
                instances: [],
                navigation: [],
                settings: {
                    embedding: {
                        "allowed-origins": ["https://app.fernwood.example; script-src 'unsafe-inline'"]
                    }
                }
            })
        ).rejects.toThrow();
    });

    it("rejects an embedding block without allowed-origins", () => {
        expect(() =>
            docsYml.RawSchemas.Serializer.DocsConfiguration.parseOrThrow({
                instances: [],
                navigation: [],
                settings: { embedding: {} }
            })
        ).toThrow();
    });
});
