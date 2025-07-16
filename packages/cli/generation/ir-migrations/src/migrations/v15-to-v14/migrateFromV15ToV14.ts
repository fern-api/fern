import { mapValues } from "lodash-es";

import { GeneratorName } from "@fern-api/configuration-loader";

import { IrVersions } from "../../ir-versions";
import {
    GeneratorWasNeverUpdatedToConsumeNewIR,
    GeneratorWasNotCreatedYet,
    IrMigration
} from "../../types/IrMigration";

export const V15_TO_V14_MIGRATION: IrMigration<
    IrVersions.V15.ir.IntermediateRepresentation,
    IrVersions.V14.ir.IntermediateRepresentation
> = {
    laterVersion: "v15",
    earlierVersion: "v14",
    firstGeneratorVersionToConsumeNewIR: {
        [GeneratorName.TYPESCRIPT_NODE_SDK]: GeneratorWasNotCreatedYet,
        [GeneratorName.TYPESCRIPT_BROWSER_SDK]: GeneratorWasNotCreatedYet,
        [GeneratorName.TYPESCRIPT]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.TYPESCRIPT_SDK]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.TYPESCRIPT_EXPRESS]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.JAVA]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.JAVA_MODEL]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.JAVA_SDK]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.JAVA_SPRING]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.PYTHON_FASTAPI]: "0.0.52-3-gd9df38df",
        [GeneratorName.PYTHON_PYDANTIC]: "0.0.52-3-gd9df38df",
        [GeneratorName.OPENAPI_PYTHON_CLIENT]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.OPENAPI]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.STOPLIGHT]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.POSTMAN]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.PYTHON_SDK]: "0.0.52-3-gd9df38df",
        [GeneratorName.GO_FIBER]: GeneratorWasNotCreatedYet,
        [GeneratorName.GO_MODEL]: GeneratorWasNotCreatedYet,
        [GeneratorName.GO_SDK]: GeneratorWasNotCreatedYet,
        [GeneratorName.RUBY_MODEL]: GeneratorWasNotCreatedYet,
        [GeneratorName.RUBY_SDK]: GeneratorWasNotCreatedYet,
        [GeneratorName.CSHARP_MODEL]: GeneratorWasNotCreatedYet,
        [GeneratorName.CSHARP_SDK]: GeneratorWasNotCreatedYet,
        [GeneratorName.SWIFT_MODEL]: GeneratorWasNotCreatedYet,
        [GeneratorName.SWIFT_SDK]: GeneratorWasNotCreatedYet,
        [GeneratorName.PHP_MODEL]: GeneratorWasNotCreatedYet,
        [GeneratorName.PHP_SDK]: GeneratorWasNotCreatedYet
    },
    jsonifyEarlierVersion: (ir) => ir,
    migrateBackwards: (v14): IrVersions.V14.ir.IntermediateRepresentation => {
        const v13Types: Record<string, IrVersions.V14.types.TypeDeclaration> = mapValues(
            v14.types,
            (typeDeclaration) => {
                return {
                    ...typeDeclaration,
                    shape: IrVersions.V15.types.Type._visit<IrVersions.V14.types.Type>(typeDeclaration.shape, {
                        union: (union) => {
                            return IrVersions.V14.types.Type.union({
                                discriminant: union.discriminant,
                                baseProperties: union.baseProperties.map((objectProperty) => {
                                    return {
                                        ...objectProperty,
                                        valueType: convertTypeReference(objectProperty.valueType)
                                    };
                                }),
                                types: union.types.map((singleUnionType) => convertSingleUnionType(singleUnionType))
                            });
                        },
                        enum: IrVersions.V14.types.Type.enum,
                        object: (object) => {
                            return IrVersions.V14.types.Type.object({
                                ...object,
                                properties: object.properties.map((objectProperty) => {
                                    return {
                                        ...objectProperty,
                                        valueType: convertTypeReference(objectProperty.valueType)
                                    };
                                })
                            });
                        },
                        alias: (aliasTypeDeclaration) => {
                            return IrVersions.V14.types.Type.alias({
                                aliasOf: convertTypeReference(aliasTypeDeclaration.aliasOf),
                                resolvedType: convertResolvedType(aliasTypeDeclaration.resolvedType)
                            });
                        },
                        undiscriminatedUnion: (undiscriminatedUnion) => {
                            return IrVersions.V14.types.Type.undiscriminatedUnion(
                                convertUndiscriminatedUnion(undiscriminatedUnion)
                            );
                        },
                        _unknown: () => {
                            throw new Error("Encountered unknown shape");
                        }
                    })
                };
            }
        );
        return {
            ...v14,
            auth: convertAuth(v14.auth),
            headers: v14.headers.map((header) => convertHttpHeader(header)),
            types: v13Types,
            services: mapValues(v14.services, (service) => convertHttpService(service)),
            errors: mapValues(v14.errors, (error) => convertErrorDeclaration(error))
        };
    }
};

