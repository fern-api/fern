import { FernIr } from "@fern-api/dynamic-ir-sdk";
import { AbsoluteFilePath, join } from "@fern-api/path-utils";

import { buildDynamicSnippetsGenerator } from "./utils/buildDynamicSnippetsGenerator.js";
import { buildGeneratorConfig } from "./utils/buildGeneratorConfig.js";

const IR_FILEPATH = AbsoluteFilePath.of(
    join(
        AbsoluteFilePath.of(
            `${__dirname}/../../../../../packages/cli/generation/ir-generator-tests/src/dynamic-snippets/__test__/test-definitions`
        ),
        "variables.json"
    )
);

// `endpointParam` is bound to the `rootVariable` SDK variable, so it is configured on the client
// instead of being passed to the endpoint method.
const post: FernIr.dynamic.EndpointSnippetRequest = {
    endpoint: {
        method: "POST",
        path: "/{endpointParam}"
    },
    baseURL: undefined,
    environment: undefined,
    auth: undefined,
    pathParameters: {
        endpointParam: "endpointParam"
    },
    queryParameters: undefined,
    headers: undefined,
    requestBody: undefined
};

describe("sdk variables", () => {
    it("passes a variable-bound path parameter to the client options", async () => {
        const generator = buildDynamicSnippetsGenerator({
            irFilepath: IR_FILEPATH,
            config: buildGeneratorConfig()
        });

        const response = await generator.generate(post);

        expect(response.errors).toBeUndefined();
        expect(response.snippet).toContain('RootVariable = "endpointParam"');
        expect(response.snippet).toContain("PostAsync()");
    });

    it("leaves the variable unset when the snippet has no value for it", async () => {
        const generator = buildDynamicSnippetsGenerator({
            irFilepath: IR_FILEPATH,
            config: buildGeneratorConfig()
        });

        const response = await generator.generate({ ...post, pathParameters: undefined });

        expect(response.errors).toBeUndefined();
        expect(response.snippet).not.toContain("RootVariable");
        expect(response.snippet).toContain("PostAsync()");
    });
});
