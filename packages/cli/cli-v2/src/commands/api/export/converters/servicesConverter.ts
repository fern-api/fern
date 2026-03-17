import { isNonNullish } from "@fern-api/core-utils";
import {
    ContainerType,
    type EnvironmentsConfig,
    type ErrorDeclaration,
    type ErrorDiscriminationByPropertyStrategy,
    ErrorDiscriminationStrategy,
    type ExampleEndpointCall,
    type ExampleInlinedRequestBodyProperty,
    FileUploadRequestProperty,
    type HttpEndpoint,
    type HttpHeader,
    HttpMethod,
    type HttpPath,
    HttpRequestBody,
    type HttpResponse,
    type HttpService,
    type IntermediateRepresentation,
    type PathParameter,
    type QueryParameter,
    type ResponseError,
    type ResponseErrors,
    type TypeDeclaration,
    TypeReference
} from "@fern-api/ir-sdk";
import { OpenAPIV3 } from "openapi-types";

import { getDeclaredNameKey } from "../convertIrToOpenApi.js";
import { convertObject } from "./convertObject.js";
import { convertTypeReference, type OpenApiComponentSchema } from "./typeConverter.js";

function joinUrlPaths(...segments: string[]): string {
    return segments
        .map((segment, index) => {
            let s = segment;
            if (index > 0) {
                s = s.replace(/^\/+/, "");
            }
            if (index < segments.length - 1) {
                s = s.replace(/\/+$/, "");
            }
            return s;
        })
        .filter((s) => s.length > 0)
        .join("/");
}

/**
 * Collect OpenAPI examples from endpoint example calls. The `extractValue` function
 * should return the example value for a given example call, or `undefined` to skip it.
 */
function collectExamples(
    examples: ExampleEndpointCall[],
    extractValue: (example: ExampleEndpointCall) => unknown | undefined
): OpenAPIV3.MediaTypeObject["examples"] | undefined {
    const result: NonNullable<OpenAPIV3.MediaTypeObject["examples"]> = {};
    for (const example of examples) {
        const value = extractValue(example);
        if (value === undefined) {
            continue;
        }
        const key =
            example.name && example.name.originalName !== ""
                ? example.name.originalName
                : `Example${Object.keys(result).length + 1}`;
        result[key] = { value };
    }
    return Object.keys(result).length > 0 ? result : undefined;
}

export function convertServices({
    ir,
    httpServices,
    typesByName,
    errorsByName,
    errorDiscriminationStrategy,
    security,
    environments
}: {
    ir: IntermediateRepresentation;
    httpServices: HttpService[];
    typesByName: Record<string, TypeDeclaration>;
    errorsByName: Record<string, ErrorDeclaration>;
    errorDiscriminationStrategy: ErrorDiscriminationStrategy;
    security: OpenAPIV3.SecurityRequirementObject[];
    environments: EnvironmentsConfig | undefined;
}): OpenAPIV3.PathsObject {
    const paths: OpenAPIV3.PathsObject = {};
    httpServices.forEach((httpService) => {
        httpService.endpoints.forEach((httpEndpoint) => {
            const { fullPath, convertedHttpMethod, operationObject } = convertHttpEndpoint({
                ir,
                httpEndpoint,
                httpService,
                typesByName,
                errorsByName,
                errorDiscriminationStrategy,
                security,
                environments
            });
            const pathsObject = (paths[fullPath] ??= {});
            if (pathsObject[convertedHttpMethod] != null) {
                throw new Error(`Duplicate ${convertedHttpMethod} endpoint at ${fullPath}`);
            }
            pathsObject[convertedHttpMethod] = operationObject;
        });
    });
    return paths;
}

interface ConvertedHttpEndpoint {
    fullPath: string;
    convertedHttpMethod: OpenAPIV3.HttpMethods;
    operationObject: OpenAPIV3.OperationObject;
}

