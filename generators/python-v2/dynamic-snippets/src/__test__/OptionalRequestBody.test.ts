import { FernIr } from "@fern-api/dynamic-ir-sdk";
import { AbsoluteFilePath, join } from "@fern-api/path-utils";

import { buildDynamicSnippetsGenerator } from "./utils/buildDynamicSnippetsGenerator.js";
import { buildGeneratorConfig } from "./utils/buildGeneratorConfig.js";

const IR_FILEPATH = AbsoluteFilePath.of(
    join(
        AbsoluteFilePath.of(
            `${__dirname}/../../../../../packages/cli/generation/ir-generator-tests/src/dynamic-snippets/__test__/test-definitions`
        ),
        "python-optional-request-body.json"
    )
);

// `batch_refund` takes a list body the API does not require. A list does not flatten into
// kwargs, so the body is the single `request` argument and omitting it is visible.
const batchRefund: FernIr.dynamic.EndpointSnippetRequest = {
    endpoint: {
        method: "POST",
        path: "/refunds/batch"
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
            config: buildGeneratorConfig({ customConfig: { respect_optional_request_body: true } })
        });

        for (const requestBody of [undefined, {}]) {
            const response = await generator.generate({ ...batchRefund, requestBody });

            expect(response.errors).toBeUndefined();
            expect(response.snippet).toContain("client.batch_refund()");
        }
    });

    it("still passes a body by default", async () => {
        const generator = buildDynamicSnippetsGenerator({
            irFilepath: IR_FILEPATH,
            config: buildGeneratorConfig()
        });

        const response = await generator.generate({ ...batchRefund, requestBody: [{ amount: 1.1 }] });

        expect(response.errors).toBeUndefined();
        expect(response.snippet).toContain("request=[");
    });
});
