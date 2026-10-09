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
        context: createMockTaskContext(),
        // Validation (fern check) passes buildRefVersions: false; the mutual-exclusion
        // check must still fire so a bad config is caught without materializing refs.
        buildRefVersions: false
    });
}

describe("parseDocsConfiguration — ref/path mutual exclusion", () => {
    it("rejects a version that declares both 'ref' and 'path'", async () => {
        await expect(
            parseRawDocsYml({
                instances: [],
                versions: [{ "display-name": "2.0", ref: "release/2.0", path: "./versions/v2.yml" }]
            })
        ).rejects.toThrow("declares both 'ref' and 'path'");
    });

    it("allows a ref-only version", async () => {
        // buildRefVersions: false skips materialization, so this parses without touching git.
        await expect(
            parseRawDocsYml({
                instances: [],
                versions: [{ "display-name": "2.0", ref: "release/2.0" }]
            })
        ).resolves.toBeDefined();
    });
});
