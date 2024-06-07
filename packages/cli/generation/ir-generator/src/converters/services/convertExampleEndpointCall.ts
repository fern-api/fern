import { isNonNullish, isPlainObject } from "@fern-api/core-utils";
import {
    ExampleCodeSample,
    ExampleEndpointCall,
    ExampleEndpointSuccessResponse,
    ExampleHeader,
    ExampleInlinedRequestBodyProperty,
    ExamplePathParameter,
    ExampleRequestBody,
    ExampleResponse,
    HttpEndpointExample,
    Name,
    SupportedSdkLanguage
} from "@fern-api/ir-sdk";
import { FernWorkspace } from "@fern-api/workspace-loader";
import {
    isInlineRequestBody,
    parseBytesRequest,
    parseRawFileType,
    RawSchemas,
    visitExampleCodeSampleSchema,
    visitExampleResponseSchema
} from "@fern-api/yaml-schema";
import { FernFileContext } from "../../FernFileContext";
import { ErrorResolver } from "../../resolvers/ErrorResolver";
import { ExampleResolver } from "../../resolvers/ExampleResolver";
import { TypeResolver } from "../../resolvers/TypeResolver";
import { VariableResolver } from "../../resolvers/VariableResolver";
import { parseErrorName } from "../../utils/parseErrorName";
import {
    convertTypeReferenceExample,
    getOriginalTypeDeclarationForPropertyFromExtensions
} from "../type-declarations/convertExampleType";
import { getPropertyName } from "../type-declarations/convertObjectTypeDeclaration";
import { getHeaderName, resolvePathParameterOrThrow } from "./convertHttpService";
import { getQueryParameterName } from "./convertQueryParameter";

export async function convertExampleEndpointCall({
    service,
    endpoint,
    example,
    typeResolver,
    errorResolver,
    exampleResolver,
    variableResolver,
    file,
    workspace
}: {
    service: RawSchemas.HttpServiceSchema;
    endpoint: RawSchemas.HttpEndpointSchema;
    example: RawSchemas.ExampleEndpointCallSchema;
    typeResolver: TypeResolver;
    errorResolver: ErrorResolver;
    exampleResolver: ExampleResolver;
    variableResolver: VariableResolver;
    file: FernFileContext;
    workspace: FernWorkspace;
}): Promise<HttpEndpointExample> {
    const convertedPathParameters = await convertPathParameters({
        service,
        endpoint,
        example,
        typeResolver,
        exampleResolver,
        variableResolver,
        file,
        workspace
    });
    return HttpEndpointExample.userProvided({
        id: example.id,
        name: example.name != null ? file.casingsGenerator.generateName(example.name) : undefined,
        docs: example.docs,
        url: buildUrl({ service, endpoint, example, pathParams: convertedPathParameters }),
        ...convertedPathParameters,
        ...(await convertHeaders({ service, endpoint, example, typeResolver, exampleResolver, file, workspace })),
        queryParameters:
            example["query-parameters"] != null
                ? await Promise.all(
                      Object.entries(example["query-parameters"]).map(async ([wireKey, value]) => {
                          const queryParameterDeclaration =
                              typeof endpoint.request !== "string"
                                  ? endpoint.request?.["query-parameters"]?.[wireKey]
                                  : undefined;
                          if (queryParameterDeclaration == null) {
                              throw new Error(`Query parameter ${wireKey} does not exist`);
                          }
                          return {
                              name: file.casingsGenerator.generateNameAndWireValue({
                                  name: getQueryParameterName({
                                      queryParameterKey: wireKey,
                                      queryParameter: queryParameterDeclaration
                                  }).name,
                                  wireValue: wireKey
                              }),
                              value: await convertTypeReferenceExample({
                                  example: value,
                                  rawTypeBeingExemplified:
                                      typeof queryParameterDeclaration === "string"
                                          ? queryParameterDeclaration
                                          : queryParameterDeclaration.type,
                                  typeResolver,
                                  exampleResolver,
                                  fileContainingRawTypeReference: file,
                                  fileContainingExample: file,
                                  workspace
                              })
                          };
                      })
                  )
                : [],
        request: await convertExampleRequestBody({ endpoint, example, typeResolver, exampleResolver, file, workspace }),
        response: await convertExampleResponse({
            endpoint,
            example,
            typeResolver,
            errorResolver,
            exampleResolver,
            file,
            workspace
        }),
        codeSamples: example["code-samples"]?.map((codeSample) => {
            return visitExampleCodeSampleSchema<ExampleCodeSample>(codeSample, {
                language: (languageScheme) =>
                    ExampleCodeSample.language({
                        name:
                            languageScheme.name != null
                                ? file.casingsGenerator.generateName(languageScheme.name)
                                : undefined,
                        docs: languageScheme.docs,
                        language: languageScheme.language,
                        code: languageScheme.code,
                        install: languageScheme.install
                    }),
                sdk: (sdkScheme) =>
                    ExampleCodeSample.sdk({
                        name: sdkScheme.name != null ? file.casingsGenerator.generateName(sdkScheme.name) : undefined,
                        docs: sdkScheme.docs,
                        sdk: removeSdkAlias(sdkScheme.sdk),
                        code: sdkScheme.code
                    })
            });
        })
    });
}

