import { assertNever, isNonNullish, MediaType } from "@fern-api/core-utils";
import { IntermediateRepresentation, FernIr as Ir } from "@fern-api/ir-sdk";
import { FernRegistry as FdrCjsSdk } from "@fern-fern/fdr-cjs-sdk";
import { convertTypeReference, convertTypeShapeToTypeReference } from "./getConvertedTypes";

export function getConvertedEndpoints(
    ir: Ir.ir.IntermediateRepresentation
): Record<FdrCjsSdk.EndpointId, FdrCjsSdk.api.latest.EndpointDefinition> {
    const endpoints: Record<FdrCjsSdk.EndpointId, FdrCjsSdk.api.latest.EndpointDefinition> = {};
    
    for (const service of Object.values(ir.services)) {
        for (const irEndpoint of service.endpoints) {
            const endpoint = convertEndpoint(irEndpoint, service, ir);
            endpoints[endpoint.id] = endpoint;
        }
    }

    return endpoints;
}

function convertEndpoint(
    irEndpoint: Ir.http.HttpEndpoint,
    irService: Ir.http.HttpService,
    ir: Ir.ir.IntermediateRepresentation
): FdrCjsSdk.api.latest.EndpointDefinition {

    const request = irEndpoint.requestBody != null ? convertRequestBody(irEndpoint.requestBody) : undefined;
    const response = irEndpoint.response != null ? convertResponse(irEndpoint.response) : undefined;

    return {
        availability: convertIrAvailability(irEndpoint.availability ?? irService.availability),
        auth: undefined,
        description: irEndpoint.docs ?? undefined,
        method: convertHttpMethod(irEndpoint.method),
        defaultEnvironment: ir.environments?.defaultEnvironment != null 
            ? FdrCjsSdk.EnvironmentId(ir.environments.defaultEnvironment) 
            : undefined,
        environments: ir.environments != null 
            ? convertIrEnvironments({ environmentsConfig: ir.environments, endpoint: irEndpoint })
            : undefined,
        id: FdrCjsSdk.EndpointId(irEndpoint.name.originalName),
        displayName: irEndpoint.displayName ?? irEndpoint.name.originalName,
        operationId: irEndpoint.id,
        path: convertHttpPath(irEndpoint.fullPath),
        pathParameters: irEndpoint.allPathParameters.map(
            (pathParameter): FdrCjsSdk.api.latest.ObjectProperty => ({
                description: pathParameter.docs ?? undefined,
                key: FdrCjsSdk.PropertyKey(pathParameter.name.originalName),
                valueShape: convertTypeReference(pathParameter.valueType),
                availability: undefined,
            })
        ),
        queryParameters: irEndpoint.queryParameters.map(
            (queryParameter): FdrCjsSdk.api.latest.ObjectProperty => ({
                description: queryParameter.docs ?? undefined,
                key: FdrCjsSdk.PropertyKey(queryParameter.name.wireValue),
                valueShape: convertTypeReference(queryParameter.valueType),
                availability: convertIrAvailability(queryParameter.availability)
            })
        ),
        requestHeaders: [...irService.headers, ...irEndpoint.headers].map(
            (header): FdrCjsSdk.api.latest.ObjectProperty => ({
                description: header.docs ?? undefined,
                key: FdrCjsSdk.PropertyKey(header.name.wireValue),
                valueShape: convertTypeReference(header.valueType),
                availability: convertIrAvailability(header.availability)
            })
        ),
        responseHeaders: undefined,
        requests: request != null ? [ request ] : undefined,
        responses: response != null ? [ response ] : undefined,
        errors: convertErrors(irEndpoint.errors, ir),
        snippetTemplates: undefined,
        protocol: undefined,
        namespace: undefined,
        examples: []
    };
}

