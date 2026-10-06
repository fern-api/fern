import { FernIr } from "@fern-api/dynamic-ir-sdk";
import { AbsoluteFilePath, join } from "@fern-api/path-utils";

import { buildDynamicSnippetsGenerator } from "./utils/buildDynamicSnippetsGenerator.js";
import { buildGeneratorConfig } from "./utils/buildGeneratorConfig.js";

const DYNAMIC_IR_TEST_DEFINITIONS_DIRECTORY = AbsoluteFilePath.of(
    `${__dirname}/../../../../../packages/cli/generation/ir-generator-tests/src/dynamic-snippets/__test__/test-definitions`
);

const IR_FILEPATH = AbsoluteFilePath.of(join(DYNAMIC_IR_TEST_DEFINITIONS_DIRECTORY, "variables.json"));

// `endpointParam` is bound to the `rootVariable` SDK variable, so it is configured on the
// client rather than passed to the endpoint method.
const post: FernIr.dynamic.EndpointSnippetRequest = {
    endpoint: {
        method: "POST",
        path: "/{endpointParam}"
    },
    baseURL: undefined,
    environment: undefined,
    auth: undefined,
    pathParameters: { endpointParam: "endpointParam" },
    queryParameters: undefined,
    headers: undefined,
    requestBody: undefined
};

describe("sdk variables", () => {
    it("configures a variable-bound path parameter on the root client", async () => {
        const generator = buildDynamicSnippetsGenerator({
            irFilepath: IR_FILEPATH,
            config: buildGeneratorConfig()
        });

        const response = await generator.generate(post);

        expect(response.errors).toBeUndefined();
        expect(response.snippet).toContain('root_variable: "endpointParam"');
        expect(response.snippet).toContain("client.service.post");
        expect(response.snippet).not.toContain("endpoint_param");
    });

    it("leaves the variable unset when the snippet has no value for it", async () => {
        const generator = buildDynamicSnippetsGenerator({
            irFilepath: IR_FILEPATH,
            config: buildGeneratorConfig()
        });

        const response = await generator.generate({ ...post, pathParameters: undefined });

        expect(response.errors).toBeUndefined();
        expect(response.snippet).not.toContain("root_variable");
        expect(response.snippet).toContain("client.service.post");
    });
});
