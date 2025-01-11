import { isEqual, size } from "lodash-es";
import { OpenAPIV3 } from "openapi-types";
import urlJoin from "url-join";

import { isNonNullish } from "@fern-api/core-utils";

import {
    ContainerType,
    EnvironmentsConfig,
    ErrorDeclaration,
    ErrorDiscriminationByPropertyStrategy,
    ErrorDiscriminationStrategy,
    ExampleEndpointCall,
    ExampleInlinedRequestBodyProperty,
    FileUploadRequestProperty,
    HttpEndpoint,
    HttpHeader,
    HttpMethod,
    HttpPath,
    HttpRequestBody,
    HttpResponse,
    HttpService,
    IntermediateRepresentation,
    PathParameter,
    QueryParameter,
    ResponseError,
    ResponseErrors,
    Type,
    TypeDeclaration,
    TypeReference
} from "@fern-fern/ir-sdk/api";

import { getDeclaredTypeNameKey, getErrorTypeNameKey } from "../convertToOpenApi";
import { Mode } from "../writeOpenApi";
import { convertObject } from "./convertObject";
import { OpenApiComponentSchema, convertTypeReference } from "./typeConverter";

export function convertServices({
    ir,
    httpServices,
    typesByName,
    errorsByName,
    errorDiscriminationStrategy,
    security,
    environments,
    mode
}: {
    ir: IntermediateRepresentation;
    httpServices: HttpService[];
    typesByName: Record<string, TypeDeclaration>;
    errorsByName: Record<string, ErrorDeclaration>;
    errorDiscriminationStrategy: ErrorDiscriminationStrategy;
    security: OpenAPIV3.SecurityRequirementObject[];
    environments: EnvironmentsConfig | undefined;
    mode: Mode;
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
                environments,
                mode
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
    mode,
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
    mode: Mode;
}): ConvertedHttpEndpoint {
    let fullPath = urlJoin(
        ir.basePath != null ? convertHttpPathToString(ir.basePath) : "",
        convertHttpPathToString(httpService.basePath),
        convertHttpPathToString(httpEndpoint.path)
    );
    fullPath = !fullPath.startsWith("/") ? `/${fullPath}` : fullPath;
    const convertedHttpMethod = convertHttpMethod(httpEndpoint.method);
    const convertedGlobalPathParameters = ir.pathParameters.map((pathParameter) =>
        convertPathParameter({
            pathParameter,
            examples: httpEndpoint.userSpecifiedExamples.map((ex) => ex.example).filter(isNonNullish) ?? []
        })
    );
    const convertedServicePathParameters = httpService.pathParameters.map((pathParameter) =>
        convertPathParameter({
            pathParameter,
            examples: httpEndpoint.userSpecifiedExamples.map((ex) => ex.example).filter(isNonNullish) ?? []
        })
    );
    const convertedEndpointPathParameters = httpEndpoint.pathParameters.map((pathParameter) =>
        convertPathParameter({
            pathParameter,
            examples: httpEndpoint.userSpecifiedExamples.map((ex) => ex.example).filter(isNonNullish) ?? []
        })
    );
    const convertedQueryParameters = httpEndpoint.queryParameters.map((queryParameter) =>
        convertQueryParameter({
            queryParameter,
            typesByName,
            examples: httpEndpoint.userSpecifiedExamples.map((ex) => ex.example).filter(isNonNullish) ?? []
        })
    );
    const convertedHeaders = httpEndpoint.headers.map((header) =>
        convertHeader({
            httpHeader: header,
            typesByName,
            examples: httpEndpoint.userSpecifiedExamples.map((ex) => ex.example).filter(isNonNullish) ?? []
        })
    );
    const parameters: OpenAPIV3.ParameterObject[] = [
        ...convertedGlobalPathParameters,
        ...convertedServicePathParameters,
        ...convertedEndpointPathParameters,
        ...convertedQueryParameters,
        ...convertedHeaders
    ];

    const tag =
        mode === "stoplight"
            ? (httpService.displayName ??
              httpService.name.fernFilepath.allParts.map((name) => name.originalName).join(" "))
            : httpService.name.fernFilepath.allParts.map((name) => name.pascalCase.unsafeName).join("");
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
            examples: httpEndpoint.userSpecifiedExamples.map((ex) => ex.example).filter(isNonNullish) ?? []
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
            examples: httpEndpoint.userSpecifiedExamples.map((ex) => ex.example).filter(isNonNullish) ?? []
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
    const openapiExamples: OpenAPIV3.MediaTypeObject["examples"] = {};
    for (const example of examples) {
        if (example.request != null) {
            if (example.name && example.name.originalName !== "") {
                openapiExamples[example.name.originalName] = {
                    value: example.request.jsonExample
                };
            } else {
                openapiExamples[`Example${size(openapiExamples) + 1}`] = {
                    value: example.request.jsonExample
                };
            }
        }
    }

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

            if (size(openapiExamples) > 0) {
                convertedRequest.examples = openapiExamples;
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
            if (size(openapiExamples) > 0) {
                convertedRequest.examples = openapiExamples;
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
                                        throw new Error("Unkonwn FileUploadRequestProperty: " + property.type);
                                    }
                                });
                                return {
                                    ...acc
                                };
                            }, {})
                        }
                    }
                }
            };
        },
        bytes: () => {
            throw new Error("bytes is not supported");
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

        const openapiExamples: OpenAPIV3.MediaTypeObject["examples"] = {};
        for (const example of examples) {
            if (
                example.response.type === "ok" &&
                example.response.value.type === "body" &&
                example.response.value.value != null
            ) {
                if (example.name && example.name.originalName !== "") {
                    openapiExamples[example.name.originalName] = {
                        value: example.response.value.value.jsonExample
                    };
                } else {
                    openapiExamples[`Example${size(openapiExamples) + 1}`] = {
                        value: example.response.value.value.jsonExample
                    };
                }
            }
        }
        if (size(openapiExamples) > 0) {
            convertedResponse.examples = openapiExamples;
        }

        responseByStatusCode["200"] = {
            description: httpResponse.body.value.docs ?? "",
            content: {
                "application/json": convertedResponse
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
                const errorDeclaration = errorsByName[getErrorTypeNameKey(responseError.error)];
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

                    const openapiExamples: OpenAPIV3.MediaTypeObject["examples"] = {};
                    for (const example of examples) {
                        if (
                            example.response.type === "error" &&
                            example.response.body != null &&
                            isEqual(responseError.error, example.response.error)
                        ) {
                            if (example.name && example.name.originalName !== "") {
                                openapiExamples[example.name.originalName] = {
                                    value: example.response.body.jsonExample
                                };
                            } else {
                                openapiExamples[`Example${size(openapiExamples) + 1}`] = {
                                    value: example.response.body.jsonExample
                                };
                            }
                        }
                    }
                    if (size(openapiExamples) > 0) {
                        convertedResponse.examples = openapiExamples;
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

                const openapiExamples: OpenAPIV3.MediaTypeObject["examples"] = {};
                for (const example of examples) {
                    if (example.response.type === "error" && example.response.body != null) {
                        const errorForExample = example.response.error;
                        if (errorInfos.some((errorInfo) => isEqual(errorInfo.errorDeclaration.name, errorForExample))) {
                            if (example.name && example.name.originalName !== "") {
                                openapiExamples[example.name.originalName] = {
                                    value: example.response.body.jsonExample
                                };
                            } else {
                                openapiExamples[`Example${size(openapiExamples) + 1}`] = {
                                    value: example.response.body.jsonExample
                                };
                            }
                        }
                    }
                }
                if (size(openapiExamples) > 0) {
                    convertedResponse.examples = openapiExamples;
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

function typeIsObject({ type, typesByName }: { type: Type; typesByName: Record<string, TypeDeclaration> }): boolean {
    if (type.type === "object") {
        return true;
    } else if (type.type === "alias") {
        return typeReferenceIsObject(type.aliasOf, typesByName);
    }
    return false;
}

function typeReferenceIsObject(typeReference: TypeReference, typesByName: Record<string, TypeDeclaration>): boolean {
    if (typeReference.type === "named") {
        const key = getDeclaredTypeNameKey(typeReference);
        const typeDeclaration = typesByName[key];
        if (typeDeclaration == null) {
            return false;
        }
        return typeIsObject({ type: typeDeclaration.shape, typesByName });
    }
    return false;
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
        const errorDeclaration = errorsByName[getErrorTypeNameKey(responseError.error)];
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

    const openapiExamples: OpenAPIV3.ParameterObject["examples"] = {};
    for (const example of examples) {
        const pathParameterExample = [
            ...example.rootPathParameters,
            ...example.servicePathParameters,
            ...example.endpointPathParameters
        ].find((param) => param.name.originalName === pathParameter.name.originalName);
        if (pathParameterExample != null) {
            if (example.name && example.name.originalName !== "") {
                openapiExamples[example.name.originalName] = {
                    value: pathParameterExample.value.jsonExample
                };
            } else {
                openapiExamples[`Example${size(openapiExamples) + 1}`] = {
                    value: pathParameterExample.value.jsonExample
                };
            }

            if (convertedParameter.example == null) {
                convertedParameter.example = pathParameterExample.value.jsonExample;
            }
        }
    }
    if (size(openapiExamples) > 0) {
        convertedParameter.examples = openapiExamples;
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

    const openapiExamples: OpenAPIV3.ParameterObject["examples"] = {};
    for (const example of examples) {
        const queryParameterExample = example.queryParameters.find(
            (param) => param.name.wireValue === queryParameter.name.wireValue
        );
        if (queryParameterExample != null) {
            if (example.name && example.name.originalName !== "") {
                openapiExamples[example.name.originalName] = {
                    value: queryParameterExample.value.jsonExample
                };
            } else {
                openapiExamples[`Example${size(openapiExamples) + 1}`] = {
                    value: queryParameterExample.value.jsonExample
                };
            }

            if (convertedParameter.example == null) {
                convertedParameter.example = queryParameterExample.value.jsonExample;
            }
        }
    }
    if (size(openapiExamples) > 0) {
        convertedParameter.examples = openapiExamples;
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

    const openapiExamples: OpenAPIV3.ParameterObject["examples"] = {};
    for (const example of examples) {
        const headerExample = [...example.serviceHeaders, ...example.endpointHeaders].find(
            (headerFromExample) => headerFromExample.name.wireValue === httpHeader.name.wireValue
        );
        if (headerExample != null) {
            if (example.name && example.name.originalName !== "") {
                openapiExamples[example.name.originalName] = {
                    value: headerExample.value.jsonExample
                };
            } else {
                openapiExamples[`Example${size(openapiExamples) + 1}`] = {
                    value: headerExample.value.jsonExample
                };
            }

            if (convertedParameter.example == null) {
                convertedParameter.example = headerExample.value.jsonExample;
            }
        }
    }
    if (size(openapiExamples) > 0) {
        convertedParameter.examples = openapiExamples;
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
        const key = getDeclaredTypeNameKey(typeReference);
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