function convertHttpEndpoint({
    httpEndpoint,
    httpService,
    typesByName,
    errorsByName,
    errorDiscriminationStrategy,
    security,
    environments,
    ir
}: {
    ir: IntermediateRepresentation;
    httpEndpoint: HttpEndpoint;
    httpService: HttpService;
    typesByName: Record<string, TypeDeclaration>;
    errorsByName: Record<string, ErrorDeclaration>;
    errorDiscriminationStrategy: ErrorDiscriminationStrategy;
    security: OpenAPIV3.SecurityRequirementObject[];
    environments: EnvironmentsConfig | undefined;
}): ConvertedHttpEndpoint {
    let fullPath = joinUrlPaths(
        ir.basePath != null ? convertHttpPathToString(ir.basePath) : "",
        convertHttpPathToString(httpService.basePath),
        convertHttpPathToString(httpEndpoint.path)
    );
    fullPath = !fullPath.startsWith("/") ? `/${fullPath}` : fullPath;
    const convertedHttpMethod = convertHttpMethod(httpEndpoint.method);
    const examples = httpEndpoint.userSpecifiedExamples.map((ex) => ex.example).filter(isNonNullish);
    const convertedGlobalPathParameters = ir.pathParameters.map((pathParameter) =>
        convertPathParameter({ pathParameter, examples })
    );
    const convertedServicePathParameters = httpService.pathParameters.map((pathParameter) =>
        convertPathParameter({ pathParameter, examples })
    );
    const convertedEndpointPathParameters = httpEndpoint.pathParameters.map((pathParameter) =>
        convertPathParameter({ pathParameter, examples })
    );
    const convertedQueryParameters = httpEndpoint.queryParameters.map((queryParameter) =>
        convertQueryParameter({ queryParameter, typesByName, examples })
    );
    const convertedHeaders = httpEndpoint.headers.map((header) =>
        convertHeader({ httpHeader: header, typesByName, examples })
    );
    const parameters: OpenAPIV3.ParameterObject[] = [
        ...convertedGlobalPathParameters,
        ...convertedServicePathParameters,
        ...convertedEndpointPathParameters,
        ...convertedQueryParameters,
        ...convertedHeaders
    ];

    const tag = httpService.name.fernFilepath.allParts.map((name) => name.pascalCase.unsafeName).join("");
    const operationObject: OpenAPIV3.OperationObject = {
        description: httpEndpoint.docs ?? undefined,
        operationId: [
            ...httpService.name.fernFilepath.allParts.map((name) => name.camelCase.unsafeName),
            httpEndpoint.name.originalName
        ].join("_"),
        tags: [tag],
        parameters,
        responses: convertResponse({
            httpResponse: httpEndpoint.response,
            responseErrors: httpEndpoint.errors,
            errorsByName,
            errorDiscriminationStrategy,
            examples
        }),
        summary: httpEndpoint.displayName ?? undefined
    };

    if (httpEndpoint.baseUrl != null) {
        const baseUrlId = httpEndpoint.baseUrl;
        if (environments?.environments.type !== "multipleBaseUrls") {
            throw new Error("baseUrl is defined environments are not multipleBaseUrls");
        }
        operationObject.servers = environments.environments.environments.map((environment) => {
            const url = environment.urls[baseUrlId];
            if (url == null) {
                throw new Error("No URL defined for " + baseUrlId);
            }
            const server: OpenAPIV3.ServerObject = { url };
            if (environment.docs != null) {
                server.description = environment.docs;
            }
            return server;
        });
    }

    if (httpEndpoint.auth) {
        operationObject.security = security;
    }

    if (httpEndpoint.requestBody != null) {
        operationObject.requestBody = convertRequestBody({
            httpRequest: httpEndpoint.requestBody,
            typesByName,
            examples
        });
    }
    return {
        fullPath,
        convertedHttpMethod,
        operationObject
    };
}