function convertRequestBody(irRequest: Ir.http.HttpRequestBody): FdrCjsSdk.api.latest.HttpRequest | undefined {
    return Ir.http.HttpRequestBody._visit<FdrCjsSdk.api.latest.HttpRequest | undefined>(
        irRequest,
        {
            inlinedRequestBody: (inlinedRequestBody): FdrCjsSdk.api.latest.HttpRequest => {
                return {
                    contentType: inlinedRequestBody.contentType ?? MediaType.APPLICATION_JSON,
                    description: inlinedRequestBody.docs,
                    body: {
                        type: "object",
                        extends: inlinedRequestBody.extends.map((extension) => FdrCjsSdk.TypeId(extension.typeId)),
                        properties: inlinedRequestBody.properties.map(
                            (property): FdrCjsSdk.api.latest.ObjectProperty => ({
                                description: property.docs ?? undefined,
                                key: FdrCjsSdk.PropertyKey(property.name.wireValue),
                                valueShape: convertTypeReference(property.valueType),
                                availability: convertIrAvailability(property.availability)
                            })
                        ),
                        extraProperties: inlinedRequestBody.extraProperties ? { type: "unknown", displayName: undefined } : undefined
                    }
                };
            },
            reference: (reference) => {
                return {
                    contentType: reference.contentType ?? MediaType.APPLICATION_JSON,
                    body: {
                        type: "alias",
                        value: convertTypeShapeToTypeReference(convertTypeReference(reference.requestBodyType))
                    },
                    description: reference.docs ?? undefined
                };
            },
            fileUpload: (fileUpload) => ({
                description: fileUpload.docs ?? undefined,
                contentType: "",
                body: {
                    type: "formData",
                    description: undefined,
                    availability: undefined,
                    fields: fileUpload.properties
                        .map((property) => {
                            return property._visit<FdrCjsSdk.api.latest.FormDataField | undefined>({
                                file: (file) => {
                                    const form = file._visit<
                                        FdrCjsSdk.api.latest.FormDataField | undefined
                                    >({
                                        file: (singleFile) => ({
                                            type: "file",
                                            key: FdrCjsSdk.PropertyKey(singleFile.key.wireValue),
                                            isOptional: singleFile.isOptional,
                                            contentType: singleFile.contentType,
                                            description: undefined,
                                            availability: undefined,
                                            exploded: undefined,
                                        }),
                                        fileArray: (multipleFiles) => ({
                                            type: "files",
                                            key: FdrCjsSdk.PropertyKey(multipleFiles.key.wireValue),
                                            isOptional: multipleFiles.isOptional,
                                            contentType: multipleFiles.contentType,
                                            description: undefined,
                                            availability: undefined,
                                            exploded: undefined,
                                        }),
                                        _other: () => undefined
                                    });
                                    if (form == null) {
                                        return undefined;
                                    }
                                    return form;
                                },
                                bodyProperty: (bodyProperty) => ({
                                    type: "property",
                                    key: FdrCjsSdk.PropertyKey(bodyProperty.name.wireValue),
                                    valueShape: convertTypeReference(bodyProperty.valueType),
                                    contentType: bodyProperty.contentType,
                                    description: bodyProperty.docs,
                                    availability: convertIrAvailability(bodyProperty.availability),
                                    exploded: bodyProperty.style === "exploded"
                                }),
                                _other: () => undefined
                            });
                        })
                        .filter(isNonNullish)
                }
            }),
            bytes: (bytes) => ({
                body: {
                    type: "bytes",
                    contentType:  bytes.contentType,
                    isOptional: bytes.isOptional,
                },
                description: bytes.docs ?? undefined,
                contentType: bytes.contentType
            }),
            _other: () => {
                throw new Error("Unknown HttpRequestBody: " + irRequest.type);
            }
        }
    );
}


