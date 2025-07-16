import { mapValues } from "lodash-es";

import { GeneratorName } from "@fern-api/configuration-loader";

import { IrVersions } from "../../ir-versions";
import {
    GeneratorWasNeverUpdatedToConsumeNewIR,
    GeneratorWasNotCreatedYet,
    IrMigration
} from "../../types/IrMigration";

export const V14_TO_V13_MIGRATION: IrMigration<
    IrVersions.V14.ir.IntermediateRepresentation,
    IrVersions.V13.ir.IntermediateRepresentation
> = {
    laterVersion: "v14",
    earlierVersion: "v13",
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
        [GeneratorName.PYTHON_FASTAPI]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.PYTHON_PYDANTIC]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.OPENAPI_PYTHON_CLIENT]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.OPENAPI]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.STOPLIGHT]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.POSTMAN]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.PYTHON_SDK]: GeneratorWasNotCreatedYet,
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
    migrateBackwards: (v14): IrVersions.V13.ir.IntermediateRepresentation => {
        const v13Types: Record<string, IrVersions.V13.types.TypeDeclaration> = mapValues(
            v14.types,
            (typeDeclaration) => {
                return {
                    ...typeDeclaration,
                    shape: IrVersions.V14.types.Type._visit<IrVersions.V13.types.Type>(typeDeclaration.shape, {
                        union: (union) => {
                            return IrVersions.V13.types.Type.union({
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
                        enum: IrVersions.V13.types.Type.enum,
                        object: (object) => {
                            return IrVersions.V13.types.Type.object({
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
                            return IrVersions.V13.types.Type.alias({
                                aliasOf: convertTypeReference(aliasTypeDeclaration.aliasOf),
                                resolvedType: convertResolvedType(aliasTypeDeclaration.resolvedType)
                            });
                        },
                        undiscriminatedUnion: (undiscriminatedUnion) => {
                            return IrVersions.V13.types.Type.undiscriminatedUnion(
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

function convertAuth(auth: IrVersions.V14.auth.ApiAuth): IrVersions.V13.auth.ApiAuth {
    return {
        docs: auth.docs,
        requirement: auth.requirement,
        schemes: auth.schemes.map((scheme) => {
            if (scheme._type !== "header") {
                return scheme;
            }
            return IrVersions.V13.auth.AuthScheme.header(convertHeader(scheme));
        })
    };
}

function convertHeader(header: IrVersions.V14.auth.AuthScheme.Header): IrVersions.V13.auth.HeaderAuthScheme {
    return {
        docs: header.docs,
        prefix: header.prefix,
        name: header.name,
        valueType: convertTypeReference(header.valueType)
    };
}

function convertHttpHeader(header: IrVersions.V14.http.HttpHeader): IrVersions.V13.http.HttpHeader {
    return {
        docs: header.docs,
        availability: header.availability,
        name: header.name,
        valueType: convertTypeReference(header.valueType)
    };
}

function convertTypeReference(typeReference: IrVersions.V14.types.TypeReference): IrVersions.V13.types.TypeReference {
    return IrVersions.V14.types.TypeReference._visit<IrVersions.V13.types.TypeReference>(typeReference, {
        container: (container) => IrVersions.V13.types.TypeReference.container(convertContainerType(container)),
        primitive: (primitiveType) => {
            if (primitiveType === "DATE") {
                return IrVersions.V13.types.TypeReference.primitive(IrVersions.V13.types.PrimitiveType.String);
            }
            return IrVersions.V13.types.TypeReference.primitive(primitiveType);
        },
        named: IrVersions.V13.types.TypeReference.named,
        unknown: IrVersions.V13.types.TypeReference.unknown,
        _unknown: () => {
            throw new Error("Unknown type reference: " + typeReference._type);
        }
    });
}

function convertContainerType(container: IrVersions.V14.types.ContainerType): IrVersions.V13.types.ContainerType {
    return IrVersions.V14.types.ContainerType._visit<IrVersions.V13.types.ContainerType>(container, {
        list: (itemType) => IrVersions.V13.types.ContainerType.list(convertTypeReference(itemType)),
        optional: (itemType) => IrVersions.V13.types.ContainerType.optional(convertTypeReference(itemType)),
        set: (itemType) => IrVersions.V13.types.ContainerType.set(convertTypeReference(itemType)),
        map: ({ keyType, valueType }) =>
            IrVersions.V13.types.ContainerType.map({
                keyType: convertTypeReference(keyType),
                valueType: convertTypeReference(valueType)
            }),
        literal: IrVersions.V13.types.ContainerType.literal,
        _unknown: () => {
            throw new Error("Unknown ContainerType: " + container._type);
        }
    });
}

function convertSingleUnionType(
    singleUnionType: IrVersions.V14.types.SingleUnionType
): IrVersions.V13.types.SingleUnionType {
    return {
        docs: singleUnionType.docs,
        discriminantValue: singleUnionType.discriminantValue,
        shape: convertSingleUnionTypeProperties(singleUnionType.shape)
    };
}

function convertSingleUnionTypeProperties(
    properties: IrVersions.V14.types.SingleUnionTypeProperties
): IrVersions.V13.types.SingleUnionTypeProperties {
    return IrVersions.V14.types.SingleUnionTypeProperties._visit<IrVersions.V13.types.SingleUnionTypeProperties>(
        properties,
        {
            samePropertiesAsObject: (declaredTypeName) =>
                IrVersions.V13.types.SingleUnionTypeProperties.samePropertiesAsObject(declaredTypeName),
            singleProperty: (singleProperty) =>
                IrVersions.V13.types.SingleUnionTypeProperties.singleProperty({
                    name: singleProperty.name,
                    type: convertTypeReference(singleProperty.type)
                }),
            noProperties: IrVersions.V13.types.SingleUnionTypeProperties.noProperties,
            _unknown: () => {
                throw new Error("Unknown SingleUnionTypeProperties: " + properties._type);
            }
        }
    );
}

function convertResolvedType(
    resolvedType: IrVersions.V14.types.ResolvedTypeReference
): IrVersions.V13.types.ResolvedTypeReference {
    return IrVersions.V14.types.ResolvedTypeReference._visit<IrVersions.V13.types.ResolvedTypeReference>(resolvedType, {
        container: (container) => IrVersions.V13.types.ResolvedTypeReference.container(convertContainerType(container)),
        named: IrVersions.V13.types.ResolvedTypeReference.named,
        primitive: (primitiveType) => {
            if (primitiveType === "DATE") {
                return IrVersions.V13.types.ResolvedTypeReference.primitive(IrVersions.V13.types.PrimitiveType.String);
            }
            return IrVersions.V13.types.ResolvedTypeReference.primitive(primitiveType);
        },
        unknown: IrVersions.V13.types.ResolvedTypeReference.unknown,
        _unknown: () => {
            throw new Error("Unknown ResolvedTypeReference: " + resolvedType._type);
        }
    });
}

function convertUndiscriminatedUnion(
    undiscriminatedUnion: IrVersions.V14.types.UndiscriminatedUnionTypeDeclaration
): IrVersions.V13.types.UndiscriminatedUnionTypeDeclaration {
    return {
        members: undiscriminatedUnion.members.map((member) => {
            return {
                ...member,
                type: convertTypeReference(member.type)
            };
        })
    };
}

function convertHttpService(service: IrVersions.V14.http.HttpService): IrVersions.V13.http.HttpService {
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

function convertPathParameter(pathParameter: IrVersions.V14.http.PathParameter): IrVersions.V13.http.PathParameter {
    return {
        availability: pathParameter.availability,
        docs: pathParameter.docs,
        name: pathParameter.name,
        valueType: convertTypeReference(pathParameter.valueType)
    };
}

function convertEndpoint(endpoint: IrVersions.V14.http.HttpEndpoint): IrVersions.V13.http.HttpEndpoint {
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

function convertQueryParameter(queryParameter: IrVersions.V14.http.QueryParameter): IrVersions.V13.http.QueryParameter {
    return {
        availability: queryParameter.availability,
        docs: queryParameter.docs,
        name: queryParameter.name,
        valueType: convertTypeReference(queryParameter.valueType),
        allowMultiple: queryParameter.allowMultiple
    };
}

function convertSdkRequest(sdkRequest: IrVersions.V14.http.SdkRequest): IrVersions.V13.http.SdkRequest {
    return {
        requestParameterName: sdkRequest.requestParameterName,
        shape: convertSdkRequestShape(sdkRequest.shape)
    };
}

function convertSdkRequestShape(shape: IrVersions.V14.http.SdkRequestShape): IrVersions.V13.http.SdkRequestShape {
    return IrVersions.V14.http.SdkRequestShape._visit<IrVersions.V13.http.SdkRequestShape>(shape, {
        justRequestBody: (reference) =>
            IrVersions.V13.http.SdkRequestShape.justRequestBody({
                docs: reference.docs,
                requestBodyType: convertTypeReference(reference.requestBodyType)
            }),
        wrapper: IrVersions.V13.http.SdkRequestShape.wrapper,
        _unknown: () => {
            throw new Error("Unknown SdkRequestShape: " + shape.type);
        }
    });
}

function convertRequestBody(requestBody: IrVersions.V14.http.HttpRequestBody): IrVersions.V13.http.HttpRequestBody {
    return IrVersions.V14.http.HttpRequestBody._visit<IrVersions.V13.http.HttpRequestBody>(requestBody, {
        inlinedRequestBody: (inlinedRequestBody) =>
            IrVersions.V13.http.HttpRequestBody.inlinedRequestBody({
                name: inlinedRequestBody.name,
                extends: inlinedRequestBody.extends,
                properties: inlinedRequestBody.properties.map((property) => ({
                    docs: property.docs,
                    name: property.name,
                    valueType: convertTypeReference(property.valueType)
                }))
            }),
        reference: (reference) =>
            IrVersions.V13.http.HttpRequestBody.reference({
                docs: reference.docs,
                requestBodyType: convertTypeReference(reference.requestBodyType)
            }),
        fileUpload: (fileUpload) =>
            IrVersions.V13.http.HttpRequestBody.fileUpload({
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
    response: IrVersions.V14.http.NonStreamingResponse
): IrVersions.V13.http.NonStreamingResponse {
    return {
        docs: response.docs,
        responseBodyType: convertTypeReference(response.responseBodyType)
    };
}

function convertStreamingResponse(
    response: IrVersions.V14.http.StreamingResponse
): IrVersions.V13.http.StreamingResponse {
    return {
        dataEventType: convertTypeReference(response.dataEventType),
        terminator: response.terminator
    };
}

function convertSdkResponse(sdkResponse: IrVersions.V14.http.SdkResponse): IrVersions.V13.http.SdkResponse {
    return IrVersions.V14.http.SdkResponse._visit<IrVersions.V13.http.SdkResponse>(sdkResponse, {
        streaming: (streamingResponse) =>
            IrVersions.V13.http.SdkResponse.streaming(convertStreamingResponse(streamingResponse)),
        nonStreaming: (nonStreamingResponse) =>
            IrVersions.V13.http.SdkResponse.nonStreaming(convertHttpResponse(nonStreamingResponse)),
        maybeStreaming: (maybeStreamingResponse) =>
            IrVersions.V13.http.SdkResponse.maybeStreaming({
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
    error: IrVersions.V14.errors.ErrorDeclaration
): IrVersions.V13.errors.ErrorDeclaration {
    return {
        docs: error.docs,
        name: error.name,
        discriminantValue: error.discriminantValue,
        type: error.type != null ? convertTypeReference(error.type) : undefined,
        statusCode: error.statusCode
    };
}
