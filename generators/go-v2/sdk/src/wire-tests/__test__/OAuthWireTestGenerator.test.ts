import { CaseConverter } from "@fern-api/base-generator";
import { FernIr } from "@fern-fern/ir-sdk";
import { describe, expect, it } from "vitest";
import { SdkGeneratorContext } from "../../SdkGeneratorContext.js";
import { OAuthWireTestGenerator } from "../OAuthWireTestGenerator.js";

const ROOT_IMPORT_PATH = "github.com/acme/acme-go";

const caseConverter = new CaseConverter({ generationLanguage: "go", keywords: undefined, smartCasing: true });

function createName(originalName: string): FernIr.Name {
    const lower = originalName.toLowerCase();
    const upper = originalName.toUpperCase();
    return {
        originalName,
        camelCase: { unsafeName: lower, safeName: lower },
        snakeCase: { unsafeName: lower, safeName: lower },
        screamingSnakeCase: { unsafeName: upper, safeName: upper },
        pascalCase: { unsafeName: originalName, safeName: originalName }
    };
}

function createNameAndWireValue(name: string, wireValue: string): FernIr.NameAndWireValue {
    return { name: createName(name), wireValue };
}

const ROOT_FILEPATH: FernIr.FernFilepath = { allParts: [], packagePath: [], file: undefined };
const AUTH_FILEPATH: FernIr.FernFilepath = {
    allParts: [createName("auth")],
    packagePath: [createName("auth")],
    file: undefined
};

function stringPrimitive(): FernIr.TypeReference {
    return {
        type: "primitive",
        primitive: { v1: FernIr.PrimitiveTypeV1.String, v2: undefined },
        default: undefined,
        inline: undefined
    } as unknown as FernIr.TypeReference;
}

function bodyRequestProperty(name: string, wireValue: string): FernIr.RequestProperty {
    return {
        property: {
            type: "body",
            name: createNameAndWireValue(name, wireValue),
            valueType: stringPrimitive()
        },
        propertyPath: undefined
    } as unknown as FernIr.RequestProperty;
}

function createEndpoint(sdkRequestShape: FernIr.SdkRequestShape, requestParameterName?: string): FernIr.HttpEndpoint {
    return {
        id: "endpoint_auth.getToken",
        name: createNameAndWireValue("getToken", "getToken"),
        sdkRequest: {
            shape: sdkRequestShape,
            requestParameterName
        }
    } as unknown as FernIr.HttpEndpoint;
}

function createIr(endpoint: FernIr.HttpEndpoint): FernIr.IntermediateRepresentation {
    return {
        auth: {
            requirement: "ALL",
            schemes: [
                {
                    type: "oauth",
                    configuration: {
                        type: "clientCredentials",
                        tokenEndpoint: {
                            endpointReference: {
                                serviceId: "service_auth",
                                endpointId: "endpoint_auth.getToken"
                            },
                            requestProperties: {
                                clientId: bodyRequestProperty("clientId", "client_id"),
                                clientSecret: bodyRequestProperty("clientSecret", "client_secret"),
                                scopes: undefined
                            },
                            responseProperties: {
                                accessToken: bodyRequestProperty("accessToken", "access_token"),
                                expiresIn: undefined,
                                refreshToken: undefined
                            }
                        }
                    }
                }
            ]
        },
        services: {
            service_auth: {
                name: { fernFilepath: AUTH_FILEPATH },
                endpoints: [endpoint]
            }
        },
        types: {}
    } as unknown as FernIr.IntermediateRepresentation;
}

function createContext(ir: FernIr.IntermediateRepresentation): SdkGeneratorContext {
    const getClassName = (name: unknown): string => {
        if (typeof name === "string") {
            return name;
        }
        const n = name as FernIr.Name;
        return n.pascalCase?.safeName ?? n.originalName;
    };
    return {
        ir,
        customConfig: {},
        caseConverter,
        getRootImportPath: () => ROOT_IMPORT_PATH,
        getClientConstructorName: () => "NewClient",
        getMethodName: () => "GetToken",
        getClassName,
        getFieldName: (name: unknown) => {
            const n = name as FernIr.NameAndWireValue;
            const wire = n.wireValue ?? "";
            return wire
                .split("_")
                .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
                .join("");
        },
        getPackageLocation: (_filepath: FernIr.FernFilepath) => ({
            importPath: ROOT_IMPORT_PATH,
            directory: "",
            packageName: "acme"
        }),
        getRequestWrapperTypeReference: (_serviceId: string, requestName: unknown) => ({
            type: "reference",
            name: getClassName(requestName),
            importPath: ROOT_IMPORT_PATH
        }),
        getClientFileLocation: () => ({
            directory: "auth",
            packageName: "auth",
            importPath: `${ROOT_IMPORT_PATH}/auth`
        })
    } as unknown as SdkGeneratorContext;
}

function generateOAuthWireTest(endpoint: FernIr.HttpEndpoint): string {
    const context = createContext(createIr(endpoint));
    const file = new OAuthWireTestGenerator(context).generate();
    expect(file).toBeDefined();
    return file!.toFile().fileContents as string;
}

describe("OAuthWireTestGenerator", () => {
    it("uses the named request body type for justRequestBody token endpoints", () => {
        // Mirrors https://github.com/fern-api/fern/issues/18200: an OpenAPI token
        // endpoint whose form-urlencoded body is a $ref produces a justRequestBody
        // sdkRequest shape with a named request body type. The generated wire test
        // must construct that type (OauthTokenRequest), not a nonexistent wrapper.
        const endpoint = createEndpoint(
            {
                type: "justRequestBody",
                value: {
                    type: "typeReference",
                    requestBodyType: {
                        type: "named",
                        name: createName("OauthTokenRequest"),
                        fernFilepath: ROOT_FILEPATH,
                        typeId: "type_oauthTokenRequest"
                    }
                }
            } as unknown as FernIr.SdkRequestShape,
            "Request"
        );
        const contents = generateOAuthWireTest(endpoint);
        expect(contents).toContain("OauthTokenRequest{");
        expect(contents).not.toContain(".Request{");
    });

    it("uses the wrapper type for wrapper token endpoints", () => {
        const endpoint = createEndpoint({
            type: "wrapper",
            wrapperName: createName("GetTokenRequest"),
            serviceName: createName("auth")
        } as unknown as FernIr.SdkRequestShape);
        const contents = generateOAuthWireTest(endpoint);
        expect(contents).toContain("GetTokenRequest{");
    });
});
