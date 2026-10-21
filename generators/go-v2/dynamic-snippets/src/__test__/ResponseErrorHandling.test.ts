import { FernIr } from "@fern-api/dynamic-ir-sdk";
import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/path-utils";

import { buildDynamicSnippetsGenerator } from "./utils/buildDynamicSnippetsGenerator.js";
import { buildGeneratorConfig } from "./utils/buildGeneratorConfig.js";

const IR_FILEPATH = join(
    AbsoluteFilePath.of(__dirname),
    RelativeFilePath.of(
        "../../../../../packages/cli/generation/ir-generator-tests/src/dynamic-snippets/__test__/test-definitions/imdb.json"
    )
);

const getMovie: FernIr.dynamic.EndpointSnippetRequest = {
    endpoint: {
        method: "GET",
        path: "/movies/{movieId}"
    },
    baseURL: undefined,
    environment: undefined,
    auth: { type: "bearer", token: "<token>" },
    pathParameters: { movieId: "movie_xyz" },
    queryParameters: undefined,
    headers: undefined,
    requestBody: undefined
};

/** Marks `getMovie` as returning no response body, the way a 204 delete is modelled. */
function withoutResponseBody(
    ir: FernIr.dynamic.DynamicIntermediateRepresentation
): FernIr.dynamic.DynamicIntermediateRepresentation {
    const endpointId = "endpoint_imdb.getMovie";
    const endpoint = ir.endpoints[endpointId];
    if (endpoint == null) {
        throw new Error(`Expected ${endpointId} to exist`);
    }
    return {
        ...ir,
        endpoints: {
            ...ir.endpoints,
            [endpointId]: { ...endpoint, response: { type: "none" } }
        }
    };
}

describe("response error handling", () => {
    it("assigns and checks the error for endpoints that return a response", async () => {
        const generator = buildDynamicSnippetsGenerator({ irFilepath: IR_FILEPATH, config: buildGeneratorConfig() });
        const response = await generator.generate(getMovie);

        expect(response.errors).toBeUndefined();
        expect(response.snippet).toContain("func do() error {");
        expect(response.snippet).toContain(
            '_, err := client.Imdb.GetMovie(\n\t\tcontext.TODO(),\n\t\trequest,\n\t)'
        );
        expect(response.snippet).toContain("if err != nil {\n\t\treturn err\n\t}\n\treturn nil\n}");
    });

    it("assigns only the error for endpoints without a response body", async () => {
        const generator = buildDynamicSnippetsGenerator({
            irFilepath: IR_FILEPATH,
            config: buildGeneratorConfig(),
            transformIr: (ir) => withoutResponseBody(ir)
        });
        const response = await generator.generate(getMovie);

        expect(response.errors).toBeUndefined();
        expect(response.snippet).toContain('err := client.Imdb.GetMovie(\n\t\tcontext.TODO(),\n\t\trequest,\n\t)');
        expect(response.snippet).not.toContain("_, err :=");
        expect(response.snippet).toContain("if err != nil {\n\t\treturn err\n\t}\n\treturn nil\n}");
    });
});
