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

// `bulkRefund` takes a body the API does not require, so an example that supplies nothing for it
// reaches the snippet generator either as no body at all or as an empty one.
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
    it("omits the body arguments once the generator opts in", async () => {
        const generator = buildDynamicSnippetsGenerator({
            irFilepath: IR_FILEPATH,
            config: buildGeneratorConfig({ customConfig: { respectOptionalRequestBody: true } })
        });

        for (const requestBody of [undefined, {}]) {
            const response = await generator.generate({ ...bulkRefundWithoutBody, requestBody });

            expect(response.errors).toBeUndefined();
            expect(response.snippet).toContain("client.bulk_refund");
            expect(response.snippet).not.toContain("amount");
        }
    });

    it("keeps passing a supplied body", async () => {
        const generator = buildDynamicSnippetsGenerator({
            irFilepath: IR_FILEPATH,
            config: buildGeneratorConfig({ customConfig: { respectOptionalRequestBody: true } })
        });

        const response = await generator.generate({ ...bulkRefundWithoutBody, requestBody: { amount: 60 } });

        expect(response.errors).toBeUndefined();
        expect(response.snippet).toContain("amount: 60");
    });
});
