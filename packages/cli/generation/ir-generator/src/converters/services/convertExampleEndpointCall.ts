import { FernWorkspace } from "@fern-api/api-workspace-commons";
import { isNonNullish, isPlainObject } from "@fern-api/core-utils";
import {
    isInlineRequestBody,
    parseBytesRequest,
    parseRawFileType,
    RawSchemas,
    visitExampleResponseSchema
} from "@fern-api/fern-definition-schema";
import {
    ExampleEndpointCall,
    ExampleEndpointSuccessResponse,
    ExampleFile,
    ExampleFileProperty,
    ExampleFileSingle,
    ExampleHeader,
    ExampleInlinedRequestBodyExtraProperty,
    ExampleInlinedRequestBodyProperty,
    ExamplePathParameter,
    ExampleQueryParameterShape,
    ExampleRequestBody,
    ExampleResponse,
    Name
} from "@fern-api/ir-sdk";
import { hashJSON } from "@fern-api/ir-utils";
import urlJoin from "url-join";

import { FernFileContext } from "../../FernFileContext";
import { ErrorResolver } from "../../resolvers/ErrorResolver";
import { ExampleResolver } from "../../resolvers/ExampleResolver";
import { TypeResolver } from "../../resolvers/TypeResolver";
import { VariableResolver } from "../../resolvers/VariableResolver";
import { getEndpointPathParameters } from "../../utils/getEndpointPathParameters";
import { parseErrorName } from "../../utils/parseErrorName";
import {
    convertTypeReferenceExample,
    convertUnknownExample,
    getOriginalTypeDeclarationForPropertyFromExtensions
} from "../type-declarations/convertExampleType";
import { getPropertyName } from "../type-declarations/convertObjectTypeDeclaration";
import { getHeaderName, resolvePathParameterOrThrow } from "./convertHttpService";
import { getQueryParameterName } from "./convertQueryParameter";

export function convertExampleEndpointCall({
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
}): ExampleEndpointCall {
    const convertedPathParameters = convertPathParameters({
        service,
        endpoint,
        example,
        typeResolver,
        exampleResolver,
        variableResolver,
        file,
        workspace
    });
    return {
        id: example.name ?? hashJSON(example),
        name: example.name != null ? file.casingsGenerator.generateName(example.name) : undefined,
        docs: example.docs,
        url: buildUrl({ file, service, endpoint, example, pathParams: convertedPathParameters }),
        ...convertedPathParameters,
        ...convertHeaders({ service, endpoint, example, typeResolver, exampleResolver, file, workspace }),
        queryParameters:
            example["query-parameters"] != null
                ? Object.entries(example["query-parameters"]).map(([wireKey, value]) => {
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
                          value: convertTypeReferenceExample({
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
                          }),
                          shape: getQueryParamaterDeclationShape({ queryParameter: queryParameterDeclaration })
                      };
                  })
                : [],
        request: convertExampleRequestBody({ endpoint, example, typeResolver, exampleResolver, file, workspace }),
        response: convertExampleResponse({
            endpoint,
            example,
            typeResolver,
            errorResolver,
            exampleResolver,
            file,
            workspace
        })
    };
}

function getQueryParamaterDeclationShape({ queryParameter }: { queryParameter: RawSchemas.HttpQueryParameterSchema }) {
    const isAllowMultiple =
        typeof queryParameter !== "string" && queryParameter["allow-multiple"] != null
            ? queryParameter["allow-multiple"]
            : false;
    return isAllowMultiple ? ExampleQueryParameterShape.exploded() : ExampleQueryParameterShape.single();
}

