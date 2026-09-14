import { docsYml } from "@fern-api/configuration";
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { createMockTaskContext } from "@fern-api/task-context";
import { describe, expect, it } from "vitest";

import { parseDocsConfiguration } from "../parseDocsConfiguration.js";

const FAKE_FERN_DIR = "/fern" as AbsoluteFilePath;
const FAKE_CONFIG_PATH = "/fern/docs.yml" as AbsoluteFilePath;

// The published FDR SDK's DocsLayoutConfig does not carry this field yet
// (parseDocsConfiguration casts it through), so read it structurally here.
type LayoutWithExpandProperties = { apiReferenceExpandProperties?: boolean } | undefined;

async function parseLayout(rawDocsYml: unknown): Promise<LayoutWithExpandProperties> {
    const rawDocsConfiguration = docsYml.RawSchemas.Serializer.DocsConfiguration.parseOrThrow(rawDocsYml);
    const parsed = await parseDocsConfiguration({
        rawDocsConfiguration,
        absolutePathToFernFolder: FAKE_FERN_DIR,
        absoluteFilepathToDocsConfig: FAKE_CONFIG_PATH,
        context: createMockTaskContext()
    });
    return parsed.layout as LayoutWithExpandProperties;
}

describe("parseDocsConfiguration — layout.api-reference-expand-properties", () => {
    it("is undefined when the layout key is omitted", async () => {
        const layout = await parseLayout({ instances: [], navigation: [] });
        expect(layout?.apiReferenceExpandProperties).toBeUndefined();
    });

    it("is undefined when api-reference-expand-properties is omitted from layout", async () => {
        const layout = await parseLayout({ instances: [], navigation: [], layout: {} });
        expect(layout?.apiReferenceExpandProperties).toBeUndefined();
    });

    it("maps the kebab-case key to the camelCase apiReferenceExpandProperties field", async () => {
        const enabled = await parseLayout({
            instances: [],
            navigation: [],
            layout: { "api-reference-expand-properties": true }
        });
        expect(enabled?.apiReferenceExpandProperties).toBe(true);

        const disabled = await parseLayout({
            instances: [],
            navigation: [],
            layout: { "api-reference-expand-properties": false }
        });
        expect(disabled?.apiReferenceExpandProperties).toBe(false);
    });
});