function removeSdkAlias(sdk: RawSchemas.SupportedSdkLanguageSchema): SupportedSdkLanguage {
    switch (sdk) {
        case "js":
            return "javascript";
        case "node":
            return "javascript";
        case "ts":
            return "typescript";
        case "nodets":
            return "typescript";
        case "golang":
            return "go";
        case "dotnet":
            return "csharp";
        case "c#":
            return "csharp";
        case "jvm":
            return "java";
        default:
            return sdk;
    }
}

async function convertPathParameters({
    service,
    endpoint,
    example,
    typeResolver,
    exampleResolver,
    variableResolver,
    file,
    workspace
}: {
    service: RawSchemas.HttpServiceSchema;
    endpoint: RawSchemas.HttpEndpointSchema;
    example: RawSchemas.ExampleEndpointCallSchema;
    typeResolver: TypeResolver;
    exampleResolver: ExampleResolver;
    variableResolver: VariableResolver;
    file: FernFileContext;
    workspace: FernWorkspace;
}): Promise<Pick<ExampleEndpointCall, "rootPathParameters" | "endpointPathParameters" | "servicePathParameters">> {
    const rootPathParameters: ExamplePathParameter[] = [];
    const servicePathParameters: ExamplePathParameter[] = [];
    const endpointPathParameters: ExamplePathParameter[] = [];

    const buildExamplePathParameter = async ({
        name,
        pathParameterDeclaration,
        examplePathParameter
    }: {
        name: Name;
        pathParameterDeclaration: RawSchemas.HttpPathParameterSchema;
        examplePathParameter: unknown;
    }) => {
        const resolvedPathParameter = resolvePathParameterOrThrow({
            parameter: pathParameterDeclaration,
            variableResolver,
            file
        });
        return {
            name,
            value: await convertTypeReferenceExample({
                example: examplePathParameter,
                rawTypeBeingExemplified: resolvedPathParameter.rawType,
                typeResolver,
                exampleResolver,
                fileContainingRawTypeReference: resolvedPathParameter.file,
                fileContainingExample: file,
                workspace
            })
        };
    };

    if (example["path-parameters"] != null) {
        for (const [key, examplePathParameter] of Object.entries(example["path-parameters"])) {
            const rootPathParameterDeclaration = file.rootApiFile["path-parameters"]?.[key];
            const servicePathParameterDeclaration = service["path-parameters"]?.[key];
            const endpointPathParameterDeclaration = endpoint["path-parameters"]?.[key];

            if (rootPathParameterDeclaration != null) {
                rootPathParameters.push(
                    await buildExamplePathParameter({
                        name: file.casingsGenerator.generateName(key),
                        pathParameterDeclaration: rootPathParameterDeclaration,
                        examplePathParameter
                    })
                );
            } else if (endpointPathParameterDeclaration != null) {
                endpointPathParameters.push(
                    await buildExamplePathParameter({
                        name: file.casingsGenerator.generateName(key),
                        pathParameterDeclaration: endpointPathParameterDeclaration,
                        examplePathParameter
                    })
                );
            } else if (servicePathParameterDeclaration != null) {
                servicePathParameters.push(
                    await buildExamplePathParameter({
                        name: file.casingsGenerator.generateName(key),
                        pathParameterDeclaration: servicePathParameterDeclaration,
                        examplePathParameter
                    })
                );
            } else {
                throw new Error(`Path parameter ${key} does not exist`);
            }
        }
    }

    return {
        rootPathParameters,
        endpointPathParameters,
        servicePathParameters
    };
}