function convertHttpMethod(httpMethod: HttpMethod): OpenAPIV3.HttpMethods {
    return HttpMethod._visit<OpenAPIV3.HttpMethods>(httpMethod, {
        get: () => {
            return OpenAPIV3.HttpMethods.GET;
        },
        post: () => {
            return OpenAPIV3.HttpMethods.POST;
        },
        put: () => {
            return OpenAPIV3.HttpMethods.PUT;
        },
        patch: () => {
            return OpenAPIV3.HttpMethods.PATCH;
        },
        delete: () => {
            return OpenAPIV3.HttpMethods.DELETE;
        },
        head: () => {
            return OpenAPIV3.HttpMethods.HEAD;
        },
        _other: () => {
            throw new Error("Encountered unknown http method: " + httpMethod);
        }
    });
}

function convertRequestBody({
    httpRequest,
    typesByName,
    examples
}: {
    httpRequest: HttpRequestBody;
    typesByName: Record<string, TypeDeclaration>;
    examples: ExampleEndpointCall[];
}): OpenAPIV3.RequestBodyObject {
    const requestExamples = collectExamples(examples, (example) => example.request?.jsonExample);

    return HttpRequestBody._visit<OpenAPIV3.RequestBodyObject>(httpRequest, {
        inlinedRequestBody: (inlinedRequestBody) => {
            const convertedRequest: OpenAPIV3.MediaTypeObject = {
                schema: convertObject({
                    docs: undefined,
                    properties: inlinedRequestBody.properties.map((property) => {
                        let exampleProperty: ExampleInlinedRequestBodyProperty | undefined = undefined;
                        if (examples.length > 0 && examples[0]?.request?.type === "inlinedRequestBody") {
                            exampleProperty = examples[0]?.request.properties.find((example) => {
                                return example.name.wireValue === property.name.wireValue;
                            });
                        }
                        return {
                            docs: property.docs ?? undefined,
                            name: property.name,
                            valueType: property.valueType,
                            example: exampleProperty
                        };
                    }),
                    extensions: inlinedRequestBody.extends
                })
            };

            if (requestExamples != null) {
                convertedRequest.examples = requestExamples;
            }

            return {
                required: true,
                content: {
                    "application/json": convertedRequest
                }
            };
        },
        reference: (reference) => {
            const convertedRequest: OpenAPIV3.MediaTypeObject = {
                schema: convertTypeReference(reference.requestBodyType)
            };
            if (requestExamples != null) {
                convertedRequest.examples = requestExamples;
            }
            return {
                description: reference.docs ?? undefined,
                required: isTypeReferenceRequired({ typeReference: reference.requestBodyType, typesByName }),
                content: {
                    "application/json": convertedRequest
                }
            };
        },
        fileUpload: (fileUploadRequest) => {
            return {
                required: true,
                content: {
                    "multipart/form-data": {
                        schema: {
                            type: "object",
                            properties: fileUploadRequest.properties.reduce<
                                Record<string, OpenAPIV3.ReferenceObject | OpenAPIV3.SchemaObject>
                            >((acc, property) => {
                                FileUploadRequestProperty._visit(property, {
                                    file: (fileProperty) => {
                                        acc[fileProperty.key.wireValue] = {
                                            type: "string",
                                            format: "binary"
                                        };
                                    },
                                    bodyProperty: (bodyProperty) => {
                                        acc[bodyProperty.name.wireValue] = {
                                            description: bodyProperty.docs ?? undefined,
                                            ...convertTypeReference(bodyProperty.valueType)
                                        };
                                    },
                                    _other: () => {
                                        throw new Error("Unknown FileUploadRequestProperty: " + property.type);
                                    }
                                });
                                return acc;
                            }, {})
                        }
                    }
                }
            };
        },
        bytes: (bytesRequest) => {
            const contentType = bytesRequest.contentType ?? "application/octet-stream";
            return {
                required: !bytesRequest.isOptional,
                description: bytesRequest.docs ?? undefined,
                content: {
                    [contentType]: {
                        schema: {
                            type: "string",
                            format: "binary"
                        }
                    }
                }
            };
        },
        _other: () => {
            throw new Error("Unknown HttpRequestBody type: " + httpRequest.type);
        }
    });
}

