import { FernIr } from "@fern-api/dynamic-ir-sdk";
import { AbsoluteFilePath, join } from "@fern-api/path-utils";

import { buildDynamicSnippetsGenerator } from "./utils/buildDynamicSnippetsGenerator.js";
import { buildGeneratorConfig } from "./utils/buildGeneratorConfig.js";

const DYNAMIC_IR_TEST_DEFINITIONS_DIRECTORY = AbsoluteFilePath.of(
    `${__dirname}/../../../../../packages/cli/generation/ir-generator-tests/src/dynamic-snippets/__test__/test-definitions`
);

// `X-Another-Header` and `X-API-Version` are global headers; `X-Endpoint-Header` is declared on the endpoint.
const IR_FILEPATH = AbsoluteFilePath.of(join(DYNAMIC_IR_TEST_DEFINITIONS_DIRECTORY, "auth-environment-variables.json"));

const GLOBAL_HEADERS = { "X-Another-Header": "acme", "X-API-Version": "01-01-2000" };

function buildRequest(headers: Record<string, unknown>): FernIr.dynamic.EndpointSnippetRequest {
    return {
        endpoint: { method: "GET", path: "/apiKeyInHeader" },
        baseURL: undefined,
        environment: undefined,
        auth: { type: "header", value: "<value>" },
        pathParameters: undefined,
        queryParameters: undefined,
        headers: { ...GLOBAL_HEADERS, ...headers },
        requestBody: undefined
    };
}

describe("global headers in endpoint examples", () => {
    const generator = buildDynamicSnippetsGenerator({ irFilepath: IR_FILEPATH, config: buildGeneratorConfig() });

    it("does not report global headers as endpoint parameters", async () => {
        const response = await generator.generate(buildRequest({ "X-Endpoint-Header": "acme" }));

        expect(response.errors).toBeUndefined();
        expect(response.snippet).toMatchSnapshot();
    });

    it("passes a global header to the endpoint when the endpoint also declares it", async () => {
        const overlapGenerator = buildDynamicSnippetsGenerator({
            irFilepath: IR_FILEPATH,
            config: buildGeneratorConfig(),
            modifyIr: (ir) => {
                const endpoint = ir.endpoints["endpoint_service.getWithHeader"];
                const globalHeader = ir.headers?.find((header) => header.name.wireValue === "X-API-Version");
                if (endpoint?.request.type === "inlined" && globalHeader != null) {
                    endpoint.request.headers = [...(endpoint.request.headers ?? []), globalHeader];
                }
                return ir;
            }
        });

        const response = await overlapGenerator.generate(buildRequest({}));

        expect(response.errors).toBeUndefined();
        expect(response.snippet).toMatchSnapshot();
    });

    it("still reports a header that is neither global nor on the endpoint", async () => {
        const response = await generator.generate(buildRequest({ "X-Unknown": "acme" }));

        expect(response.errors?.map((error) => error.message)).toEqual([
            '"X-Unknown" is not a recognized parameter for this endpoint'
        ]);
    });
});