function convertResponse(irResponse: Ir.http.HttpResponse): FdrCjsSdk.api.latest.HttpResponse | undefined {
    if (irResponse.body == null) {
        return undefined;
    }
    let description;
    const body = Ir.http.HttpResponseBody._visit<FdrCjsSdk.api.latest.HttpResponseBodyShape | undefined>(
        irResponse.body,
        {
            fileDownload: (fileDownload) => {
                description = fileDownload.docs;
                return {
                    type: "fileDownload",
                    contentType: undefined
                };
            },
            json: (jsonResponse) => {
                description = jsonResponse.docs;
                return {
                    type: "alias",
                    value: convertTypeShapeToTypeReference(convertTypeReference(jsonResponse.responseBodyType))
                };
            },
            text: () => undefined,
            bytes: () => undefined,
            streamParameter: () => undefined,
            streaming: (streamingResponse) => {
                if (streamingResponse.type === "text") {
                    description = streamingResponse.docs;
                    return {
                        type: "streamingText"
                    };
                } else if (streamingResponse.type === "json") {
                    description = streamingResponse.docs;
                    return {
                        type: "stream",
                        shape: { type: "alias", value: convertTypeShapeToTypeReference(convertTypeReference(streamingResponse.payload)) },
                        terminator: streamingResponse.terminator
                    };
                } else if (streamingResponse.type === "sse") {
                    description = streamingResponse.docs;
                    return {
                        type: "stream",
                        shape: { type: "alias", value: convertTypeShapeToTypeReference(convertTypeReference(streamingResponse.payload)) },
                        terminator: streamingResponse.terminator
                    };
                }
                return undefined;
            },
            _other: () => {
                throw new Error("Unknown HttpResponse: " + irResponse.body);
            }
        }
    );
    if (body != null) {
        return { body, statusCode: irResponse.statusCode ?? 200, description };
    } else if (irResponse.statusCode != null) {
        return {
            statusCode: irResponse.statusCode,
            description,
            body: { type: "object", extends: [], properties: [], extraProperties: undefined }
        };
    } else {
        return undefined;
    }
}

function convertErrors(
    irResponseErrors: Ir.http.ResponseErrors,
    ir: IntermediateRepresentation
): FdrCjsSdk.api.latest.ErrorResponse[] {
    const errors: FdrCjsSdk.api.latest.ErrorResponse[] = [];
    if (ir.errorDiscriminationStrategy.type === "statusCode") {
        for (const irResponseError of irResponseErrors) {
            const errorDeclaration = ir.errors[irResponseError.error.errorId];
            if (errorDeclaration == null) {
                continue;
            }
            errors.push({
                shape: {
                    type: "alias",
                    value: errorDeclaration.type != null ? convertTypeShapeToTypeReference(convertTypeReference(errorDeclaration.type)) : { type: "unknown", displayName: undefined }
                },
                statusCode: errorDeclaration.statusCode,
                description: errorDeclaration.docs ?? undefined,
                name: errorDeclaration.name.name.originalName,
                availability: undefined,
                examples: errorDeclaration.examples.map((irExample) => {
                    return {
                        name: irExample.name?.originalName,
                        responseBody: { type: "json", value: irExample.jsonExample },
                        description: irExample.docs
                    };
                })
            });
        }
    } else {
        for (const irResponseError of irResponseErrors) {
            const errorDeclaration = ir.errors[irResponseError.error.errorId];
            if (errorDeclaration == null) {
                continue;
            }
            
            const properties: FdrCjsSdk.api.latest.ObjectProperty[] = [
                {
                    key: FdrCjsSdk.PropertyKey(ir.errorDiscriminationStrategy.discriminant.wireValue),
                    valueShape: {
                        type: "alias",
                        value: {
                            type: "literal",
                            value: {
                                type: "stringLiteral",
                                value: errorDeclaration.discriminantValue.name.originalName
                            }
                        }
                    },
                    description: errorDeclaration.docs,
                    availability: undefined
                }
            ];

            if (errorDeclaration.type != null) {
                properties.push({
                    key: FdrCjsSdk.PropertyKey(ir.errorDiscriminationStrategy.contentProperty.wireValue),
                    valueShape: convertTypeReference(errorDeclaration.type),
                    description: errorDeclaration.docs,
                    availability: undefined
                });
            }

            errors.push({
                shape:
                    errorDeclaration.type == null
                        ? undefined
                        : {
                              type: "object",
                              extends: [],
                              properties,
                              extraProperties: undefined
                          },
                statusCode: errorDeclaration.statusCode,
                description: errorDeclaration.docs ?? undefined,
                availability: undefined,
                name: errorDeclaration.name.name.originalName,
                examples: errorDeclaration.examples.map((irExample) => {
                    return {
                        name: irExample.name?.originalName,
                        responseBody: { type: "json", value: irExample.jsonExample },
                        description: irExample.docs
                    };
                })
            });
        }
    }
    return errors;
}

