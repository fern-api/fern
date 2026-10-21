import { docsYml } from "@fern-api/configuration";
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { createMockTaskContext } from "@fern-api/task-context";
import { describe, expect, it } from "vitest";

import { parseDocsConfiguration } from "../parseDocsConfiguration.js";

const FAKE_FERN_DIR = "/fern" as AbsoluteFilePath;
const FAKE_CONFIG_PATH = "/fern/docs.yml" as AbsoluteFilePath;

async function parsePrioritizeCurrentProduct(rawDocsYml: unknown): Promise<boolean | undefined> {
    const rawDocsConfiguration = docsYml.RawSchemas.Serializer.DocsConfiguration.parseOrThrow(rawDocsYml);
    const parsed = await parseDocsConfiguration({
        rawDocsConfiguration,
        absolutePathToFernFolder: FAKE_FERN_DIR,
        absoluteFilepathToDocsConfig: FAKE_CONFIG_PATH,
        context: createMockTaskContext()
    });
    return parsed.settings?.search?.prioritizeCurrentProduct;
}

describe("parseDocsConfiguration — settings.search.prioritize-current-product", () => {
    it("is left undefined when unset so the renderer default applies", async () => {
        expect(await parsePrioritizeCurrentProduct({ instances: [], navigation: [] })).toBeUndefined();
        expect(
            await parsePrioritizeCurrentProduct({ instances: [], navigation: [], settings: { search: {} } })
        ).toBeUndefined();
    });

    it("passes an explicit value through", async () => {
        const settings = (value: boolean) => ({
            instances: [],
            navigation: [],
            settings: { search: { "prioritize-current-product": value } }
        });
        expect(await parsePrioritizeCurrentProduct(settings(true))).toBe(true);
        expect(await parsePrioritizeCurrentProduct(settings(false))).toBe(false);
    });
});
