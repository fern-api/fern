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
const OAUTH_FIXTURE_IR_FILEPATH = AbsoluteFilePath.of(
    join(DYNAMIC_IR_TEST_DEFINITIONS_DIRECTORY, "java-endpoint-security-token-subpackage.json")
);

const REQUEST: FernIr.dynamic.EndpointSnippetRequest = {
    endpoint: {
        method: "PUT",
        path: "/http-methods/{id}"
    },
    baseURL: undefined,
    environment: undefined,
    auth: {
        type: "bearer",
        token: "<YOUR_API_KEY>"
    },
    pathParameters: {
        id: "id"
    },
    queryParameters: undefined,
    headers: undefined,
    requestBody: undefined
};

const bearerAuthWrapperProperty: FernIr.dynamic.Name = {
    originalName: "bearer_auth",
    camelCase: {
        unsafeName: "bearerAuth",
        safeName: "bearerAuth"
    },
    pascalCase: {
        unsafeName: "BearerAuth",
        safeName: "BearerAuth"
    },
    snakeCase: {
        unsafeName: "bearer_auth",
        safeName: "bearer_auth"
    },
    screamingSnakeCase: {
        unsafeName: "BEARER_AUTH",
        safeName: "BEARER_AUTH"
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

function addBearerAuthWrapperProperty(
    ir: FernIr.dynamic.DynamicIntermediateRepresentation
): FernIr.dynamic.DynamicIntermediateRepresentation {
    const endpointEntry = Object.entries(ir.endpoints).find(
        ([endpointId, endpoint]) =>
            endpointId === "endpoint_endpoints/http-methods.testPut" && endpoint.auth?.type === "bearer"
    );
    if (endpointEntry == null || endpointEntry[1].auth?.type !== "bearer") {
        throw new Error("No bearer-authenticated endpoint found in fixture");
    }
    const [endpointId, endpoint] = endpointEntry;
    const bearerAuth = endpoint.auth;
    if (bearerAuth == null || bearerAuth.type !== "bearer") {
        throw new Error("No bearer auth found on selected endpoint");
    }
    const auth = {
        ...bearerAuth,
        wrapperProperty: bearerAuthWrapperProperty
    };
    const modifiedEndpoint: FernIr.dynamic.Endpoint = {
        ...endpoint,
        auth
    };
    return {
        ...ir,
        endpoints: {
            ...ir.endpoints,
            [endpointId]: modifiedEndpoint
        }
    };
}

describe("auth wrapperProperty", () => {
    it("nests auth constructor options under wrapperProperty", async () => {
        const generator = buildDynamicSnippetsGenerator({
            irFilepath: IR_FILEPATH,
            config: buildGeneratorConfig({}),
            modifyIr: addBearerAuthWrapperProperty
        });

        const response = await generator.generate(REQUEST);

        expect(response.snippet).toContain("bearerAuth: {");
        expect(response.snippet).toContain("token:");
    });

    it("keeps auth constructor options flat without wrapperProperty", async () => {
        const generator = buildDynamicSnippetsGenerator({
            irFilepath: IR_FILEPATH,
            config: buildGeneratorConfig({})
        });

        const response = await generator.generate(REQUEST);

        expect(response.snippet).toContain("token:");
        expect(response.snippet).not.toContain("bearerAuth: {");
    });

    it("nests auth constructor options for a real multi-auth fixture", async () => {
        const generator = buildDynamicSnippetsGenerator({
            irFilepath: REAL_FIXTURE_IR_FILEPATH,
            config: buildGeneratorConfig({})
        });

        const response = await generator.generate({
            ...REAL_FIXTURE_REQUEST
        });

        expect(response.snippet).toContain("bearerAuth: {");
        expect(response.snippet).toContain('token: "<token>"');
    });

    it("uses camelCase auth wrapper options with noSerdeLayer", async () => {
        const generator = buildDynamicSnippetsGenerator({
            irFilepath: REAL_FIXTURE_IR_FILEPATH,
            config: buildGeneratorConfig({
                customConfig: {
                    noSerdeLayer: true
                }
            })
        });

        const response = await generator.generate(REAL_FIXTURE_REQUEST);

        expect(response.snippet).toContain("bearerAuth: {");
        expect(response.snippet).not.toContain("BearerAuth");
    });

    it("uses camelCase auth wrapper options with retainOriginalCasing", async () => {
        const generator = buildDynamicSnippetsGenerator({
            irFilepath: REAL_FIXTURE_IR_FILEPATH,
            config: buildGeneratorConfig({
                customConfig: {
                    retainOriginalCasing: true
                }
            })
        });

        const response = await generator.generate(REAL_FIXTURE_REQUEST);

        expect(response.snippet).toContain("bearerAuth: {");
        expect(response.snippet).not.toContain("BearerAuth");
    });

    it("uses the camelCase OAuth scheme key with noSerdeLayer", async () => {
        const generator = buildDynamicSnippetsGenerator({
            irFilepath: OAUTH_FIXTURE_IR_FILEPATH,
            config: buildGeneratorConfig({
                customConfig: {
                    noSerdeLayer: true
                }
            })
        });

        const response = await generator.generate({
            endpoint: {
                method: "GET",
                path: "/users/mixed"
            },
            baseURL: undefined,
            environment: undefined,
            auth: {
                type: "oauth",
                clientId: "<clientId>",
                clientSecret: "<clientSecret>"
            },
            pathParameters: undefined,
            queryParameters: undefined,
            headers: undefined,
            requestBody: undefined
        });

        expect(response.snippet).toContain("oauth: {");
        expect(response.snippet).not.toContain("oAuth");
    });
});