function convertAuth(auth: IrVersions.V15.auth.ApiAuth): IrVersions.V14.auth.ApiAuth {
    return {
        docs: auth.docs,
        requirement: auth.requirement,
        schemes: auth.schemes.map((scheme) => {
            if (scheme._type !== "header") {
                return scheme;
            }
            return IrVersions.V14.auth.AuthScheme.header(convertHeader(scheme));
        })
    };
}

function convertHeader(header: IrVersions.V15.auth.AuthScheme.Header): IrVersions.V14.auth.HeaderAuthScheme {
    return {
        docs: header.docs,
        prefix: header.prefix,
        name: header.name,
        valueType: convertTypeReference(header.valueType)
    };
}

function convertHttpHeader(header: IrVersions.V15.http.HttpHeader): IrVersions.V14.http.HttpHeader {
    return {
        docs: header.docs,
        availability: header.availability,
        name: header.name,
        valueType: convertTypeReference(header.valueType)
    };
}

function convertTypeReference(typeReference: IrVersions.V15.types.TypeReference): IrVersions.V14.types.TypeReference {
    return IrVersions.V15.types.TypeReference._visit<IrVersions.V14.types.TypeReference>(typeReference, {
        container: (container) => IrVersions.V14.types.TypeReference.container(convertContainerType(container)),
        primitive: (primitiveType) => {
            if (primitiveType === "BASE_64") {
                return IrVersions.V14.types.TypeReference.primitive(IrVersions.V14.types.PrimitiveType.String);
            }
            return IrVersions.V14.types.TypeReference.primitive(primitiveType);
        },
        named: IrVersions.V14.types.TypeReference.named,
        unknown: IrVersions.V14.types.TypeReference.unknown,
        _unknown: () => {
            throw new Error("Unknown type reference: " + typeReference._type);
        }
    });
}

function convertContainerType(container: IrVersions.V15.types.ContainerType): IrVersions.V14.types.ContainerType {
    return IrVersions.V15.types.ContainerType._visit<IrVersions.V14.types.ContainerType>(container, {
        list: (itemType) => IrVersions.V14.types.ContainerType.list(convertTypeReference(itemType)),
        optional: (itemType) => IrVersions.V14.types.ContainerType.optional(convertTypeReference(itemType)),
        set: (itemType) => IrVersions.V14.types.ContainerType.set(convertTypeReference(itemType)),
        map: ({ keyType, valueType }) =>
            IrVersions.V14.types.ContainerType.map({
                keyType: convertTypeReference(keyType),
                valueType: convertTypeReference(valueType)
            }),
        literal: IrVersions.V14.types.ContainerType.literal,
        _unknown: () => {
            throw new Error("Unknown ContainerType: " + container._type);
        }
    });
}

function convertSingleUnionType(
    singleUnionType: IrVersions.V15.types.SingleUnionType
): IrVersions.V14.types.SingleUnionType {
    return {
        docs: singleUnionType.docs,
        discriminantValue: singleUnionType.discriminantValue,
        shape: convertSingleUnionTypeProperties(singleUnionType.shape)
    };
}

function convertSingleUnionTypeProperties(
    properties: IrVersions.V15.types.SingleUnionTypeProperties
): IrVersions.V14.types.SingleUnionTypeProperties {
    return IrVersions.V15.types.SingleUnionTypeProperties._visit<IrVersions.V14.types.SingleUnionTypeProperties>(
        properties,
        {
            samePropertiesAsObject: (declaredTypeName) =>
                IrVersions.V14.types.SingleUnionTypeProperties.samePropertiesAsObject(declaredTypeName),
            singleProperty: (singleProperty) =>
                IrVersions.V14.types.SingleUnionTypeProperties.singleProperty({
                    name: singleProperty.name,
                    type: convertTypeReference(singleProperty.type)
                }),
            noProperties: IrVersions.V14.types.SingleUnionTypeProperties.noProperties,
            _unknown: () => {
                throw new Error("Unknown SingleUnionTypeProperties: " + properties._type);
            }
        }
    );
}

