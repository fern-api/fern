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

describe("parseDocsConfiguration — ai-search.button-text", () => {
    it("is undefined when button-text is omitted", async () => {
        const parsed = await parseRawDocsYml({ instances: [], navigation: [], "ai-search": {} });
        expect(parsed.aiChatConfig?.buttonText).toBeUndefined();
    });

    it("passes button-text through to aiChatConfig", async () => {
        const parsed = await parseRawDocsYml({
            instances: [],
            navigation: [],
            "ai-search": { "button-text": "Ask Fernie" }
        });
        expect(parsed.aiChatConfig?.buttonText).toBe("Ask Fernie");
    });

    it("also honors button-text under the deprecated ai-chat key", async () => {
        const parsed = await parseRawDocsYml({
            instances: [],
            navigation: [],
            "ai-chat": { "button-text": "Ask Fernie" }
        });
        expect(parsed.aiChatConfig?.buttonText).toBe("Ask Fernie");
    });
});
