import { DynamicSnippetsTestRunner, Style } from "@fern-api/browser-compatible-base-generator";
import { FernIr } from "@fern-api/dynamic-ir-sdk";
import { AbsoluteFilePath, join } from "@fern-api/path-utils";
import { readFileSync } from "fs";

import { DynamicSnippetsGenerator } from "../DynamicSnippetsGenerator.js";
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

describe("snippets (endpoint with examples)", () => {
    test("generates snippet for EndpointSnippetRequest when endpoint has examples", async () => {
        const irFilepath = AbsoluteFilePath.of(join(DYNAMIC_IR_TEST_DEFINITIONS_DIRECTORY, "imdb.json"));
        const ir: FernIr.dynamic.DynamicIntermediateRepresentation = JSON.parse(readFileSync(irFilepath, "utf-8"));

        // Inject examples onto the POST /movies/create-movie endpoint so the guard is exercised.
        for (const endpoint of Object.values(ir.endpoints)) {
            if (endpoint.location.path === "/movies/create-movie" && endpoint.location.method === "POST") {
                endpoint.examples = [
                    {
                        id: "example-1",
                        name: undefined,
                        endpoint: endpoint.location,
                        baseURL: undefined,
                        environment: undefined,
                        auth: {
                            type: "bearer",
                            token: "<token>"
                        },
                        pathParameters: undefined,
                        queryParameters: undefined,
                        headers: undefined,
                        requestBody: {
                            title: "Example Movie",
                            rating: 7.5
                        }
                    }
                ];
            }
        }

        const generator = new DynamicSnippetsGenerator({
            ir,
            config: buildGeneratorConfig(),
            options: { style: Style.Concise }
        });

        // Call generate with a plain EndpointSnippetRequest (no id).
        // Before the fix, this threw "Endpoint does not have an example that matches the snippet".
        const response = await generator.generate({
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
        });

        expect(response.errors).toBeUndefined();
        expect(response.snippet).toBeTruthy();
        expect(response.snippet).toMatchSnapshot();
    });
});

describe("snippets (use-undiscriminated-unions)", () => {
    const generator = buildDynamicSnippetsGenerator({
        irFilepath: AbsoluteFilePath.of(join(DYNAMIC_IR_TEST_DEFINITIONS_DIRECTORY, "exhaustive.json")),
        config: buildGeneratorConfig({
            customConfig: {
                "use-undiscriminated-unions": true
            }
        })
    });

    test("POST /container/map-prim-to-union (numeric values)", async () => {
        const response = await generator.generate({
            endpoint: {
                method: "POST",
                path: "/container/map-prim-to-union"
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
                test: 0,
                test2: 1.5,
                test3: 42
            }
        });
        expect(response.errors).toBeUndefined();
        expect(response.snippet).toMatchSnapshot();
    });

    test("POST /container/map-prim-to-union (mixed values)", async () => {
        const response = await generator.generate({
            endpoint: {
                method: "POST",
                path: "/container/map-prim-to-union"
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
                test: 0,
                test2: true,
                test3: "Test",
                test4: ["1", "1", "1", "1"]
            }
        });
        // Mixed types produce errors because the first matching type is tried
        // The key difference from the default config is the type reference:
        // MixedType instead of OneOf<double, bool, string, IEnumerable<string>>
        expect(response.snippet).toMatchSnapshot();
    });
});
