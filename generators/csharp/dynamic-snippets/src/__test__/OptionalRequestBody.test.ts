import { FernIr } from "@fern-api/dynamic-ir-sdk";
import { AbsoluteFilePath, join } from "@fern-api/path-utils";

import { buildDynamicSnippetsGenerator } from "./utils/buildDynamicSnippetsGenerator.js";
import { buildGeneratorConfig } from "./utils/buildGeneratorConfig.js";

const IR_FILEPATH = AbsoluteFilePath.of(
    join(
        AbsoluteFilePath.of(
            `${__dirname}/../../../../../packages/cli/generation/ir-generator-tests/src/dynamic-snippets/__test__/test-definitions`
        ),
        "respect-optional-request-body.json"
    )
);

// `BulkRefund` takes a body the API does not require. An example that supplies nothing for it
// reaches the snippet generator as an empty body, since that is how the importer spells it.
const bulkRefund: FernIr.dynamic.EndpointSnippetRequest = {
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
            config: buildGeneratorConfig({ customConfig: { "respect-optional-request-body": true } })
        });

        for (const requestBody of [undefined, {}]) {
            const response = await generator.generate({ ...bulkRefund, requestBody });

            expect(response.errors).toBeUndefined();
            expect(response.snippet).toContain("BulkRefundAsync()");
        }
    });

    it("still passes a body by default", async () => {
        const generator = buildDynamicSnippetsGenerator({
            irFilepath: IR_FILEPATH,
            config: buildGeneratorConfig()
        });

        const response = await generator.generate({ ...bulkRefund, requestBody: {} });

        expect(response.errors).toBeUndefined();
        expect(response.snippet).toContain("BulkRefundAsync(");
        expect(response.snippet).toContain("new RefundRequest()");
    });
});
