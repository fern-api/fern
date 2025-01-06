import { mapValues } from "lodash-es";

import { GeneratorName } from "@fern-api/configuration-loader";
import { assertNever } from "@fern-api/core-utils";

import { IrVersions } from "../../ir-versions";
import {
    GeneratorWasNeverUpdatedToConsumeNewIR,
    GeneratorWasNotCreatedYet,
    IrMigration
} from "../../types/IrMigration";

export const V23_TO_V22_MIGRATION: IrMigration<
    IrVersions.V23.IntermediateRepresentation,
    IrVersions.V22.ir.IntermediateRepresentation
> = {
    laterVersion: "v23",
    earlierVersion: "v22",
    firstGeneratorVersionToConsumeNewIR: {
        [GeneratorName.TYPESCRIPT_NODE_SDK]: "0.7.4-rc3-4-g6cf92f81",
        [GeneratorName.TYPESCRIPT_BROWSER_SDK]: "0.7.4-rc3-4-g6cf92f81",
        [GeneratorName.TYPESCRIPT]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.TYPESCRIPT_SDK]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.TYPESCRIPT_EXPRESS]: "0.7.4-rc3-4-g6cf92f81",
        [GeneratorName.JAVA]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.JAVA_MODEL]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.JAVA_SDK]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.JAVA_SPRING]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.PYTHON_FASTAPI]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.PYTHON_PYDANTIC]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.OPENAPI_PYTHON_CLIENT]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.OPENAPI]: "0.0.28-3-g112d3dd",
        [GeneratorName.STOPLIGHT]: "0.0.28-3-g112d3dd",
        [GeneratorName.POSTMAN]: "0.0.44-4-gddab2ae",
        [GeneratorName.PYTHON_SDK]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.GO_FIBER]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.GO_MODEL]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.GO_SDK]: GeneratorWasNeverUpdatedToConsumeNewIR,
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
    migrateBackwards: (v23, context): IrVersions.V22.ir.IntermediateRepresentation => {
        const bytesEndpoints: IrVersions.V23.http.HttpEndpoint[] = [];
        const v22Services: Record<IrVersions.V22.commons.ServiceId, IrVersions.V22.http.HttpService> = {};
        for (const [serviceId, service] of Object.entries(v23.services)) {
            const v22Endpoints: IrVersions.V22.http.HttpEndpoint[] = [];
            for (const endpoint of service.endpoints) {
                const convertedEndpoint = convertEndpoint(endpoint);
                if (convertedEndpoint == null) {
                    bytesEndpoints.push(endpoint);
                } else {
                    v22Endpoints.push(convertedEndpoint);
                }
            }
            v22Services[serviceId] = {
                ...service,
                endpoints: v22Endpoints,
                headers: service.headers.map((header) => convertHeader(header)),
                pathParameters: service.pathParameters.map((pathParameter) => convertPathParameter(pathParameter))
            };
        }

        if (bytesEndpoints.length > 0) {
            context.taskContext.logger.warn(
                `Generator ${context.targetGenerator?.name}@${context.targetGenerator?.version}` +
                    " does not support bytes requests. "
            );
            if (bytesEndpoints.length === 1 && bytesEndpoints[0] != null) {
                context.taskContext.logger.warn(
                    `Therefore, endpoint ${bytesEndpoints[0].name.originalName} will be skipped.`
                );
            } else {
                context.taskContext.logger.warn(
                    `Therefore, endpoints ${bytesEndpoints
                        .map((endpoint) => endpoint.name.originalName)
                        .join(", ")} will be skipped.`
                );
            }
        }
        return {
            ...v23,
            auth: {
                ...v23.auth,
                schemes: v23.auth.schemes.map((scheme) => convertAuthScheme(scheme))
            },
            headers: v23.headers.map((header) => convertHeader(header)),
            types: mapValues(v23.types, (type) => convertType(type)),
            services: v22Services,
            errors: mapValues(v23.errors, (error) => convertError(error)),
            subpackages: v23.subpackages,
            pathParameters: v23.pathParameters.map((pathParameter) => convertPathParameter(pathParameter)),
            variables: v23.variables.map((variable) => convertVariable(variable))
        };
    }
};

