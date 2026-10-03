import { docsYml } from "@fern-api/configuration";
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { createMockTaskContext } from "@fern-api/task-context";
import { describe, expect, it } from "vitest";

import { parseDocsConfiguration } from "../parseDocsConfiguration.js";

const FAKE_FERN_DIR = "/fern" as AbsoluteFilePath;
const FAKE_CONFIG_PATH = "/fern/docs.yml" as AbsoluteFilePath;

// The published FDR SDK's DocsLayoutConfig does not carry this field yet
// (parseDocsConfiguration casts it through), so read it structurally here.
type LayoutWithHideCodeblockFeedback = { hideCodeblockFeedback?: boolean } | undefined;

async function parseLayout(rawDocsYml: unknown): Promise<LayoutWithHideCodeblockFeedback> {
    const rawDocsConfiguration = docsYml.RawSchemas.Serializer.DocsConfiguration.parseOrThrow(rawDocsYml);
    const parsed = await parseDocsConfiguration({
        rawDocsConfiguration,
        absolutePathToFernFolder: FAKE_FERN_DIR,
        absoluteFilepathToDocsConfig: FAKE_CONFIG_PATH,
        context: createMockTaskContext()
    });
    return parsed.layout as LayoutWithHideCodeblockFeedback;
}

describe("parseDocsConfiguration — layout.hide-codeblock-feedback", () => {
    it("is undefined when the layout key is omitted", async () => {
        const layout = await parseLayout({ instances: [], navigation: [] });
        expect(layout?.hideCodeblockFeedback).toBeUndefined();
    });

    it("is undefined when hide-codeblock-feedback is omitted from layout", async () => {
        const layout = await parseLayout({ instances: [], navigation: [], layout: {} });
        expect(layout?.hideCodeblockFeedback).toBeUndefined();
    });

    it("maps the kebab-case key to the camelCase hideCodeblockFeedback field", async () => {
        const enabled = await parseLayout({
            instances: [],
            navigation: [],
            layout: { "hide-codeblock-feedback": true }
        });
        expect(enabled?.hideCodeblockFeedback).toBe(true);

        const disabled = await parseLayout({
            instances: [],
            navigation: [],
            layout: { "hide-codeblock-feedback": false }
        });
        expect(disabled?.hideCodeblockFeedback).toBe(false);
    });
});
