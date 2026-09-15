import { FernIr } from "@fern-api/dynamic-ir-sdk";
import { AbsoluteFilePath, join } from "@fern-api/path-utils";

import { buildDynamicSnippetsGenerator } from "./utils/buildDynamicSnippetsGenerator.js";
import { buildGeneratorConfig } from "./utils/buildGeneratorConfig.js";

const DYNAMIC_IR_TEST_DEFINITIONS_DIRECTORY = AbsoluteFilePath.of(
    `${__dirname}/../../../../../packages/cli/generation/ir-generator-tests/src/dynamic-snippets/__test__/test-definitions`
);
const IR_FILEPATH = AbsoluteFilePath.of(join(DYNAMIC_IR_TEST_DEFINITIONS_DIRECTORY, "exhaustive.json"));

const REQUEST: FernIr.dynamic.EndpointSnippetRequest = {
    endpoint: {
        method: "POST",
        path: "/params/body-and-query"
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
        string: "value"
    }
};

describe("flattenRequestParameters", () => {
    it("flattens referenced object request bodies when enabled", async () => {
        const generator = buildDynamicSnippetsGenerator({
            irFilepath: IR_FILEPATH,
            config: buildGeneratorConfig({
                customConfig: {
                    flattenRequestParameters: true
                }
            })
        });

        const response = await generator.generate(REQUEST);

        expect(response.snippet).toContain('string: "value"');
        expect(response.snippet).not.toContain("body:");
    });

    it("preserves the body property by default", async () => {
        const generator = buildDynamicSnippetsGenerator({
            irFilepath: IR_FILEPATH,
            config: buildGeneratorConfig({})
        });

        const response = await generator.generate(REQUEST);

        expect(response.snippet).toContain("body: {");
    });

    it("preserves the body property for a non-object referenced body", async () => {
        const generator = buildDynamicSnippetsGenerator({
            irFilepath: IR_FILEPATH,
            config: buildGeneratorConfig({
                customConfig: {
                    flattenRequestParameters: true
                }
            })
        });

        const response = await generator.generate({
            ...REQUEST,
            endpoint: {
                method: "POST",
                path: "/test-headers/custom-header"
            },
            headers: {
                "X-TEST-SERVICE-HEADER": "service",
                "X-TEST-ENDPOINT-HEADER": "endpoint"
            },
            requestBody: "value"
        });

        expect(response.snippet).toContain("body:");
    });
});