function convertResolvedType(
    resolvedType: IrVersions.V15.types.ResolvedTypeReference
): IrVersions.V14.types.ResolvedTypeReference {
    return IrVersions.V15.types.ResolvedTypeReference._visit<IrVersions.V14.types.ResolvedTypeReference>(resolvedType, {
        container: (container) => IrVersions.V14.types.ResolvedTypeReference.container(convertContainerType(container)),
        named: IrVersions.V14.types.ResolvedTypeReference.named,
        primitive: (primitiveType) => {
            if (primitiveType === "BASE_64") {
                return IrVersions.V14.types.ResolvedTypeReference.primitive(IrVersions.V14.types.PrimitiveType.String);
            }
            return IrVersions.V14.types.ResolvedTypeReference.primitive(primitiveType);
        },
        unknown: IrVersions.V14.types.ResolvedTypeReference.unknown,
        _unknown: () => {
            throw new Error("Unknown ResolvedTypeReference: " + resolvedType._type);
        }
    });
}

function convertUndiscriminatedUnion(
    undiscriminatedUnion: IrVersions.V15.types.UndiscriminatedUnionTypeDeclaration
): IrVersions.V14.types.UndiscriminatedUnionTypeDeclaration {
    return {
        members: undiscriminatedUnion.members.map((member) => {
            return {
                ...member,
                type: convertTypeReference(member.type)
            };
        })
    };
}

function convertHttpService(service: IrVersions.V15.http.HttpService): IrVersions.V14.http.HttpService {
    return {
        availability: service.availability,
        name: service.name,
        displayName: service.displayName,
        basePath: service.basePath,
        baseUrl: service.baseUrl,
        pathParameters: service.pathParameters.map((pathParameter) => convertPathParameter(pathParameter)),
        headers: service.headers.map((header) => convertHttpHeader(header)),
        endpoints: service.endpoints.map((endpoint) => convertEndpoint(endpoint))
    };
}

function convertPathParameter(pathParameter: IrVersions.V15.http.PathParameter): IrVersions.V14.http.PathParameter {
    return {
        availability: pathParameter.availability,
        docs: pathParameter.docs,
        name: pathParameter.name,
        valueType: convertTypeReference(pathParameter.valueType)
    };
}

function convertEndpoint(endpoint: IrVersions.V15.http.HttpEndpoint): IrVersions.V14.http.HttpEndpoint {
    return {
        docs: endpoint.docs,
        availability: endpoint.availability,
        name: endpoint.name,
        displayName: endpoint.displayName,
        errors: endpoint.errors,
        auth: endpoint.auth,
        method: endpoint.method,
        path: endpoint.path,
        pathParameters: endpoint.pathParameters.map((pathParameter) => convertPathParameter(pathParameter)),
        sdkRequest: endpoint.sdkRequest != null ? convertSdkRequest(endpoint.sdkRequest) : undefined,
        requestBody: endpoint.requestBody != null ? convertRequestBody(endpoint.requestBody) : undefined,
        response: endpoint.response != null ? convertHttpResponse(endpoint.response) : undefined,
        headers: endpoint.headers.map((header) => convertHttpHeader(header)),
        queryParameters: endpoint.queryParameters.map((queryParameter) => convertQueryParameter(queryParameter)),
        examples: endpoint.examples,
        streamingResponse:
            endpoint.streamingResponse != null ? convertStreamingResponse(endpoint.streamingResponse) : undefined,
        sdkResponse: endpoint.sdkResponse != null ? convertSdkResponse(endpoint.sdkResponse) : undefined
    };
}

function convertQueryParameter(queryParameter: IrVersions.V15.http.QueryParameter): IrVersions.V14.http.QueryParameter {
    return {
        availability: queryParameter.availability,
        docs: queryParameter.docs,
        name: queryParameter.name,
        valueType: convertTypeReference(queryParameter.valueType),
        allowMultiple: queryParameter.allowMultiple
    };
}