async function convertHeaders({
    service,
    endpoint,
    example,
    typeResolver,
    exampleResolver,
    file,
    workspace
}: {
    service: RawSchemas.HttpServiceSchema;
    endpoint: RawSchemas.HttpEndpointSchema;
    example: RawSchemas.ExampleEndpointCallSchema;
    typeResolver: TypeResolver;
    exampleResolver: ExampleResolver;
    file: FernFileContext;
    workspace: FernWorkspace;
}): Promise<Pick<ExampleEndpointCall, "endpointHeaders" | "serviceHeaders">> {
    const serviceHeaders: ExampleHeader[] = [];
    const endpointHeaders: ExampleHeader[] = [];

    if (example.headers != null) {
        for (const [wireKey, exampleHeader] of Object.entries(example.headers)) {
            const endpointHeaderDeclaration =
                typeof endpoint.request !== "string" ? endpoint.request?.headers?.[wireKey] : undefined;
            const serviceHeaderDeclaration = service.headers?.[wireKey];
            if (endpointHeaderDeclaration != null) {
                endpointHeaders.push({
                    name: file.casingsGenerator.generateNameAndWireValue({
                        name: getHeaderName({ headerKey: wireKey, header: endpointHeaderDeclaration }).name,
                        wireValue: wireKey
                    }),
                    value: await convertTypeReferenceExample({
                        example: exampleHeader,
                        rawTypeBeingExemplified:
                            typeof endpointHeaderDeclaration === "string"
                                ? endpointHeaderDeclaration
                                : endpointHeaderDeclaration.type,
                        typeResolver,
                        exampleResolver,
                        fileContainingRawTypeReference: file,
                        fileContainingExample: file,
                        workspace
                    })
                });
            } else if (serviceHeaderDeclaration != null) {
                serviceHeaders.push({
                    name: file.casingsGenerator.generateNameAndWireValue({
                        name: getHeaderName({ headerKey: wireKey, header: serviceHeaderDeclaration }).name,
                        wireValue: wireKey
                    }),
                    value: await convertTypeReferenceExample({
                        example: exampleHeader,
                        rawTypeBeingExemplified:
                            typeof serviceHeaderDeclaration === "string"
                                ? serviceHeaderDeclaration
                                : serviceHeaderDeclaration.type,
                        typeResolver,
                        exampleResolver,
                        fileContainingRawTypeReference: file,
                        fileContainingExample: file,
                        workspace
                    })
                });
            } else {
                throw new Error(`Header ${wireKey} does not exist`);
            }
        }
    }

    return {
        endpointHeaders,
        serviceHeaders
    };
}