function convertResponse({
    httpResponse,
    responseErrors,
    errorsByName,
    errorDiscriminationStrategy,
    examples
}: {
    httpResponse: HttpResponse | null | undefined;
    responseErrors: ResponseErrors;
    errorsByName: Record<string, ErrorDeclaration>;
    errorDiscriminationStrategy: ErrorDiscriminationStrategy;
    examples: ExampleEndpointCall[];
}): Record<string, OpenAPIV3.ResponseObject> {
    const responseByStatusCode: Record<string, OpenAPIV3.ResponseObject> = {};
    if (httpResponse?.body?.type === "json") {
        const convertedResponse: OpenAPIV3.MediaTypeObject = {
            schema: convertTypeReference(httpResponse.body.value.responseBodyType)
        };

        const responseExamples = collectExamples(examples, (example) => {
            if (
                example.response.type === "ok" &&
                example.response.value.type === "body" &&
                example.response.value.value != null
            ) {
                return example.response.value.value.jsonExample;
            }
            return undefined;
        });
        if (responseExamples != null) {
            convertedResponse.examples = responseExamples;
        }

        responseByStatusCode[String(httpResponse.statusCode ?? 200)] = {
            description: httpResponse.body.value.docs ?? "",
            content: {
                "application/json": convertedResponse
            }
        };
    } else if (httpResponse?.body?.type === "fileDownload" || httpResponse?.body?.type === "bytes") {
        responseByStatusCode[String(httpResponse.statusCode ?? 200)] = {
            description: httpResponse.body.docs ?? "",
            content: {
                "application/octet-stream": {
                    schema: {
                        type: "string",
                        format: "binary"
                    }
                }
            }
        };
    } else if (httpResponse?.body?.type === "text") {
        responseByStatusCode[String(httpResponse.statusCode ?? 200)] = {
            description: httpResponse.body.docs ?? "",
            content: {
                "text/plain": {
                    schema: {
                        type: "string"
                    }
                }
            }
        };
    } else if (httpResponse?.body?.type === "streaming") {
        const streamingValue = httpResponse.body.value;
        let streamingContentType: string;
        switch (streamingValue.type) {
            case "sse":
                streamingContentType = "text/event-stream";
                break;
            case "json":
                streamingContentType = "application/jsonl";
                break;
            case "text":
                streamingContentType = "text/plain";
                break;
            default:
                streamingContentType = "application/octet-stream";
                break;
        }
        responseByStatusCode[String(httpResponse.statusCode ?? 200)] = {
            description: streamingValue.docs ?? "",
            content: {
                [streamingContentType]: {
                    schema: {
                        type: "string",
                        format: "binary"
                    }
                }
            }
        };
    } else {
        responseByStatusCode["204"] = {
            description: ""
        };
    }

    ErrorDiscriminationStrategy._visit(errorDiscriminationStrategy, {
        statusCode: () => {
            for (const responseError of responseErrors) {
                const errorDeclaration = errorsByName[getDeclaredNameKey(responseError.error)];
                if (errorDeclaration == null) {
                    throw new Error(
                        "Encountered undefined error declaration: " + responseError.error.name.originalName
                    );
                }
                const responseForStatusCode: OpenAPIV3.ResponseObject = {
                    description: responseError.docs ?? ""
                };
                if (errorDeclaration.type != null) {
                    const convertedResponse: OpenAPIV3.MediaTypeObject = {
                        schema: convertTypeReference(errorDeclaration.type)
                    };

                    const errorExamples = collectExamples(examples, (example) => {
                        if (
                            example.response.type === "error" &&
                            example.response.body != null &&
                            example.response.error.errorId === responseError.error.errorId
                        ) {
                            return example.response.body.jsonExample;
                        }
                        return undefined;
                    });
                    if (errorExamples != null) {
                        convertedResponse.examples = errorExamples;
                    }

                    responseForStatusCode.content = {
                        "application/json": convertedResponse
                    };
                }
                responseByStatusCode[errorDeclaration.statusCode] = responseForStatusCode;
            }
        },
        property: (property) => {
            const errorInfoByStatusCode: Record<string, ErrorInfo[]> = getErrorInfoByStatusCode({
                responseErrors,
                errorsByName
            });
            for (const statusCode of Object.keys(errorInfoByStatusCode)) {
                const errorInfos = errorInfoByStatusCode[statusCode];
                if (errorInfos == null || errorInfos.length === 0) {
                    continue;
                }

                const convertedResponse: OpenAPIV3.MediaTypeObject = {
                    schema: {
                        oneOf: errorInfos.map((errorInfo) =>
                            getDiscriminatedErrorInfoOpenApiSchema({
                                errorInfo,
                                property
                            })
                        )
                    }
                };

                const discriminatedErrorExamples = collectExamples(examples, (example) => {
                    if (example.response.type === "error" && example.response.body != null) {
                        const errorForExample = example.response.error;
                        if (
                            errorInfos.some(
                                (errorInfo) => errorInfo.errorDeclaration.name.errorId === errorForExample.errorId
                            )
                        ) {
                            return example.response.body.jsonExample;
                        }
                    }
                    return undefined;
                });
                if (discriminatedErrorExamples != null) {
                    convertedResponse.examples = discriminatedErrorExamples;
                }

                responseByStatusCode[statusCode] = {
                    description: "",
                    content: {
                        "application/json": convertedResponse
                    }
                };
            }
        },
        _other: () => {
            throw new Error("Unknown error discrimination strategy: " + errorDiscriminationStrategy.type);
        }
    });
    return responseByStatusCode;
}

