import { FernIr } from "@fern-api/dynamic-ir-sdk";
import { AbsoluteFilePath, join } from "@fern-api/path-utils";

import { buildDynamicSnippetsGenerator } from "./utils/buildDynamicSnippetsGenerator.js";
import { buildGeneratorConfig } from "./utils/buildGeneratorConfig.js";

const DYNAMIC_IR_TEST_DEFINITIONS_DIRECTORY = AbsoluteFilePath.of(
    `${__dirname}/../../../../../packages/cli/generation/ir-generator-tests/src/dynamic-snippets/__test__/test-definitions`
);
const IR_FILEPATH = AbsoluteFilePath.of(join(DYNAMIC_IR_TEST_DEFINITIONS_DIRECTORY, "exhaustive.json"));
const REAL_FIXTURE_IR_FILEPATH = AbsoluteFilePath.of(
    join(DYNAMIC_IR_TEST_DEFINITIONS_DIRECTORY, "ts-flatten-request-any-auth.json")
);

const STRING_NAME: FernIr.dynamic.Name = {
    originalName: "string",
    camelCase: {
        unsafeName: "string",
        safeName: "string"
    },
    pascalCase: {
        unsafeName: "String",
        safeName: "String"
    },
    snakeCase: {
        unsafeName: "string",
        safeName: "string"
    },
    screamingSnakeCase: {
        unsafeName: "STRING",
        safeName: "STRING"
    }
};

const STRING_PATH_PARAMETER: FernIr.dynamic.NamedParameter = {
    name: {
        name: STRING_NAME,
        wireValue: "string"
    },
    typeReference: {
        type: "primitive",
        value: "STRING"
    }
};

const REQUEST: FernIr.dynamic.EndpointSnippetRequest = {
    endpoint: {
        method: "POST",
        path: "/params/body-and-query"
    },
    baseURL: undefined,
    environment: undefined,
    auth: {
        type: "bearer",
        token: "<YOUR_API_KEY>"
    },
    pathParameters: undefined,
    queryParameters: undefined,
    headers: undefined,
    requestBody: {
        string: "value"
    }
};

const REAL_FIXTURE_REQUEST: FernIr.dynamic.EndpointSnippetRequest = {
    endpoint: {
        method: "PUT",
        path: "/users/{id}"
    },
    baseURL: undefined,
    environment: undefined,
    auth: {
        type: "bearer",
        token: "<token>"
    },
    pathParameters: {
        id: "path-id"
    },
    queryParameters: undefined,
    headers: undefined,
    requestBody: {
        id: "body-id",
        name: "Ada"
    }
};

describe("flattenRequestParameters", () => {
    it("flattens referenced object request bodies when enabled", async () => {
        const generator = buildDynamicSnippetsGenerator({
            irFilepath: IR_FILEPATH,
            config: buildGeneratorConfig({
                customConfig: {
                    flattenRequestParameters: true
                }
            })
        });

        const response = await generator.generate(REQUEST);

        expect(response.snippet).toContain('string: "value"');
        expect(response.snippet).not.toContain("body:");
    });

    it("preserves the body property by default", async () => {
        const generator = buildDynamicSnippetsGenerator({
            irFilepath: IR_FILEPATH,
            config: buildGeneratorConfig({})
        });

        const response = await generator.generate(REQUEST);

        expect(response.snippet).toContain("body: {");
    });

    it("preserves the body property for a non-object referenced body", async () => {
        const generator = buildDynamicSnippetsGenerator({
            irFilepath: IR_FILEPATH,
            config: buildGeneratorConfig({
                customConfig: {
                    flattenRequestParameters: true
                }
            })
        });

        const response = await generator.generate({
            ...REQUEST,
            endpoint: {
                method: "POST",
                path: "/test-headers/custom-header"
            },
            headers: {
                "X-TEST-SERVICE-HEADER": "service",
                "X-TEST-ENDPOINT-HEADER": "endpoint"
            },
            requestBody: "value"
        });

        expect(response.snippet).toContain("body:");
    });

    it("omits path parameters that collide with flattened body fields", async () => {
        const generator = buildDynamicSnippetsGenerator({
            irFilepath: IR_FILEPATH,
            config: buildGeneratorConfig({
                customConfig: {
                    flattenRequestParameters: true
                }
            }),
            modifyIr: (ir) => {
                const endpoint = ir.endpoints["endpoint_endpoints/params.createWithBodyAndQuery"];
                if (endpoint == null || endpoint.request.type !== "inlined") {
                    throw new Error("Expected the body-and-query endpoint to have an inlined request");
                }
                endpoint.location.path = "/params/body-and-query/{string}";
                endpoint.request.pathParameters = [STRING_PATH_PARAMETER];
                return ir;
            }
        });

        const response = await generator.generate({
            ...REQUEST,
            endpoint: {
                method: "POST",
                path: "/params/body-and-query/{string}"
            },
            pathParameters: {
                string: "path"
            },
            requestBody: {
                string: "body"
            }
        });

        expect(response.snippet.match(/\bstring:/g)?.length).toBe(1);
        expect(response.snippet).toContain('string: "body"');
    });

    it("flattens a real referenced object body and drops the colliding request path parameter", async () => {
        const generator = buildDynamicSnippetsGenerator({
            irFilepath: REAL_FIXTURE_IR_FILEPATH,
            config: buildGeneratorConfig({
                customConfig: {
                    flattenRequestParameters: true
                }
            })
        });

        const response = await generator.generate(REAL_FIXTURE_REQUEST);

        expect(response.snippet).toContain('id: "body-id"');
        expect(response.snippet).toContain('name: "Ada"');
        expect(response.snippet).not.toContain("body:");
        expect(response.snippet).not.toContain('"path-id"');
        expect(response.snippet.match(/\bid:/g)?.length).toBe(1);
    });

    it("preserves the body and request path parameter when flattening is disabled", async () => {
        const generator = buildDynamicSnippetsGenerator({
            irFilepath: REAL_FIXTURE_IR_FILEPATH,
            config: buildGeneratorConfig({
                customConfig: {
                    flattenRequestParameters: false
                }
            })
        });

        const response = await generator.generate(REAL_FIXTURE_REQUEST);

        expect(response.snippet).toContain('id: "path-id"');
        expect(response.snippet).toContain("body: {");
    });

    it("emits endpoint-level path parameters positionally for a real referenced body", async () => {
        const generator = buildDynamicSnippetsGenerator({
            irFilepath: REAL_FIXTURE_IR_FILEPATH,
            config: buildGeneratorConfig({
                customConfig: {
                    flattenRequestParameters: true
                }
            })
        });

        const response = await generator.generate({
            ...REAL_FIXTURE_REQUEST,
            endpoint: {
                method: "PUT",
                path: "/users/{id}/profile"
            }
        });

        expect(response.snippet).toContain('updateUserProfile("path-id", {');
        expect(response.snippet).toContain('id: "body-id"');
        expect(response.snippet).toContain('name: "Ada"');
    });
});
