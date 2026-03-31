import { DynamicSnippetsTestRunner } from "@fern-api/browser-compatible-base-generator";
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