function getDiscriminatedErrorInfoOpenApiSchema({
    errorInfo,
    property
}: {
    errorInfo: ErrorInfo;
    property: ErrorDiscriminationByPropertyStrategy;
}): OpenAPIV3.SchemaObject {
    const discriminantValue = errorInfo.errorDeclaration.discriminantValue.wireValue;
    const description = errorInfo.responseError.docs ?? undefined;

    const properties: Record<string, OpenApiComponentSchema> = {
        [property.discriminant.wireValue]: {
            type: "string",
            enum: [discriminantValue]
        }
    };

    if (errorInfo.errorDeclaration.type != null) {
        properties[property.contentProperty.wireValue] = convertTypeReference(errorInfo.errorDeclaration.type);
    }

    return {
        type: "object",
        description,
        properties
    };
}

interface ErrorInfo {
    responseError: ResponseError;
    errorDeclaration: ErrorDeclaration;
}

function getErrorInfoByStatusCode({
    responseErrors,
    errorsByName
}: {
    responseErrors: ResponseErrors;
    errorsByName: Record<string, ErrorDeclaration>;
}): Record<string, ErrorInfo[]> {
    const errorInfoByStatusCode: Record<string, ErrorInfo[]> = {};
    for (const responseError of responseErrors) {
        const errorDeclaration = errorsByName[getDeclaredNameKey(responseError.error)];
        if (errorDeclaration == null) {
            throw new Error("Encountered undefined error declaration: " + responseError.error.name.originalName);
        }
        const statusCode = errorDeclaration.statusCode;
        const statusCodeErrorInfo = errorInfoByStatusCode[statusCode];
        if (statusCodeErrorInfo == null) {
            errorInfoByStatusCode[statusCode] = [{ responseError, errorDeclaration }];
        } else {
            statusCodeErrorInfo.push({ responseError, errorDeclaration });
        }
    }
    return errorInfoByStatusCode;
}

