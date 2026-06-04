import { DynamicSnippetsTestRunner } from "@fern-api/browser-compatible-base-generator";
import { FernIr } from "@fern-api/dynamic-ir-sdk";
import { AbsoluteFilePath, join } from "@fern-api/path-utils";

import { buildDynamicSnippetsGenerator } from "./utils/buildDynamicSnippetsGenerator.js";
import { buildGeneratorConfig } from "./utils/buildGeneratorConfig.js";

describe("snippets (default)", () => {
    const runner = new DynamicSnippetsTestRunner();
    runner.runTests({
        buildGenerator: ({ irFilepath }) =>
            buildDynamicSnippetsGenerator({ irFilepath, config: buildGeneratorConfig() })
    });
});

const DYNAMIC_IR_TEST_DEFINITIONS_DIRECTORY = AbsoluteFilePath.of(
    `${__dirname}/../../../../../packages/cli/generation/ir-generator-tests/src/dynamic-snippets/__test__/test-definitions`
);

/**
 * `exported-client-class-name` is the name customers want surfaced in docs snippets (e.g. a
 * hand-written wrapper around the generated client). It must override `client-class-name` for
 * snippet output only, while falling back to `client-class-name` (and then the default) when unset.
 */
describe("snippets (exported-client-class-name)", () => {
    const createMovieRequest: FernIr.dynamic.EndpointSnippetRequest = {
        endpoint: {
            method: "POST",
            path: "/movies/create-movie"
        },
        baseURL: undefined,
        environment: undefined,
        auth: {
            type: "bearer",
            token: "<YOUR_API_KEY>"
        },
        pathParameters: undefined,
        queryParameters: undefined,
        headers: undefined,
        requestBody: {
            title: "The Matrix",
            rating: 8.2
        }
    };

    test("exported-client-class-name overrides client-class-name in the generated snippet", async () => {
        const generator = buildDynamicSnippetsGenerator({
            irFilepath: AbsoluteFilePath.of(join(DYNAMIC_IR_TEST_DEFINITIONS_DIRECTORY, "imdb.json")),
            config: buildGeneratorConfig({
                customConfig: {
                    "client-class-name": "BaseAcme",
                    "exported-client-class-name": "AcmeClient"
                }
            })
        });

        const response = await generator.generate(createMovieRequest);

        expect(response.errors).toBeUndefined();
        expect(response.snippet).toBeTruthy();
        const snippet = response.snippet ?? "";
        // Docs surfaces must instantiate/build the exported name...
        expect(snippet).toContain("AcmeClient client = AcmeClient");
        // ...and must never leak the internal client-class-name.
        expect(snippet).not.toContain("BaseAcme");
    });

    test("falls back to client-class-name when exported-client-class-name is unset", async () => {
        const generator = buildDynamicSnippetsGenerator({
            irFilepath: AbsoluteFilePath.of(join(DYNAMIC_IR_TEST_DEFINITIONS_DIRECTORY, "imdb.json")),
            config: buildGeneratorConfig({
                customConfig: {
                    "client-class-name": "BaseAcme"
                }
            })
        });

        const response = await generator.generate(createMovieRequest);

        expect(response.errors).toBeUndefined();
        expect(response.snippet).toBeTruthy();
        const snippet = response.snippet ?? "";
        expect(snippet).toContain("BaseAcme client = BaseAcme");
    });
});
