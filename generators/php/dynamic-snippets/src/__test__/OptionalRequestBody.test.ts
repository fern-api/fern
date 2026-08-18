import { FernIr } from "@fern-api/dynamic-ir-sdk";
import { AbsoluteFilePath, join } from "@fern-api/path-utils";

import { buildDynamicSnippetsGenerator } from "./utils/buildDynamicSnippetsGenerator.js";
import { buildGeneratorConfig } from "./utils/buildGeneratorConfig.js";

const DYNAMIC_IR_TEST_DEFINITIONS_DIRECTORY = AbsoluteFilePath.of(
    `${__dirname}/../../../../../packages/cli/generation/ir-generator-tests/src/dynamic-snippets/__test__/test-definitions`
);

const IR_FILEPATH = AbsoluteFilePath.of(
    join(DYNAMIC_IR_TEST_DEFINITIONS_DIRECTORY, "respect-optional-request-body.json")
);

// `bulkRefund` takes a body the API does not require. An example that supplies nothing for it
// reaches the snippet generator as an empty body, since that is how the importer spells it.
const bulkRefundWithoutBody: FernIr.dynamic.EndpointSnippetRequest = {
    endpoint: {
        method: "POST",
        path: "/refunds"
    },
    baseURL: undefined,
    environment: undefined,
    auth: undefined,
    pathParameters: undefined,
    queryParameters: undefined,
    headers: undefined,
    requestBody: undefined
};

describe("optional request body", () => {
    it("drops the body argument once the generator opts in", async () => {
        const generator = buildDynamicSnippetsGenerator({
            irFilepath: IR_FILEPATH,
            config: buildGeneratorConfig({ customConfig: { respectOptionalRequestBody: true } })
        });

        for (const requestBody of [undefined, {}]) {
            const response = await generator.generate({ ...bulkRefundWithoutBody, requestBody });

            expect(response.errors).toBeUndefined();
            expect(response.snippet).toContain("$client->bulkRefund();");
        }
    });

    it("still passes a body by default", async () => {
        const generator = buildDynamicSnippetsGenerator({
            irFilepath: IR_FILEPATH,
            config: buildGeneratorConfig()
        });

        const response = await generator.generate({ ...bulkRefundWithoutBody, requestBody: {} });

        expect(response.snippet).toContain("RefundRequest");
        expect(response.snippet).not.toContain("$client->bulkRefund();");
    });
});
