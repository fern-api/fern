import { docsYml } from "@fern-api/configuration";
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { createMockTaskContext } from "@fern-api/task-context";
import { describe, expect, it } from "vitest";

import { parseDocsConfiguration } from "../parseDocsConfiguration.js";

function makeMinimalRawConfig(
    overrides: Partial<docsYml.RawSchemas.DocsConfiguration> = {}
): docsYml.RawSchemas.DocsConfiguration {
    return {
        instances: [],
        navigation: [],
        ...overrides
    } as unknown as docsYml.RawSchemas.DocsConfiguration;
}

const FAKE_FERN_DIR = "/fern" as AbsoluteFilePath;
const FAKE_CONFIG_PATH = "/fern/docs.yml" as AbsoluteFilePath;

describe("parseDocsConfiguration — libraries config", () => {
    it("parses git input libraries", async () => {
        const parsed = await parseDocsConfiguration({
            rawDocsConfiguration: makeMinimalRawConfig({
                libraries: {
                    "my-sdk": {
                        input: { git: "https://github.com/acme/sdk-python", subpath: "packages/sdk" },
                        output: { path: "./static/sdk-docs" },
                        lang: "python"
                    }
                }
            }),
            absolutePathToFernFolder: FAKE_FERN_DIR,
            absoluteFilepathToDocsConfig: FAKE_CONFIG_PATH,
            context: createMockTaskContext()
        });

        expect(parsed.libraries?.["my-sdk"]).toEqual({
            input: { type: "git", git: "https://github.com/acme/sdk-python", subpath: "packages/sdk" },
            output: { path: "./static/sdk-docs" },
            lang: "python"
        });
    });

    it("parses path input libraries instead of throwing", async () => {
        const parsed = await parseDocsConfiguration({
            rawDocsConfiguration: makeMinimalRawConfig({
                libraries: {
                    "local-sdk": {
                        input: { path: "./local-sdk" },
                        output: { path: "./static/local-sdk-docs" },
                        lang: "python"
                    },
                    "git-sdk": {
                        input: { git: "https://github.com/acme/sdk-python" },
                        output: { path: "./static/sdk-docs" },
                        lang: "python"
                    }
                }
            }),
            absolutePathToFernFolder: FAKE_FERN_DIR,
            absoluteFilepathToDocsConfig: FAKE_CONFIG_PATH,
            context: createMockTaskContext()
        });

        // both input types are preserved so the renderer can resolve output.path for each
        expect(parsed.libraries?.["local-sdk"]).toEqual({
            input: { type: "path", path: "./local-sdk" },
            output: { path: "./static/local-sdk-docs" },
            lang: "python"
        });
        expect(parsed.libraries?.["git-sdk"]).toEqual({
            input: { type: "git", git: "https://github.com/acme/sdk-python", subpath: undefined },
            output: { path: "./static/sdk-docs" },
            lang: "python"
        });
    });
});