function convertEndpoint(endpoint: IrVersions.V23.HttpEndpoint): IrVersions.V22.http.HttpEndpoint | undefined {
    let convertedRequestBody = undefined;
    if (endpoint.requestBody != null) {
        convertedRequestBody = convertRequestBody(endpoint.requestBody);
        if (convertedRequestBody == null) {
            return undefined;
        }
    }

    return {
        ...endpoint,
        headers: endpoint.headers.map((header) => convertHeader(header)),
        pathParameters: endpoint.pathParameters.map((pathParameter) => convertPathParameter(pathParameter)),
        allPathParameters: endpoint.allPathParameters.map((pathParameter) => convertPathParameter(pathParameter)),
        queryParameters: endpoint.queryParameters.map((queryParameter) => convertQueryParameter(queryParameter)),
        requestBody: convertedRequestBody,
        sdkRequest:
            endpoint.sdkRequest != null
                ? {
                      requestParameterName: endpoint.sdkRequest.requestParameterName,
                      shape: convertSdkRequestShape(endpoint.sdkRequest.shape)
                  }
                : undefined,
        response: endpoint.response != null ? convertResponse(endpoint.response) : undefined,
        examples: endpoint.examples.map((exampleEndpointCall) => convertExampleEndpointCall(exampleEndpointCall))
    };
}

function convertRequestBody(
    requestBody: IrVersions.V23.http.HttpRequestBody
): IrVersions.V22.http.HttpRequestBody | undefined {
    switch (requestBody.type) {
        case "bytes":
            return undefined;
        case "fileUpload":
            return IrVersions.V22.http.HttpRequestBody.fileUpload({
                ...requestBody,
                properties: requestBody.properties.map((property) => convertFileUploadRequestBodyProperty(property))
            });
        case "inlinedRequestBody":
            return IrVersions.V22.http.HttpRequestBody.inlinedRequestBody({
                ...requestBody,
                properties: requestBody.properties.map((property) => convertInlinedRequestBodyProperty(property))
            });
        case "reference":
            return IrVersions.V22.http.HttpRequestBody.reference({
                ...requestBody,
                requestBodyType: convertTypeReference(requestBody.requestBodyType)
            });
        default:
            assertNever(requestBody);
    }
}

function convertHeader(header: IrVersions.V23.HttpHeader): IrVersions.V22.http.HttpHeader {
    return {
        ...header,
        valueType: convertTypeReference(header.valueType)
    };
}

function convertAuthScheme(authScheme: IrVersions.V23.AuthScheme): IrVersions.V22.auth.AuthScheme {
    return authScheme._visit<IrVersions.V22.auth.AuthScheme>({
        bearer: IrVersions.V22.auth.AuthScheme.bearer,
        basic: IrVersions.V22.auth.AuthScheme.basic,
        header: (header) =>
            IrVersions.V22.auth.AuthScheme.header({
                ...header,
                valueType: convertTypeReference(header.valueType)
            }),
        _other: () => {
            throw new Error("Unknown auth scheme: " + authScheme.type);
        }
    });
}

function convertType(type: IrVersions.V23.TypeDeclaration): IrVersions.V22.types.TypeDeclaration {
    return {
        ...type,
        shape: convertTypeShape(type.shape),
        examples: type.examples.map((example) => convertTypeExample(example))
    };
}

function convertTypeShape(typeShape: IrVersions.V23.Type): IrVersions.V22.types.Type {
    return typeShape._visit<IrVersions.V22.types.Type>({
        alias: (alias) =>
            IrVersions.V22.types.Type.alias({
                ...alias,
                aliasOf: convertTypeReference(alias.aliasOf),
                resolvedType: convertResolvedTypeReference(alias.resolvedType)
            }),
        enum: IrVersions.V22.types.Type.enum,
        object: (object) =>
            IrVersions.V22.types.Type.object({
                ...object,
                properties: object.properties.map((property) => convertObjectProperty(property))
            }),
        union: (union) =>
            IrVersions.V22.types.Type.union({
                ...union,
                baseProperties: union.baseProperties.map((property) => convertObjectProperty(property)),
                types: union.types.map((variant) => ({
                    ...variant,
                    shape: convertSingleUnionTypeProperties(variant.shape)
                }))
            }),
        undiscriminatedUnion: (union) =>
            IrVersions.V22.types.Type.undiscriminatedUnion({
                ...union,
                members: union.members.map((member) => ({
                    ...member,
                    type: convertTypeReference(member.type)
                }))
            }),
        _other: () => {
            throw new Error("Unknown type shape: " + typeShape.type);
        }
    });
}