async function convertExampleRequestBody({
    endpoint,
    example,
    typeResolver,
    exampleResolver,
    file,
    workspace
}: {
    endpoint: RawSchemas.HttpEndpointSchema;
    example: RawSchemas.ExampleEndpointCallSchema;
    typeResolver: TypeResolver;
    exampleResolver: ExampleResolver;
    file: FernFileContext;
    workspace: FernWorkspace;
}): Promise<ExampleRequestBody | undefined> {
    const requestType = typeof endpoint.request !== "string" ? endpoint.request?.body : endpoint.request;
    if (requestType == null) {
        return undefined;
    }
    // (HACK: Skip bytes request example creation)
    if (typeof requestType === "string" && parseBytesRequest(requestType) != null) {
        return undefined;
    }

    if (!isInlineRequestBody(requestType)) {
        return ExampleRequestBody.reference(
            await convertTypeReferenceExample({
                example: example.request,
                rawTypeBeingExemplified: typeof requestType !== "string" ? requestType.type : requestType,
                typeResolver,
                exampleResolver,
                fileContainingRawTypeReference: file,
                fileContainingExample: file,
                workspace
            })
        );
    }

    if (!example.request) {
        return undefined;
    }

    if (!isPlainObject(example.request)) {
        throw new Error(`Example is not an object. Got: ${JSON.stringify(example.request)}`);
    }

    const exampleProperties: ExampleInlinedRequestBodyProperty[] = [];
    for (const [wireKey, propertyExample] of Object.entries(example.request)) {
        const inlinedRequestPropertyDeclaration = requestType.properties?.[wireKey];
        const inilnedRequestPropertyType =
            typeof inlinedRequestPropertyDeclaration === "string"
                ? inlinedRequestPropertyDeclaration
                : inlinedRequestPropertyDeclaration?.type;
        if (inilnedRequestPropertyType != null && parseRawFileType(inilnedRequestPropertyType) != null) {
            // HACK skip file properties
            continue;
        }
        if (inlinedRequestPropertyDeclaration != null) {
            exampleProperties.push({
                name: file.casingsGenerator.generateNameAndWireValue({
                    name: getPropertyName({ propertyKey: wireKey, property: inlinedRequestPropertyDeclaration }).name,
                    wireValue: wireKey
                }),
                value: await convertTypeReferenceExample({
                    example: propertyExample,
                    rawTypeBeingExemplified:
                        typeof inlinedRequestPropertyDeclaration !== "string"
                            ? inlinedRequestPropertyDeclaration.type
                            : inlinedRequestPropertyDeclaration,
                    typeResolver,
                    exampleResolver,
                    fileContainingRawTypeReference: file,
                    fileContainingExample: file,
                    workspace
                }),
                originalTypeDeclaration: undefined
            });
        } else {
            const originalTypeDeclaration = await getOriginalTypeDeclarationForPropertyFromExtensions({
                extends_: requestType.extends,
                wirePropertyKey: wireKey,
                typeResolver,
                file
            });
            if (originalTypeDeclaration == null) {
                throw new Error("Could not find original type declaration for property: " + wireKey);
            }
            exampleProperties.push({
                name: file.casingsGenerator.generateNameAndWireValue({
                    name: getPropertyName({ propertyKey: wireKey, property: originalTypeDeclaration.rawPropertyType })
                        .name,
                    wireValue: wireKey
                }),
                value: await convertTypeReferenceExample({
                    example: propertyExample,
                    rawTypeBeingExemplified:
                        typeof originalTypeDeclaration.rawPropertyType === "string"
                            ? originalTypeDeclaration.rawPropertyType
                            : originalTypeDeclaration.rawPropertyType.type,
                    typeResolver,
                    exampleResolver,
                    fileContainingRawTypeReference: originalTypeDeclaration.file,
                    fileContainingExample: file,
                    workspace
                }),
                originalTypeDeclaration: originalTypeDeclaration.typeName
            });
        }
    }

    return ExampleRequestBody.inlinedRequestBody({
        jsonExample: (await exampleResolver.resolveAllReferencesInExampleOrThrow({ example: example.request, file }))
            .resolvedExample,
        properties: exampleProperties
    });
}

