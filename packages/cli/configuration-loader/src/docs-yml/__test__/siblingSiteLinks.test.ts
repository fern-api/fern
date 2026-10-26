import { docsYml } from "@fern-api/configuration";
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { createMockTaskContext } from "@fern-api/task-context";
import { describe, expect, it } from "vitest";

import { parseDocsConfiguration } from "../parseDocsConfiguration.js";

async function parseSettings(settings: Record<string, unknown>): Promise<docsYml.ParsedDocsConfiguration["settings"]> {
    const rawDocsConfiguration = docsYml.RawSchemas.Serializer.DocsConfiguration.parseOrThrow({
        instances: [],
        navigation: [],
        settings
    });
    const parsed = await parseDocsConfiguration({
        rawDocsConfiguration,
        absolutePathToFernFolder: "/fern" as AbsoluteFilePath,
        absoluteFilepathToDocsConfig: "/fern/docs.yml" as AbsoluteFilePath,
        context: createMockTaskContext()
    });
    return parsed.settings;
}

describe("parseDocsConfiguration — settings.sibling-site-links", () => {
    it("defaults to false", async () => {
        expect((await parseSettings({ "disable-analytics": false }))?.siblingSiteLinks).toBe(false);
    });

    it("passes sibling-site-links through as siblingSiteLinks", async () => {
        expect((await parseSettings({ "sibling-site-links": true }))?.siblingSiteLinks).toBe(true);
    });
});