function convertTypeExample(typeExample: IrVersions.V23.ExampleType): IrVersions.V22.types.ExampleType {
    return {
        ...typeExample,
        shape: convertExampleTypeShape(typeExample.shape)
    };
}

function convertExampleTypeShape(
    exampleTypeShape: IrVersions.V23.ExampleTypeShape
): IrVersions.V22.types.ExampleTypeShape {
    return exampleTypeShape._visit<IrVersions.V22.types.ExampleTypeShape>({
        alias: (alias) =>
            IrVersions.V22.types.ExampleTypeShape.alias({
                ...alias,
                value: convertExampleTypeReference(alias.value)
            }),
        enum: IrVersions.V22.types.ExampleTypeShape.enum,
        object: (object) =>
            IrVersions.V22.types.ExampleTypeShape.object({
                ...object,
                properties: object.properties.map((property) => ({
                    ...property,
                    value: convertExampleTypeReference(property.value)
                }))
            }),
        union: (union) =>
            IrVersions.V22.types.ExampleTypeShape.union({
                ...union,
                properties: convertExampleSingleUnionTypeProperties(union.properties)
            }),
        _other: () => {
            throw new Error("Unknown example type shape: " + exampleTypeShape.type);
        }
    });
}

function convertExampleTypeReference(
    exampleTypeReference: IrVersions.V23.ExampleTypeReference
): IrVersions.V22.types.ExampleTypeReference {
    return {
        ...exampleTypeReference,
        shape: convertExampleTypeReferenceShape(exampleTypeReference.shape)
    };
}

function convertExampleTypeReferenceShape(
    exampleTypeReferenceShape: IrVersions.V23.ExampleTypeReferenceShape
): IrVersions.V22.types.ExampleTypeReferenceShape {
    return exampleTypeReferenceShape._visit<IrVersions.V22.types.ExampleTypeReferenceShape>({
        primitive: (primitive) =>
            IrVersions.V22.types.ExampleTypeReferenceShape.primitive(
                primitive._visit<IrVersions.V22.types.ExamplePrimitive>({
                    integer: IrVersions.V22.types.ExamplePrimitive.integer,
                    double: IrVersions.V22.types.ExamplePrimitive.double,
                    string: IrVersions.V22.types.ExamplePrimitive.string,
                    boolean: IrVersions.V22.types.ExamplePrimitive.boolean,
                    long: IrVersions.V22.types.ExamplePrimitive.long,
                    datetime: (datetime) => IrVersions.V22.types.ExamplePrimitive.datetime(datetime.toISOString()),
                    date: IrVersions.V22.types.ExamplePrimitive.date,
                    uuid: IrVersions.V22.types.ExamplePrimitive.uuid,
                    _other: () => {
                        throw new Error("Unknown example primitive: " + primitive.type);
                    }
                })
            ),
        named: (named) =>
            IrVersions.V22.types.ExampleTypeReferenceShape.named({
                ...named,
                shape: convertExampleTypeShape(named.shape)
            }),
        container: (container) =>
            IrVersions.V22.types.ExampleTypeReferenceShape.container(
                container._visit<IrVersions.V22.types.ExampleContainer>({
                    list: (items) =>
                        IrVersions.V22.types.ExampleContainer.list(
                            items.map((item) => convertExampleTypeReference(item))
                        ),
                    set: (items) =>
                        IrVersions.V22.types.ExampleContainer.set(
                            items.map((item) => convertExampleTypeReference(item))
                        ),
                    optional: (maybeItem) =>
                        IrVersions.V22.types.ExampleContainer.optional(
                            maybeItem != null ? convertExampleTypeReference(maybeItem) : undefined
                        ),
                    map: (pairs) =>
                        IrVersions.V22.types.ExampleContainer.map(
                            pairs.map((pair) => ({
                                key: convertExampleTypeReference(pair.key),
                                value: convertExampleTypeReference(pair.value)
                            }))
                        ),
                    _other: () => {
                        throw new Error("Unknown example container: " + container.type);
                    }
                })
            ),
        unknown: IrVersions.V22.types.ExampleTypeReferenceShape.unknown,
        _other: () => {
            throw new Error("Unknown example type reference shape: " + exampleTypeReferenceShape.type);
        }
    });
}