function convertPathParameters({
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
}): Pick<ExampleEndpointCall, "rootPathParameters" | "endpointPathParameters" | "servicePathParameters"> {
    const rootPathParameters: ExamplePathParameter[] = [];
    const servicePathParameters: ExamplePathParameter[] = [];
    const endpointPathParameters: ExamplePathParameter[] = [];

    const buildExamplePathParameter = ({
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
            value: convertTypeReferenceExample({
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
        const rawEndpointPathParameters = getEndpointPathParameters(endpoint);
        for (const [key, examplePathParameter] of Object.entries(example["path-parameters"])) {
            const rootPathParameterDeclaration = file.rootApiFile["path-parameters"]?.[key];
            const servicePathParameterDeclaration = service["path-parameters"]?.[key];
            const endpointPathParameterDeclaration = rawEndpointPathParameters[key];

            if (rootPathParameterDeclaration != null) {
                rootPathParameters.push(
                    buildExamplePathParameter({
                        name: file.casingsGenerator.generateName(key),
                        pathParameterDeclaration: rootPathParameterDeclaration,
                        examplePathParameter
                    })
                );
            } else if (endpointPathParameterDeclaration != null) {
                endpointPathParameters.push(
                    buildExamplePathParameter({
                        name: file.casingsGenerator.generateName(key),
                        pathParameterDeclaration: endpointPathParameterDeclaration,
                        examplePathParameter
                    })
                );
            } else if (servicePathParameterDeclaration != null) {
                servicePathParameters.push(
                    buildExamplePathParameter({
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

function convertHeaders({
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
}): Pick<ExampleEndpointCall, "endpointHeaders" | "serviceHeaders"> {
    const serviceHeaders: ExampleHeader[] = [];
    const endpointHeaders: ExampleHeader[] = [];

    if (example.headers != null) {
        for (const [wireKey, exampleHeader] of Object.entries(example.headers)) {
            const endpointHeaderDeclaration =
                typeof endpoint.request !== "string" ? endpoint.request?.headers?.[wireKey] : undefined;
            const serviceHeaderDeclaration = service.headers?.[wireKey];

            // TODO: add global headers field in ExampleEndpointCall
            // const globalHeaderDeclaration = workspace.definition.rootApiFile.contents.headers?.[wireKey];
            if (endpointHeaderDeclaration != null) {
                endpointHeaders.push({
                    name: file.casingsGenerator.generateNameAndWireValue({
                        name: getHeaderName({ headerKey: wireKey, header: endpointHeaderDeclaration }).name,
                        wireValue: wireKey
                    }),
                    value: convertTypeReferenceExample({
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
                    value: convertTypeReferenceExample({
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
            }
            // TODO: add global headers field in ExampleEndpointCall
            // else if (globalHeaderDeclaration != null) {
            //     // TODO: tweak ExampleEndpointCall to include global headers
            //     endpointHeaders.push({
            //         name: file.casingsGenerator.generateNameAndWireValue({
            //             name: getHeaderName({ headerKey: wireKey, header: globalHeaderDeclaration }).name,
            //             wireValue: wireKey
            //         }),
            //         value: convertTypeReferenceExample({
            //             example: exampleHeader,
            //             rawTypeBeingExemplified:
            //                 typeof globalHeaderDeclaration === "string"
            //                     ? globalHeaderDeclaration
            //                     : globalHeaderDeclaration.type,
            //             typeResolver,
            //             exampleResolver,
            //             fileContainingRawTypeReference: file,
            //             fileContainingExample: file,
            //             workspace
            //         })
            //     });
            // }
        }
    }

    return {
        endpointHeaders,
        serviceHeaders
    };
}

function convertExampleRequestBody({
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
}): ExampleRequestBody | undefined {
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
            convertTypeReferenceExample({
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

    // Check if this is a file upload request by looking for file properties
    const hasFileProperties = Object.entries(requestType.properties ?? {}).some(([_, propertyDeclaration]) => {
        const propertyType = typeof propertyDeclaration === "string" ? propertyDeclaration : propertyDeclaration?.type;
        return propertyType != null && parseRawFileType(propertyType) != null;
    });

    if (hasFileProperties) {
        const exampleFileProperties: ExampleFileProperty[] = [];
        const exampleProperties: ExampleInlinedRequestBodyProperty[] = [];

        for (const [wireKey, propertyExample] of Object.entries(example.request)) {
            const inlinedRequestPropertyDeclaration = requestType.properties?.[wireKey];
            const inlinedRequestPropertyType =
                typeof inlinedRequestPropertyDeclaration === "string"
                    ? inlinedRequestPropertyDeclaration
                    : inlinedRequestPropertyDeclaration?.type;

            if (inlinedRequestPropertyType != null && parseRawFileType(inlinedRequestPropertyType) != null) {
                const fileType = parseRawFileType(inlinedRequestPropertyType);
                if (fileType != null && inlinedRequestPropertyDeclaration != null) {
                    const exampleFile = convertExampleFile({ propertyExample, fileType });
                    if (exampleFile != null) {
                        exampleFileProperties.push({
                            name: file.casingsGenerator.generateNameAndWireValue({
                                name: getPropertyName({
                                    propertyKey: wireKey,
                                    property: inlinedRequestPropertyDeclaration
                                }).name,
                                wireValue: wireKey
                            }),
                            value: exampleFile
                        });
                    }
                }
            } else if (inlinedRequestPropertyDeclaration != null) {
                exampleProperties.push({
                    name: file.casingsGenerator.generateNameAndWireValue({
                        name: getPropertyName({ propertyKey: wireKey, property: inlinedRequestPropertyDeclaration })
                            .name,
                        wireValue: wireKey
                    }),
                    value: convertTypeReferenceExample({
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
            }
        }

        return ExampleRequestBody.fileUpload({
            jsonExample: exampleResolver.resolveAllReferencesInExampleOrThrow({ example: example.request, file })
                .resolvedExample,
            files: exampleFileProperties,
            properties: exampleProperties
        });
    }

    const exampleProperties: ExampleInlinedRequestBodyProperty[] = [];
    const exampleExtraProperties: ExampleInlinedRequestBodyExtraProperty[] = [];
    for (const [wireKey, propertyExample] of Object.entries(example.request)) {
        const inlinedRequestPropertyDeclaration = requestType.properties?.[wireKey];
        const inlinedRequestPropertyType =
            typeof inlinedRequestPropertyDeclaration === "string"
                ? inlinedRequestPropertyDeclaration
                : inlinedRequestPropertyDeclaration?.type;
        if (inlinedRequestPropertyType != null && parseRawFileType(inlinedRequestPropertyType) != null) {
            // HACK skip file properties (should not reach here since we check hasFileProperties above)
            continue;
        }
        if (inlinedRequestPropertyDeclaration != null) {
            exampleProperties.push({
                name: file.casingsGenerator.generateNameAndWireValue({
                    name: getPropertyName({ propertyKey: wireKey, property: inlinedRequestPropertyDeclaration }).name,
                    wireValue: wireKey
                }),
                value: convertTypeReferenceExample({
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
            const originalTypeDeclaration = getOriginalTypeDeclarationForPropertyFromExtensions({
                extends_: requestType.extends,
                wirePropertyKey: wireKey,
                typeResolver,
                file
            });
            if (originalTypeDeclaration == null) {
                if (requestType["extra-properties"] === true) {
                    exampleExtraProperties.push({
                        name: file.casingsGenerator.generateNameAndWireValue({
                            name: wireKey,
                            wireValue: wireKey
                        }),
                        value: {
                            jsonExample: propertyExample,
                            shape: convertUnknownExample({
                                example: propertyExample
                            })
                        }
                    });
                    continue;
                }
                throw new Error("Could not find original type declaration for property: " + wireKey);
            }
            exampleProperties.push({
                name: file.casingsGenerator.generateNameAndWireValue({
                    name: getPropertyName({ propertyKey: wireKey, property: originalTypeDeclaration.rawPropertyType })
                        .name,
                    wireValue: wireKey
                }),
                value: convertTypeReferenceExample({
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
        jsonExample: exampleResolver.resolveAllReferencesInExampleOrThrow({ example: example.request, file })
            .resolvedExample,
        properties: exampleProperties,
        extraProperties: exampleExtraProperties.length > 0 ? exampleExtraProperties : undefined
    });
}

function convertExampleFile({
    propertyExample,
    fileType
}: {
    propertyExample: unknown;
    fileType: { isArray: boolean };
}): ExampleFile | undefined {
    if (fileType.isArray) {
        if (!Array.isArray(propertyExample)) {
            return undefined;
        }
        const files: ExampleFileSingle[] = [];
        for (const item of propertyExample) {
            const singleFile = convertExampleFileSingle(item);
            if (singleFile != null) {
                files.push(singleFile);
            }
        }
        return files.length > 0 ? ExampleFile.array(files) : undefined;
    } else {
        const singleFile = convertExampleFileSingle(propertyExample);
        return singleFile != null ? ExampleFile.single(singleFile) : undefined;
    }
}

function convertExampleFileSingle(example: unknown): ExampleFileSingle | undefined {
    if (typeof example === "string") {
        return {
            filename: example,
            contentType: undefined
        };
    } else if (isPlainObject(example) && typeof example.filename === "string") {
        return {
            filename: example.filename,
            contentType: typeof example.contentType === "string" ? example.contentType : undefined
        };
    }
    return undefined;
}

function convertExampleResponse({
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
}): ExampleResponse {
    if (example.response == null) {
        return ExampleResponse.ok(ExampleEndpointSuccessResponse.body(undefined));
    }
    return visitExampleResponseSchema(endpoint, example.response, {
        body: (example) => {
            if (example.error != null) {
                const errorDeclaration = errorResolver.getDeclarationOrThrow(example.error, file);
                return ExampleResponse.error({
                    error: parseErrorName({
                        errorName: example.error,
                        file
                    }),
                    body:
                        errorDeclaration.declaration.type != null
                            ? convertTypeReferenceExample({
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
                    convertExampleResponseBody({ endpoint, example, typeResolver, exampleResolver, file, workspace })
                )
            );
        },
        stream: (example) => {
            const rawTypeBeingExemplified =
                typeof endpoint["response-stream"] === "string"
                    ? endpoint["response-stream"]
                    : endpoint["response-stream"]?.type;
            return ExampleResponse.ok(
                ExampleEndpointSuccessResponse.stream(
                    example.stream
                        .map((data) => {
                            if (rawTypeBeingExemplified == null) {
                                return undefined;
                            }

                            return convertTypeReferenceExample({
                                example: data,
                                rawTypeBeingExemplified,
                                typeResolver,
                                exampleResolver,
                                fileContainingRawTypeReference: file,
                                fileContainingExample: file,
                                workspace
                            });
                        })
                        .filter(isNonNullish)
                )
            );
        },
        events: (example) => {
            const rawTypeBeingExemplified =
                typeof endpoint["response-stream"] === "string"
                    ? endpoint["response-stream"]
                    : endpoint["response-stream"]?.type;
            return ExampleResponse.ok(
                ExampleEndpointSuccessResponse.sse(
                    example.stream
                        .map(({ event, data }) => {
                            if (rawTypeBeingExemplified == null) {
                                return undefined;
                            }

                            const convertedExample = convertTypeReferenceExample({
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
                        .filter(isNonNullish)
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
    file,
    service,
    endpoint,
    example,
    pathParams
}: {
    file: FernFileContext;
    service: RawSchemas.HttpServiceSchema;
    endpoint: RawSchemas.HttpEndpointSchema;
    example: RawSchemas.ExampleEndpointCallSchema;
    pathParams: Pick<ExampleEndpointCall, "rootPathParameters" | "endpointPathParameters" | "servicePathParameters">;
}): string {
    let url = urlJoin(file.rootApiFile["base-path"] ?? "", service["base-path"], endpoint.path);
    if (example["path-parameters"] != null) {
        for (const parameter of [
            ...pathParams.endpointPathParameters,
            ...pathParams.servicePathParameters,
            ...pathParams.rootPathParameters
        ]) {
            url = url.replaceAll(
                `{${parameter.name.originalName}}`,
                encodeURIComponent(`${parameter.value.jsonExample}`)
            );
        }
    }
    // urlJoin has some bugs where it may miss forward slash concatting https://github.com/jfromaniello/url-join/issues/42
    url = url.replaceAll("//", "/");
    // for backwards compatibility we always make sure that the url stats with a slash
    if (!url.startsWith("/")) {
        url = `/${url}`;
    }
    return url;
}