function convertPathParameter({
    pathParameter,
    examples
}: {
    pathParameter: PathParameter;
    examples: ExampleEndpointCall[];
}): OpenAPIV3.ParameterObject {
    const convertedParameter: OpenAPIV3.ParameterObject = {
        name: pathParameter.name.originalName,
        in: "path",
        description: pathParameter.docs ?? undefined,
        required: true,
        schema: convertTypeReference(pathParameter.valueType)
    };

    const openapiExamples = collectExamples(examples, (example) => {
        const match = [
            ...example.rootPathParameters,
            ...example.servicePathParameters,
            ...example.endpointPathParameters
        ].find((param) => param.name.originalName === pathParameter.name.originalName);
        return match?.value.jsonExample;
    });
    if (openapiExamples != null) {
        convertedParameter.examples = openapiExamples;
        const firstExample = Object.values(openapiExamples)[0];
        if (firstExample != null && "value" in firstExample) {
            convertedParameter.example = firstExample.value;
        }
    }

    return convertedParameter;
}

function convertQueryParameter({
    queryParameter,
    typesByName,
    examples
}: {
    queryParameter: QueryParameter;
    typesByName: Record<string, TypeDeclaration>;
    examples: ExampleEndpointCall[];
}): OpenAPIV3.ParameterObject {
    const convertedParameter: OpenAPIV3.ParameterObject = {
        name: queryParameter.name.wireValue,
        in: "query",
        description: queryParameter.docs ?? undefined,
        required: isTypeReferenceRequired({ typeReference: queryParameter.valueType, typesByName }),
        schema: queryParameter.allowMultiple
            ? convertTypeReference(TypeReference.container(ContainerType.list(queryParameter.valueType)))
            : convertTypeReference(queryParameter.valueType)
    };

    const openapiExamples = collectExamples(examples, (example) => {
        const match = example.queryParameters.find((param) => param.name.wireValue === queryParameter.name.wireValue);
        return match?.value.jsonExample;
    });
    if (openapiExamples != null) {
        convertedParameter.examples = openapiExamples;
        const firstExample = Object.values(openapiExamples)[0];
        if (firstExample != null && "value" in firstExample) {
            convertedParameter.example = firstExample.value;
        }
    }

    return convertedParameter;
}

function convertHeader({
    httpHeader,
    typesByName,
    examples
}: {
    httpHeader: HttpHeader;
    typesByName: Record<string, TypeDeclaration>;
    examples: ExampleEndpointCall[];
}): OpenAPIV3.ParameterObject {
    const convertedParameter: OpenAPIV3.ParameterObject = {
        name: httpHeader.name.wireValue,
        in: "header",
        description: httpHeader.docs ?? undefined,
        required: isTypeReferenceRequired({ typeReference: httpHeader.valueType, typesByName }),
        schema: convertTypeReference(httpHeader.valueType)
    };

    const openapiExamples = collectExamples(examples, (example) => {
        const match = [...example.serviceHeaders, ...example.endpointHeaders].find(
            (headerFromExample) => headerFromExample.name.wireValue === httpHeader.name.wireValue
        );
        return match?.value.jsonExample;
    });
    if (openapiExamples != null) {
        convertedParameter.examples = openapiExamples;
        const firstExample = Object.values(openapiExamples)[0];
        if (firstExample != null && "value" in firstExample) {
            convertedParameter.example = firstExample.value;
        }
    }

    return convertedParameter;
}

function convertHttpPathToString(httpPath: HttpPath): string {
    let endpointPath = httpPath.head;
    for (const httpPathPart of httpPath.parts) {
        endpointPath += `{${httpPathPart.pathParameter}}${httpPathPart.tail}`;
    }
    return endpointPath;
}

function isTypeReferenceRequired({
    typeReference,
    typesByName
}: {
    typeReference: TypeReference;
    typesByName: Record<string, TypeDeclaration>;
}): boolean {
    if (typeReference.type === "container" && typeReference.container.type === "optional") {
        return false;
    } else if (typeReference.type === "named") {
        const key = getDeclaredNameKey(typeReference);
        const typeDeclaration = typesByName[key];
        if (typeDeclaration == null) {
            throw new Error("Encountered non-existent type: " + typeReference.name.originalName);
        }
        if (typeDeclaration.shape.type === "alias") {
            return isTypeReferenceRequired({ typeReference: typeDeclaration.shape.aliasOf, typesByName });
        }
    }
    return true;
}