function convertExampleSingleUnionTypeProperties(
    exampleSingleUnionTypeProperties: IrVersions.V23.ExampleSingleUnionTypeProperties
): IrVersions.V22.types.ExampleSingleUnionTypeProperties {
    return exampleSingleUnionTypeProperties._visit<IrVersions.V22.types.ExampleSingleUnionTypeProperties>({
        singleProperty: (singleProperty) =>
            IrVersions.V22.types.ExampleSingleUnionTypeProperties.singleProperty({
                ...singleProperty,
                shape: convertExampleTypeReferenceShape(singleProperty.shape)
            }),
        noProperties: IrVersions.V22.types.ExampleSingleUnionTypeProperties.noProperties,
        samePropertiesAsObject: (samePropertiesAsObject) =>
            IrVersions.V22.types.ExampleSingleUnionTypeProperties.samePropertiesAsObject({
                ...samePropertiesAsObject,
                shape: convertExampleTypeShape(samePropertiesAsObject.shape)
            }),
        _other: () => {
            throw new Error("Unknown example single union type properties: " + exampleSingleUnionTypeProperties.type);
        }
    });
}

function convertTypeReference(typeReference: IrVersions.V23.TypeReference): IrVersions.V22.types.TypeReference {
    return typeReference._visit<IrVersions.V22.types.TypeReference>({
        container: (container) => IrVersions.V22.types.TypeReference.container(convertContainerType(container)),
        primitive: IrVersions.V22.types.TypeReference.primitive,
        named: IrVersions.V22.types.TypeReference.named,
        unknown: IrVersions.V22.types.TypeReference.unknown,
        _other: () => {
            throw new Error("Unknown type reference: " + typeReference.type);
        }
    });
}

function convertContainerType(container: IrVersions.V23.ContainerType): IrVersions.V22.types.ContainerType {
    return container._visit<IrVersions.V22.types.ContainerType>({
        list: (itemType) => IrVersions.V22.types.ContainerType.list(convertTypeReference(itemType)),
        set: (itemType) => IrVersions.V22.types.ContainerType.set(convertTypeReference(itemType)),
        optional: (itemType) => IrVersions.V22.types.ContainerType.optional(convertTypeReference(itemType)),
        map: (mapType) =>
            IrVersions.V22.types.ContainerType.map({
                keyType: convertTypeReference(mapType.keyType),
                valueType: convertTypeReference(mapType.valueType)
            }),
        literal: IrVersions.V22.types.ContainerType.literal,
        _other: () => {
            throw new Error("Unknown container type: " + container.type);
        }
    });
}

function convertResolvedTypeReference(
    resolvedTypeReference: IrVersions.V23.ResolvedTypeReference
): IrVersions.V22.types.ResolvedTypeReference {
    return resolvedTypeReference._visit<IrVersions.V22.types.ResolvedTypeReference>({
        container: (container) => IrVersions.V22.types.ResolvedTypeReference.container(convertContainerType(container)),
        primitive: IrVersions.V22.types.ResolvedTypeReference.primitive,
        named: IrVersions.V22.types.ResolvedTypeReference.named,
        unknown: IrVersions.V22.types.ResolvedTypeReference.unknown,
        _other: () => {
            throw new Error("Unknown resolved type reference: " + resolvedTypeReference.type);
        }
    });
}