function convertIrEnvironments({
    environmentsConfig,
    endpoint
}: {
    environmentsConfig: Ir.environment.EnvironmentsConfig;
    endpoint: Ir.http.HttpEndpoint;
}): FdrCjsSdk.api.v1.commons.Environment[] {
    const environmentsConfigValue = environmentsConfig.environments;
    const endpointBaseUrlId = endpoint.baseUrl;
    switch (environmentsConfigValue.type) {
        case "singleBaseUrl":
            return environmentsConfigValue.environments.map((singleBaseUrlEnvironment) => {
                return {
                    id: FdrCjsSdk.EnvironmentId(singleBaseUrlEnvironment.id),
                    baseUrl: singleBaseUrlEnvironment.url
                };
            });
        case "multipleBaseUrls":
            if (endpointBaseUrlId == null) {
                throw new Error(`Expected endpoint ${endpoint.name.originalName} to have base url.`);
            }
            return environmentsConfigValue.environments.map((singleBaseUrlEnvironment) => {
                const endpointBaseUrl = singleBaseUrlEnvironment.urls[endpointBaseUrlId];
                if (endpointBaseUrl == null) {
                    throw new Error(
                        `Expected environment ${singleBaseUrlEnvironment.id} to contain url for ${endpointBaseUrlId}`
                    );
                }
                return {
                    id: FdrCjsSdk.EnvironmentId(singleBaseUrlEnvironment.id),
                    baseUrl: endpointBaseUrl
                };
            });
        default:
            assertNever(environmentsConfigValue);
    }
}

function convertIrAvailability(availability: Ir.Availability | undefined): FdrCjsSdk.Availability | undefined {
    if (availability == null) {
        return undefined;
    }
    switch (availability.status) {
        case "DEPRECATED":
            return FdrCjsSdk.Availability.Deprecated;
        case "PRE_RELEASE":
            return FdrCjsSdk.Availability.Beta;
        case "GENERAL_AVAILABILITY":
            return FdrCjsSdk.Availability.GenerallyAvailable;
        case "IN_DEVELOPMENT":
            return FdrCjsSdk.Availability.Beta;
        default:
            assertNever(availability.status);
    }
}

function convertHttpMethod(method: Ir.http.HttpMethod): FdrCjsSdk.HttpMethod {
    return Ir.http.HttpMethod._visit<FdrCjsSdk.HttpMethod>(method, {
        get: () => FdrCjsSdk.HttpMethod.Get,
        post: () => FdrCjsSdk.HttpMethod.Post,
        put: () => FdrCjsSdk.HttpMethod.Put,
        patch: () => FdrCjsSdk.HttpMethod.Patch,
        delete: () => FdrCjsSdk.HttpMethod.Delete,
        _other: () => {
            throw new Error("Unknown http method: " + method);
        }
    });
}

function convertHttpPath(irPath: Ir.http.HttpPath): FdrCjsSdk.api.latest.PathPart[] {
    const endpointPaths: FdrCjsSdk.api.latest.PathPart[] = irPath.parts.flatMap((part) => [
        {
            type: "pathParameter",
            value: FdrCjsSdk.PropertyKey(part.pathParameter)
        },
        {
            type: "literal",
            value: part.tail
        }
    ]);
    return [
        {
            type: "literal",
            value: irPath.head
        },
        ...endpointPaths
    ];
}