async function convertExampleResponse({
    endpoint,
    example,
    typeResolver,
    errorResolver,
    exampleResolver,
    file,
    workspace
}: {
    endpoint: RawSchemas.HttpEndpointSchema;
    example: RawSchemas.ExampleEndpointCallSchema;
    typeResolver: TypeResolver;
    errorResolver: ErrorResolver;
    exampleResolver: ExampleResolver;
    file: FernFileContext;
    workspace: FernWorkspace;
}): Promise<ExampleResponse> {
    if (example.response == null) {
        return ExampleResponse.ok(ExampleEndpointSuccessResponse.body(undefined));
    }
    return await visitExampleResponseSchema(endpoint, example.response, {
        body: async (example) => {
            if (example.error != null) {
                const errorDeclaration = await errorResolver.getDeclarationOrThrow(example.error, file);
                return ExampleResponse.error({
                    error: parseErrorName({
                        errorName: example.error,
                        file
                    }),
                    body:
                        errorDeclaration.declaration.type != null
                            ? await convertTypeReferenceExample({
                                  example: example.body,
                                  rawTypeBeingExemplified: errorDeclaration.declaration.type,
                                  typeResolver,
                                  exampleResolver,
                                  fileContainingRawTypeReference: errorDeclaration.file,
                                  fileContainingExample: file,
                                  workspace
                              })
                            : undefined
                });
            }

            return ExampleResponse.ok(
                ExampleEndpointSuccessResponse.body(
                    await convertExampleResponseBody({
                        endpoint,
                        example,
                        typeResolver,
                        exampleResolver,
                        file,
                        workspace
                    })
                )
            );
        },
        stream: async (example) => {
            const rawTypeBeingExemplified =
                typeof endpoint["response-stream"] === "string"
                    ? endpoint["response-stream"]
                    : endpoint["response-stream"]?.type;
            return ExampleResponse.ok(
                ExampleEndpointSuccessResponse.stream(
                    (
                        await Promise.all(
                            example.stream.map(async (data) => {
                                if (rawTypeBeingExemplified == null) {
                                    return undefined;
                                }

                                return await convertTypeReferenceExample({
                                    example: data,
                                    rawTypeBeingExemplified,
                                    typeResolver,
                                    exampleResolver,
                                    fileContainingRawTypeReference: file,
                                    fileContainingExample: file,
                                    workspace
                                });
                            })
                        )
                    ).filter(isNonNullish)
                )
            );
        },
        events: async (example) => {
            const rawTypeBeingExemplified =
                typeof endpoint["response-stream"] === "string"
                    ? endpoint["response-stream"]
                    : endpoint["response-stream"]?.type;
            return ExampleResponse.ok(
                ExampleEndpointSuccessResponse.sse(
                    (
                        await Promise.all(
                            example.stream.map(async ({ event, data }) => {
                                if (rawTypeBeingExemplified == null) {
                                    return undefined;
                                }

                                const convertedExample = await convertTypeReferenceExample({
                                    example: data,
                                    rawTypeBeingExemplified,
                                    typeResolver,
                                    exampleResolver,
                                    fileContainingRawTypeReference: file,
                                    fileContainingExample: file,
                                    workspace
                                });

                                return { event, data: convertedExample };
                            })
                        )
                    ).filter(isNonNullish)
                )
            );
        }
    });
}

function convertExampleResponseBody({
    endpoint,
    example,
    typeResolver,
    exampleResolver,
    file,
    workspace
}: {
    endpoint: RawSchemas.HttpEndpointSchema;
    example: RawSchemas.ExampleBodyResponseSchema;
    typeResolver: TypeResolver;
    exampleResolver: ExampleResolver;
    file: FernFileContext;
    workspace: FernWorkspace;
}) {
    const responseBodyType = typeof endpoint.response !== "string" ? endpoint.response?.type : endpoint.response;
    if (responseBodyType == null) {
        return undefined;
    }
    if (example.body == null) {
        return undefined;
    }
    return convertTypeReferenceExample({
        example: example.body,
        rawTypeBeingExemplified: responseBodyType,
        typeResolver,
        exampleResolver,
        fileContainingRawTypeReference: file,
        fileContainingExample: file,
        workspace
    });
}

function buildUrl({
    service,
    endpoint,
    example,
    pathParams
}: {
    service: RawSchemas.HttpServiceSchema;
    endpoint: RawSchemas.HttpEndpointSchema;
    example: RawSchemas.ExampleEndpointCallSchema;
    pathParams: Pick<ExampleEndpointCall, "rootPathParameters" | "endpointPathParameters" | "servicePathParameters">;
}): string {
    let url = service["base-path"] + endpoint.path;
    if (example["path-parameters"] != null) {
        for (const parameter of [
            ...pathParams.endpointPathParameters,
            ...pathParams.servicePathParameters,
            ...pathParams.rootPathParameters
        ]) {
            // TODO: should we URL encode the value?
            url = url.replaceAll(`{${parameter.name.originalName}}`, `${parameter.value.jsonExample}`);
        }
    }
    return url;
}