function convertObjectProperty(property: IrVersions.V23.ObjectProperty): IrVersions.V22.types.ObjectProperty {
    return {
        ...property,
        valueType: convertTypeReference(property.valueType)
    };
}

function convertSingleUnionTypeProperties(
    properties: IrVersions.V23.SingleUnionTypeProperties
): IrVersions.V22.types.SingleUnionTypeProperties {
    return properties._visit<IrVersions.V22.types.SingleUnionTypeProperties>({
        noProperties: IrVersions.V22.types.SingleUnionTypeProperties.noProperties,
        singleProperty: (singleProperty) =>
            IrVersions.V22.types.SingleUnionTypeProperties.singleProperty({
                ...singleProperty,
                type: convertTypeReference(singleProperty.type)
            }),
        samePropertiesAsObject: IrVersions.V22.types.SingleUnionTypeProperties.samePropertiesAsObject,
        _other: () => {
            throw new Error("Unknown single union type properties: " + properties.propertiesType);
        }
    });
}

function convertError(error: IrVersions.V23.ErrorDeclaration): IrVersions.V22.errors.ErrorDeclaration {
    return {
        ...error,
        type: error.type != null ? convertTypeReference(error.type) : undefined
    };
}

function convertVariable(variable: IrVersions.V23.VariableDeclaration): IrVersions.V22.variables.VariableDeclaration {
    return {
        ...variable,
        type: convertTypeReference(variable.type)
    };
}

function convertPathParameter(pathParameter: IrVersions.V23.PathParameter): IrVersions.V22.http.PathParameter {
    return {
        ...pathParameter,
        valueType: convertTypeReference(pathParameter.valueType)
    };
}

function convertQueryParameter(queryParameter: IrVersions.V23.QueryParameter): IrVersions.V22.http.QueryParameter {
    return {
        ...queryParameter,
        valueType: convertTypeReference(queryParameter.valueType)
    };
}

function convertSdkRequestShape(sdkRequestShape: IrVersions.V23.SdkRequestShape): IrVersions.V22.http.SdkRequestShape {
    return sdkRequestShape._visit<IrVersions.V22.http.SdkRequestShape>({
        justRequestBody: (justRequestBody) =>
            IrVersions.V22.http.SdkRequestShape.justRequestBody({
                ...justRequestBody,
                requestBodyType: convertTypeReference(justRequestBody.requestBodyType)
            }),
        wrapper: IrVersions.V22.http.SdkRequestShape.wrapper,
        _other: () => {
            throw new Error("Unknown SDK request shape: " + sdkRequestShape.type);
        }
    });
}

function convertResponse(response: IrVersions.V23.HttpResponse): IrVersions.V22.http.HttpResponse {
    return response._visit<IrVersions.V22.http.HttpResponse>({
        json: (json) =>
            IrVersions.V22.http.HttpResponse.json({
                ...json,
                responseBodyType: convertTypeReference(json.responseBodyType)
            }),
        fileDownload: IrVersions.V22.http.HttpResponse.fileDownload,
        streaming: (streaming) =>
            IrVersions.V22.http.HttpResponse.streaming({
                ...streaming,
                dataEventType: streaming.dataEventType._visit<IrVersions.V22.http.StreamingResponseChunkType>({
                    json: (json) => IrVersions.V22.http.StreamingResponseChunkType.json(convertTypeReference(json)),
                    text: IrVersions.V22.http.StreamingResponseChunkType.text,
                    _other: () => {
                        throw new Error("Unknown streaming data event type: " + streaming.dataEventType.type);
                    }
                })
            }),
        _other: () => {
            throw new Error("Unknown response: " + response.type);
        }
    });
}

