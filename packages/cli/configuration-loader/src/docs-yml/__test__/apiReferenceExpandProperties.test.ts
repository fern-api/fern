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

describe("parseDocsConfiguration — layout.api-reference-expand-properties", () => {
    it("is undefined when the layout key is omitted", async () => {
        const parsed = await parseRawDocsYml({ instances: [], navigation: [] });
        expect(parsed.layout?.apiReferenceExpandProperties).toBeUndefined();
    });

    it("is undefined when api-reference-expand-properties is omitted from layout", async () => {
        const parsed = await parseRawDocsYml({ instances: [], navigation: [], layout: {} });
        expect(parsed.layout?.apiReferenceExpandProperties).toBeUndefined();
    });

    it("maps the kebab-case key to the camelCase apiReferenceExpandProperties field", async () => {
        const enabled = await parseRawDocsYml({
            instances: [],
            navigation: [],
            layout: { "api-reference-expand-properties": true }
        });
        expect(enabled.layout?.apiReferenceExpandProperties).toBe(true);

        const disabled = await parseRawDocsYml({
            instances: [],
            navigation: [],
            layout: { "api-reference-expand-properties": false }
        });
        expect(disabled.layout?.apiReferenceExpandProperties).toBe(false);
    });
});
