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

// `bulkRefund` takes a body the API does not require, so an example may leave the body out entirely.
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

// Snippet generation shells out to `rustfmt`, whose first invocation on a cold machine can take
// several seconds, so these need a longer timeout than the 5s default.
describe("optional request body", { tags: ["slow"] }, () => {
    it("passes None for an absent body once the generator opts in", async () => {
        const generator = buildDynamicSnippetsGenerator({
            irFilepath: IR_FILEPATH,
            config: buildGeneratorConfig({ customConfig: { respectOptionalRequestBody: true } })
        });

        const response = await generator.generate({ ...bulkRefund, requestBody: undefined });

        expect(response.errors).toBeUndefined();
        expect(response.snippet).toContain("bulk_refund(None, None)");
    });

    it("still sends an explicitly empty body once the generator opts in", async () => {
        const generator = buildDynamicSnippetsGenerator({
            irFilepath: IR_FILEPATH,
            config: buildGeneratorConfig({ customConfig: { respectOptionalRequestBody: true } })
        });

        const response = await generator.generate({ ...bulkRefund, requestBody: {} });

        expect(response.errors).toBeUndefined();
        expect(response.snippet).toContain("Some(&RefundRequest {");
        expect(response.snippet).not.toContain("bulk_refund(None");
    });

    it("wraps a supplied body in Some once the generator opts in", async () => {
        const generator = buildDynamicSnippetsGenerator({
            irFilepath: IR_FILEPATH,
            config: buildGeneratorConfig({ customConfig: { respectOptionalRequestBody: true } })
        });

        const response = await generator.generate({ ...bulkRefund, requestBody: { amount: 60 } });

        expect(response.errors).toBeUndefined();
        expect(response.snippet).toContain("Some(&RefundRequest {");
        expect(response.snippet).toContain("amount: Some(60.0)");
    });

    it("still passes a body by default", async () => {
        const generator = buildDynamicSnippetsGenerator({
            irFilepath: IR_FILEPATH,
            config: buildGeneratorConfig()
        });

        const response = await generator.generate({ ...bulkRefund, requestBody: {} });

        expect(response.errors).toBeUndefined();
        expect(response.snippet).toContain("&RefundRequest {");
        expect(response.snippet).not.toContain("Some(");
    });
});