function convertExampleEndpointCall(
    exampleEndpointCall: IrVersions.V23.ExampleEndpointCall
): IrVersions.V22.http.ExampleEndpointCall {
    return {
        ...exampleEndpointCall,
        rootPathParameters: exampleEndpointCall.rootPathParameters.map((pathParameter) =>
            convertExamplePathParameter(pathParameter)
        ),
        servicePathParameters: exampleEndpointCall.servicePathParameters.map((pathParameter) =>
            convertExamplePathParameter(pathParameter)
        ),
        endpointPathParameters: exampleEndpointCall.endpointPathParameters.map((pathParameter) =>
            convertExamplePathParameter(pathParameter)
        ),
        serviceHeaders: exampleEndpointCall.serviceHeaders.map((header) => convertExampleHeader(header)),
        endpointHeaders: exampleEndpointCall.endpointHeaders.map((header) => convertExampleHeader(header)),
        queryParameters: exampleEndpointCall.queryParameters.map((queryParameter) =>
            convertExampleQueryParameter(queryParameter)
        ),
        request:
            exampleEndpointCall.request != null
                ? exampleEndpointCall.request._visit<IrVersions.V22.http.ExampleRequestBody>({
                      inlinedRequestBody: (inlinedRequestBody) =>
                          IrVersions.V22.http.ExampleRequestBody.inlinedRequestBody({
                              ...inlinedRequestBody,
                              properties: inlinedRequestBody.properties.map((property) => ({
                                  ...property,
                                  value: convertExampleTypeReference(property.value)
                              }))
                          }),
                      reference: (reference) =>
                          IrVersions.V22.http.ExampleRequestBody.reference({
                              ...reference,
                              shape: convertExampleTypeReferenceShape(reference.shape)
                          }),
                      _other: () => {
                          throw new Error("Unknown example request body: " + exampleEndpointCall.request?.type);
                      }
                  })
                : undefined,
        response: exampleEndpointCall.response._visit<IrVersions.V22.http.ExampleResponse>({
            ok: (okResponse) =>
                IrVersions.V22.http.ExampleResponse.ok({
                    ...okResponse,
                    body: okResponse.body != null ? convertExampleTypeReference(okResponse.body) : undefined
                }),
            error: (errorResponse) =>
                IrVersions.V22.http.ExampleResponse.error({
                    ...errorResponse,
                    body: errorResponse.body != null ? convertExampleTypeReference(errorResponse.body) : undefined
                }),
            _other: () => {
                throw new Error("Unknown example response: " + exampleEndpointCall.response.type);
            }
        })
    };
}

function convertExamplePathParameter(
    examplePathParameter: IrVersions.V23.ExamplePathParameter
): IrVersions.V22.http.ExamplePathParameter {
    return {
        ...examplePathParameter,
        value: convertExampleTypeReference(examplePathParameter.value)
    };
}

function convertExampleQueryParameter(
    exampleQueryParameter: IrVersions.V23.ExampleQueryParameter
): IrVersions.V22.http.ExampleQueryParameter {
    return {
        ...exampleQueryParameter,
        value: convertExampleTypeReference(exampleQueryParameter.value)
    };
}

function convertExampleHeader(exampleHeader: IrVersions.V23.ExampleHeader): IrVersions.V22.http.ExampleHeader {
    return {
        ...exampleHeader,
        value: convertExampleTypeReference(exampleHeader.value)
    };
}

function convertFileUploadRequestBodyProperty(
    fileUploadRequestBodyProperty: IrVersions.V23.FileUploadRequestProperty
): IrVersions.V22.http.FileUploadRequestProperty {
    return fileUploadRequestBodyProperty._visit<IrVersions.V22.http.FileUploadRequestProperty>({
        file: IrVersions.V22.http.FileUploadRequestProperty.file,
        bodyProperty: (bodyProperty) =>
            IrVersions.V22.http.FileUploadRequestProperty.bodyProperty({
                ...bodyProperty,
                valueType: convertTypeReference(bodyProperty.valueType)
            }),
        _other: () => {
            throw new Error("Unknown file upload request body property: " + fileUploadRequestBodyProperty.type);
        }
    });
}

function convertInlinedRequestBodyProperty(
    inlinedRequestBodyProperty: IrVersions.V23.InlinedRequestBodyProperty
): IrVersions.V22.http.InlinedRequestBodyProperty {
    return {
        ...inlinedRequestBodyProperty,
        valueType: convertTypeReference(inlinedRequestBodyProperty.valueType)
    };
}
