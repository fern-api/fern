import urlJoin from "url-join";

import { FernWorkspace } from "@fern-api/api-workspace-commons";
import { isNonNullish, isPlainObject } from "@fern-api/core-utils";
import {
    RawSchemas,
    isInlineRequestBody,
    parseBytesRequest,
    parseRawFileType,
    visitExampleResponseSchema
} from "@fern-api/fern-definition-schema";
import {
    ExampleEndpointCall,
    ExampleEndpointSuccessResponse,
    ExampleHeader,
    ExampleInlinedRequestBodyProperty,
    ExamplePathParameter,
    ExampleQueryParameterShape,
    ExampleRequestBody,
    ExampleResponse,
    Name
} from "@fern-api/ir-sdk";

import { FernFileContext } from "../../FernFileContext";
import { ErrorResolver } from "../../resolvers/ErrorResolver";
import { ExampleResolver } from "../../resolvers/ExampleResolver";
import { TypeResolver } from "../../resolvers/TypeResolver";
import { VariableResolver } from "../../resolvers/VariableResolver";
import { getEndpointPathParameters } from "../../utils/getEndpointPathParameters";
import { hashJSON } from "../../utils/hashJSON";
import { parseErrorName } from "../../utils/parseErrorName";
import {
    convertTypeReferenceExample,
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
        properties: exampleProperties
    });
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
            // TODO: should we URL encode the value?
            url = url.replaceAll(`{${parameter.name.originalName}}`, `${parameter.value.jsonExample}`);
        }
    }
    // urlJoin has some bugs where it may miss forward slash concatting https://github.com/jfromaniello/url-join/issues/42
    url = url.replaceAll("//", "/");
    // for backwards compatiblity we always make sure that the url stats with a slash
    if (!url.startsWith("/")) {
        url = `/${url}`;
    }
    return url;
}
