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

describe("parseDocsConfiguration — ai-search.disclaimer", () => {
    it("is undefined when the ai-search key is omitted", async () => {
        const parsed = await parseRawDocsYml({ instances: [], navigation: [] });
        expect(parsed.aiChatConfig?.disclaimer).toBeUndefined();
    });

    it("is undefined when disclaimer is omitted", async () => {
        const parsed = await parseRawDocsYml({
            instances: [],
            navigation: [],
            "ai-search": {}
        });
        expect(parsed.aiChatConfig?.disclaimer).toBeUndefined();
    });

    it("passes the disclaimer string through to aiChatConfig", async () => {
        const parsed = await parseRawDocsYml({
            instances: [],
            navigation: [],
            "ai-search": { disclaimer: "Responses are generated using third-party AI and may contain mistakes." }
        });
        expect(parsed.aiChatConfig?.disclaimer).toBe(
            "Responses are generated using third-party AI and may contain mistakes."
        );
    });

    it("also honors disclaimer under the deprecated ai-chat key", async () => {
        const parsed = await parseRawDocsYml({
            instances: [],
            navigation: [],
            "ai-chat": { disclaimer: "Custom disclaimer" }
        });
        expect(parsed.aiChatConfig?.disclaimer).toBe("Custom disclaimer");
    });
});