function convertSdkRequest(sdkRequest: IrVersions.V15.http.SdkRequest): IrVersions.V14.http.SdkRequest {
    return {
        requestParameterName: sdkRequest.requestParameterName,
        shape: convertSdkRequestShape(sdkRequest.shape)
    };
}

function convertSdkRequestShape(shape: IrVersions.V15.http.SdkRequestShape): IrVersions.V14.http.SdkRequestShape {
    return IrVersions.V15.http.SdkRequestShape._visit<IrVersions.V14.http.SdkRequestShape>(shape, {
        justRequestBody: (reference) =>
            IrVersions.V14.http.SdkRequestShape.justRequestBody({
                docs: reference.docs,
                requestBodyType: convertTypeReference(reference.requestBodyType)
            }),
        wrapper: IrVersions.V14.http.SdkRequestShape.wrapper,
        _unknown: () => {
            throw new Error("Unknown SdkRequestShape: " + shape.type);
        }
    });
}

function convertRequestBody(requestBody: IrVersions.V15.http.HttpRequestBody): IrVersions.V14.http.HttpRequestBody {
    return IrVersions.V15.http.HttpRequestBody._visit<IrVersions.V14.http.HttpRequestBody>(requestBody, {
        inlinedRequestBody: (inlinedRequestBody) =>
            IrVersions.V14.http.HttpRequestBody.inlinedRequestBody({
                name: inlinedRequestBody.name,
                extends: inlinedRequestBody.extends,
                properties: inlinedRequestBody.properties.map((property) => ({
                    docs: property.docs,
                    name: property.name,
                    valueType: convertTypeReference(property.valueType)
                }))
            }),
        reference: (reference) =>
            IrVersions.V14.http.HttpRequestBody.reference({
                docs: reference.docs,
                requestBodyType: convertTypeReference(reference.requestBodyType)
            }),
        fileUpload: (fileUpload) =>
            IrVersions.V14.http.HttpRequestBody.fileUpload({
                name: fileUpload.name,
                properties: fileUpload.properties.map((fileUploadRequestProperty) => {
                    if (fileUploadRequestProperty.type === "bodyProperty") {
                        return {
                            ...fileUploadRequestProperty,
                            valueType: convertTypeReference(fileUploadRequestProperty.valueType)
                        };
                    }
                    return fileUploadRequestProperty;
                })
            }),
        _unknown: () => {
            throw new Error("Unknown HttpRequestBody: " + requestBody.type);
        }
    });
}

function convertHttpResponse(
    response: IrVersions.V15.http.NonStreamingResponse
): IrVersions.V14.http.NonStreamingResponse {
    return {
        docs: response.docs,
        responseBodyType: convertTypeReference(response.responseBodyType)
    };
}

function convertStreamingResponse(
    response: IrVersions.V15.http.StreamingResponse
): IrVersions.V14.http.StreamingResponse {
    return {
        dataEventType: convertTypeReference(response.dataEventType),
        terminator: response.terminator
    };
}

function convertSdkResponse(sdkResponse: IrVersions.V15.http.SdkResponse): IrVersions.V14.http.SdkResponse {
    return IrVersions.V15.http.SdkResponse._visit<IrVersions.V14.http.SdkResponse>(sdkResponse, {
        streaming: (streamingResponse) =>
            IrVersions.V14.http.SdkResponse.streaming(convertStreamingResponse(streamingResponse)),
        nonStreaming: (nonStreamingResponse) =>
            IrVersions.V14.http.SdkResponse.nonStreaming(convertHttpResponse(nonStreamingResponse)),
        maybeStreaming: (maybeStreamingResponse) =>
            IrVersions.V14.http.SdkResponse.maybeStreaming({
                condition: maybeStreamingResponse.condition,
                nonStreaming: convertHttpResponse(maybeStreamingResponse.nonStreaming),
                streaming: convertStreamingResponse(maybeStreamingResponse.streaming)
            }),
        _unknown: () => {
            throw new Error("Encountered unknown sdk response");
        }
    });
}

function convertErrorDeclaration(
    error: IrVersions.V15.errors.ErrorDeclaration
): IrVersions.V14.errors.ErrorDeclaration {
    return {
        docs: error.docs,
        name: error.name,
        discriminantValue: error.discriminantValue,
        type: error.type != null ? convertTypeReference(error.type) : undefined,
        statusCode: error.statusCode
    };
}
