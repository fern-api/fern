import { GeneratorName } from "@fern-api/configuration";
import { mapValues } from "lodash-es";
import { IrVersions } from "../../ir-versions";
import {
    GeneratorWasNeverUpdatedToConsumeNewIR,
    GeneratorWasNotCreatedYet,
    IrMigration
} from "../../types/IrMigration";

export const V45_TO_V44_MIGRATION: IrMigration<
    IrVersions.V45.ir.IntermediateRepresentation,
    IrVersions.V44.ir.IntermediateRepresentation
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
        [GeneratorName.CSHARP_SDK]: GeneratorWasNotCreatedYet
    },
    jsonifyEarlierVersion: (ir) => ir,
    migrateBackwards: (v45): IrVersions.V44.ir.IntermediateRepresentation => {
        const v44Types: Record<string, IrVersions.V44.types.TypeDeclaration> = mapValues(
            v45.types,
            (typeDeclaration) => {
                return {
                    ...typeDeclaration,
                    shape: IrVersions.V45.types.Type._visit<IrVersions.V44.types.Type>(typeDeclaration.shape, {
                        union: (union) => {
                            return IrVersions.V44.types.Type.union({
                                discriminant: union.discriminant,
                                extends: union.extends,
                                baseProperties: union.baseProperties.map((objectProperty) => {
                                    return {
                                        ...objectProperty,
                                        valueType: convertTypeReference(objectProperty.valueType)
                                    };
                                }),
                                types: union.types.map((singleUnionType) => convertSingleUnionType(singleUnionType))
                            });
                        },
                        enum: IrVersions.V44.types.Type.enum,
                        object: (object) => {
                            return IrVersions.V44.types.Type.object({
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
                            return IrVersions.V44.types.Type.alias({
                                aliasOf: convertTypeReference(aliasTypeDeclaration.aliasOf),
                                resolvedType: convertResolvedType(aliasTypeDeclaration.resolvedType)
                            });
                        },
                        undiscriminatedUnion: (undiscriminatedUnion) => {
                            return IrVersions.V44.types.Type.undiscriminatedUnion(
                                convertUndiscriminatedUnion(undiscriminatedUnion)
                            );
                        },
                        _other: () => {
                            throw new Error("Encountered unknown shape");
                        }
                    })
                };
            }
        );
        return {
            ...v45,
            auth: convertAuth(v45.auth),
            headers: v45.headers.map((header) => convertHttpHeader(header)),
            idempotencyHeaders: v45.idempotencyHeaders.map((header) => convertHttpHeader(header)),
            types: v44Types,
            services: mapValues(v45.services, (service) => convertHttpService(service)),
            errors: mapValues(v45.errors, (error) => convertErrorDeclaration(error)),
            // TODO
            webhookGroups: {},
            websocketChannels: {},
            pathParameters: [],
            variables: []
        };
    }
};

function convertAuth(auth: IrVersions.V45.auth.ApiAuth): IrVersions.V44.auth.ApiAuth {
    return {
        docs: auth.docs,
        requirement: auth.requirement,
        schemes: auth.schemes.map((scheme) => {
            if (scheme.type === "header") {
                return IrVersions.V44.auth.AuthScheme.header(convertHeader(scheme));
            } else if (scheme.type === "bearer") {
                return IrVersions.V44.auth.AuthScheme.bearer(scheme);
            }
            return scheme;
        })
    };
}

function convertHeader(header: IrVersions.V45.auth.AuthScheme.Header): IrVersions.V44.auth.HeaderAuthScheme {
    return {
        docs: header.docs,
        prefix: header.prefix,
        name: header.name,
        valueType: convertTypeReference(header.valueType),
        headerEnvVar: header.headerEnvVar
    };
}

function convertHttpHeader(header: IrVersions.V45.http.HttpHeader): IrVersions.V44.http.HttpHeader {
    return {
        docs: header.docs,
        availability: header.availability,
        name: header.name,
        valueType: convertTypeReference(header.valueType),
        env: header.env
    };
}

function convertTypeReference(typeReference: IrVersions.V45.types.TypeReference): IrVersions.V44.types.TypeReference {
    return IrVersions.V45.types.TypeReference._visit<IrVersions.V44.types.TypeReference>(typeReference, {
        container: (container) => IrVersions.V44.types.TypeReference.container(convertContainerType(container)),
        primitive: (primitiveType) => {
            if (primitiveType === "BIG_INTEGER") {
                return IrVersions.V44.types.TypeReference.primitive(IrVersions.V44.types.PrimitiveType.String);
            }
            return IrVersions.V44.types.TypeReference.primitive(primitiveType);
        },
        named: IrVersions.V44.types.TypeReference.named,
        unknown: IrVersions.V44.types.TypeReference.unknown,
        _other: () => {
            throw new Error("Unknown type reference: " + typeReference.type);
        }
    });
}

function convertContainerType(container: IrVersions.V45.types.ContainerType): IrVersions.V44.types.ContainerType {
    return IrVersions.V45.types.ContainerType._visit<IrVersions.V44.types.ContainerType>(container, {
        list: (itemType) => IrVersions.V44.types.ContainerType.list(convertTypeReference(itemType)),
        optional: (itemType) => IrVersions.V44.types.ContainerType.optional(convertTypeReference(itemType)),
        set: (itemType) => IrVersions.V44.types.ContainerType.set(convertTypeReference(itemType)),
        map: ({ keyType, valueType }) =>
            IrVersions.V44.types.ContainerType.map({
                keyType: convertTypeReference(keyType),
                valueType: convertTypeReference(valueType)
            }),
        literal: IrVersions.V44.types.ContainerType.literal,
        _other: () => {
            throw new Error("Unknown ContainerType: " + container.type);
        }
    });
}

function convertSingleUnionType(
    singleUnionType: IrVersions.V45.types.SingleUnionType
): IrVersions.V44.types.SingleUnionType {
    return {
        docs: singleUnionType.docs,
        discriminantValue: singleUnionType.discriminantValue,
        shape: convertSingleUnionTypeProperties(singleUnionType.shape)
    };
}

function convertSingleUnionTypeProperties(
    properties: IrVersions.V45.types.SingleUnionTypeProperties
): IrVersions.V44.types.SingleUnionTypeProperties {
    return IrVersions.V45.types.SingleUnionTypeProperties._visit<IrVersions.V44.types.SingleUnionTypeProperties>(
        properties,
        {
            samePropertiesAsObject: (declaredTypeName) =>
                IrVersions.V44.types.SingleUnionTypeProperties.samePropertiesAsObject(declaredTypeName),
            singleProperty: (singleProperty) =>
                IrVersions.V44.types.SingleUnionTypeProperties.singleProperty({
                    name: singleProperty.name,
                    type: convertTypeReference(singleProperty.type)
                }),
            noProperties: IrVersions.V44.types.SingleUnionTypeProperties.noProperties,
            _other: () => {
                throw new Error("Unknown SingleUnionTypeProperties: " + properties);
            }
        }
    );
}

function convertResolvedType(
    resolvedType: IrVersions.V45.types.ResolvedTypeReference
): IrVersions.V44.types.ResolvedTypeReference {
    return IrVersions.V45.types.ResolvedTypeReference._visit<IrVersions.V44.types.ResolvedTypeReference>(resolvedType, {
        container: (container) => IrVersions.V44.types.ResolvedTypeReference.container(convertContainerType(container)),
        named: IrVersions.V44.types.ResolvedTypeReference.named,
        primitive: (primitiveType) => {
            if (primitiveType === "BIG_INTEGER") {
                return IrVersions.V44.types.ResolvedTypeReference.primitive(IrVersions.V44.types.PrimitiveType.String);
            }
            return IrVersions.V44.types.ResolvedTypeReference.primitive(primitiveType);
        },
        unknown: IrVersions.V44.types.ResolvedTypeReference.unknown,
        _other: () => {
            throw new Error("Unknown ResolvedTypeReference: " + resolvedType.type);
        }
    });
}

function convertUndiscriminatedUnion(
    undiscriminatedUnion: IrVersions.V45.types.UndiscriminatedUnionTypeDeclaration
): IrVersions.V44.types.UndiscriminatedUnionTypeDeclaration {
    return {
        members: undiscriminatedUnion.members.map((member) => {
            return {
                ...member,
                type: convertTypeReference(member.type)
            };
        })
    };
}

function convertHttpService(service: IrVersions.V45.http.HttpService): IrVersions.V44.http.HttpService {
    return {
        availability: service.availability,
        name: service.name,
        displayName: service.displayName,
        basePath: service.basePath,
        pathParameters: service.pathParameters.map((pathParameter) => convertPathParameter(pathParameter)),
        headers: service.headers.map((header) => convertHttpHeader(header)),
        endpoints: service.endpoints.map((endpoint) => convertEndpoint(endpoint))
    };
}

function convertPathParameter(pathParameter: IrVersions.V45.http.PathParameter): IrVersions.V44.http.PathParameter {
    return {
        docs: pathParameter.docs,
        name: pathParameter.name,
        valueType: convertTypeReference(pathParameter.valueType),
        location: pathParameter.location,
        variable: pathParameter.variable
    };
}

function convertEndpoint(endpoint: IrVersions.V45.http.HttpEndpoint): IrVersions.V44.http.HttpEndpoint {
    return {
        id: endpoint.id,
        baseUrl: endpoint.baseUrl,
        fullPath: endpoint.fullPath,
        idempotent: endpoint.idempotent,
        pagination: endpoint.pagination,
        allPathParameters: endpoint.allPathParameters,
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
        examples: endpoint.examples
    };
}

function convertQueryParameter(queryParameter: IrVersions.V45.http.QueryParameter): IrVersions.V44.http.QueryParameter {
    return {
        availability: queryParameter.availability,
        docs: queryParameter.docs,
        name: queryParameter.name,
        valueType: convertTypeReference(queryParameter.valueType),
        allowMultiple: queryParameter.allowMultiple
    };
}

function convertSdkRequest(sdkRequest: IrVersions.V45.http.SdkRequest): IrVersions.V44.http.SdkRequest {
    return {
        requestParameterName: sdkRequest.requestParameterName,
        shape: convertSdkRequestShape(sdkRequest.shape)
    };
}

function convertSdkRequestShape(shape: IrVersions.V45.http.SdkRequestShape): IrVersions.V44.http.SdkRequestShape {
    return IrVersions.V45.http.SdkRequestShape._visit<IrVersions.V44.http.SdkRequestShape>(shape, {
        justRequestBody: (reference) =>
            IrVersions.V44.http.SdkRequestShape.justRequestBody({
                docs: reference.docs,
                requestBodyType: convertTypeReference(reference.requestBodyType),
                contentType: reference.contentType
            }),
        wrapper: IrVersions.V44.http.SdkRequestShape.wrapper,
        _other: () => {
            throw new Error("Unknown SdkRequestShape: " + shape.type);
        }
    });
}

function convertRequestBody(requestBody: IrVersions.V45.http.HttpRequestBody): IrVersions.V44.http.HttpRequestBody {
    return IrVersions.V45.http.HttpRequestBody._visit<IrVersions.V44.http.HttpRequestBody>(requestBody, {
        inlinedRequestBody: (inlinedRequestBody) =>
            IrVersions.V44.http.HttpRequestBody.inlinedRequestBody({
                name: inlinedRequestBody.name,
                extends: inlinedRequestBody.extends,
                contentType: inlinedRequestBody.contentType,
                extraProperties: inlinedRequestBody.extraProperties,
                properties: inlinedRequestBody.properties.map((property) => ({
                    docs: property.docs,
                    name: property.name,
                    valueType: convertTypeReference(property.valueType)
                }))
            }),
        reference: (reference) =>
            IrVersions.V44.http.HttpRequestBody.reference({
                docs: reference.docs,
                requestBodyType: convertTypeReference(reference.requestBodyType),
                contentType: reference.contentType
            }),
        fileUpload: (fileUpload) =>
            IrVersions.V44.http.HttpRequestBody.fileUpload({
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
        bytes: (bytes) => {
            return IrVersions.V44.http.HttpRequestBody.bytes(bytes);
        },
        _other: () => {
            throw new Error("Unknown HttpRequestBody: " + requestBody.type);
        }
    });
}

function convertErrorDeclaration(
    error: IrVersions.V45.errors.ErrorDeclaration
): IrVersions.V44.errors.ErrorDeclaration {
    return {
        docs: error.docs,
        name: error.name,
        discriminantValue: error.discriminantValue,
        type: error.type != null ? convertTypeReference(error.type) : undefined,
        statusCode: error.statusCode,
        examples: error.examples
    };
}
