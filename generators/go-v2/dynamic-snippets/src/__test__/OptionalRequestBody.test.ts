import { FernIr } from "@fern-api/dynamic-ir-sdk";
import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/path-utils";

import { buildDynamicSnippetsGenerator } from "./utils/buildDynamicSnippetsGenerator.js";
import { buildGeneratorConfig } from "./utils/buildGeneratorConfig.js";

const IR_FILEPATH = join(
    AbsoluteFilePath.of(__dirname),
    RelativeFilePath.of(
        "../../../../../packages/cli/generation/ir-generator-tests/src/dynamic-snippets/__test__/test-definitions/respect-optional-request-body.json"
    )
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

/** Retypes `bulkRefund`'s optional body as a string, which generates as a Go value type. */
function withStringBulkRefundBody(
    ir: FernIr.dynamic.DynamicIntermediateRepresentation
): FernIr.dynamic.DynamicIntermediateRepresentation {
    const endpointId = "endpoint_.bulkRefund";
    const endpoint = ir.endpoints[endpointId];
    if (endpoint == null || endpoint.request.type !== "body") {
        throw new Error(`Expected ${endpointId} to take a body request`);
    }
    return {
        ...ir,
        endpoints: {
            ...ir.endpoints,
            [endpointId]: {
                ...endpoint,
                request: {
                    ...endpoint.request,
                    body: {
                        type: "typeReference",
                        value: { type: "primitive", value: "STRING" }
                    }
                }
            }
        }
    };
}

describe("optional request body", () => {
    it("passes nil for the body once the generator opts in", async () => {
        const generator = buildDynamicSnippetsGenerator({
            irFilepath: IR_FILEPATH,
            config: buildGeneratorConfig({ customConfig: { respectOptionalRequestBody: true } })
        });

        for (const requestBody of [undefined, {}]) {
            const response = await generator.generate({ ...bulkRefundWithoutBody, requestBody });

            expect(response.errors).toBeUndefined();
            expect(response.snippet).toContain("client.BulkRefund(\n\t\tcontext.TODO(),\n\t\tnil,\n\t)");
            expect(response.snippet).not.toContain("RefundRequest");
        }
    });

    it("keeps passing a body the generated parameter cannot omit", async () => {
        // A body generated as a Go value type has no way to say "nothing", so the example has to
        // keep supplying a value even though the API leaves the body optional.
        const generator = buildDynamicSnippetsGenerator({
            irFilepath: IR_FILEPATH,
            config: buildGeneratorConfig({ customConfig: { respectOptionalRequestBody: true } }),
            transformIr: (ir) => withStringBulkRefundBody(ir)
        });

        const response = await generator.generate({ ...bulkRefundWithoutBody, requestBody: "re_1234" });

        expect(response.errors).toBeUndefined();
        expect(response.snippet).toContain('request := "re_1234"');
    });

    it("still passes a body by default", async () => {
        const generator = buildDynamicSnippetsGenerator({
            irFilepath: IR_FILEPATH,
            config: buildGeneratorConfig()
        });

        const response = await generator.generate({ ...bulkRefundWithoutBody, requestBody: {} });

        expect(response.errors).toBeUndefined();
        expect(response.snippet).toContain("acme.RefundRequest{}");
    });
});
