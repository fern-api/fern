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

describe("parseDocsConfiguration — ai-search.mask-pii", () => {
    it("is undefined (masking off) when the ai-search key is omitted", async () => {
        const parsed = await parseRawDocsYml({ instances: [], navigation: [] });
        expect(parsed.aiChatConfig?.maskPii).toBeUndefined();
    });

    it("is undefined (masking off) when mask-pii is omitted", async () => {
        const parsed = await parseRawDocsYml({
            instances: [],
            navigation: [],
            "ai-search": {}
        });
        expect(parsed.aiChatConfig?.maskPii).toBeUndefined();
    });

    it("maps the kebab-case mask-pii key to the camelCase maskPii field", async () => {
        const enabled = await parseRawDocsYml({
            instances: [],
            navigation: [],
            "ai-search": { "mask-pii": true }
        });
        expect(enabled.aiChatConfig?.maskPii).toBe(true);

        const disabled = await parseRawDocsYml({
            instances: [],
            navigation: [],
            "ai-search": { "mask-pii": false }
        });
        expect(disabled.aiChatConfig?.maskPii).toBe(false);
    });

    it("also honors mask-pii under the deprecated ai-chat key", async () => {
        const parsed = await parseRawDocsYml({
            instances: [],
            navigation: [],
            "ai-chat": { "mask-pii": true }
        });
        expect(parsed.aiChatConfig?.maskPii).toBe(true);
    });
});
