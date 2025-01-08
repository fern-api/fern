import { mapValues } from "lodash-es";

import { GeneratorName } from "@fern-api/configuration-loader";

import { IrSerialization } from "../../ir-serialization";
import { IrVersions } from "../../ir-versions";
import {
    GeneratorWasNeverUpdatedToConsumeNewIR,
    GeneratorWasNotCreatedYet,
    IrMigration
} from "../../types/IrMigration";

export const V50_TO_V49_MIGRATION: IrMigration<
    IrVersions.V50.ir.IntermediateRepresentation,
    IrVersions.V49.ir.IntermediateRepresentation
> = {
    laterVersion: "v50",
    earlierVersion: "v49",
    firstGeneratorVersionToConsumeNewIR: {
        [GeneratorName.TYPESCRIPT_NODE_SDK]: "0.34.0",
        [GeneratorName.TYPESCRIPT_BROWSER_SDK]: "0.34.0",
        [GeneratorName.TYPESCRIPT]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.TYPESCRIPT_SDK]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.TYPESCRIPT_EXPRESS]: "0.17.2",
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
        [GeneratorName.PYTHON_SDK]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.GO_FIBER]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.GO_MODEL]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.GO_SDK]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.RUBY_MODEL]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.RUBY_SDK]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.CSHARP_MODEL]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.CSHARP_SDK]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.SWIFT_MODEL]: "0.0.0",
        [GeneratorName.SWIFT_SDK]: GeneratorWasNotCreatedYet,
        [GeneratorName.PHP_MODEL]: GeneratorWasNotCreatedYet,
        [GeneratorName.PHP_SDK]: GeneratorWasNotCreatedYet
    },
    jsonifyEarlierVersion: (ir) =>
        IrSerialization.V49.IntermediateRepresentation.jsonOrThrow(ir, {
            unrecognizedObjectKeys: "strip",
            skipValidation: true
        }),
    migrateBackwards: (v50): IrVersions.V49.ir.IntermediateRepresentation => {
        const v49Types: Record<string, IrVersions.V49.types.TypeDeclaration> = mapValues(
            v50.types,
            (typeDeclaration) => {
                return {
                    ...typeDeclaration,
                    shape: IrVersions.V50.types.Type._visit<IrVersions.V49.types.Type>(typeDeclaration.shape, {
                        union: (union) => {
                            return IrVersions.V49.types.Type.union({
                                ...union,
                                baseProperties: union.baseProperties.map((objectProperty) => {
                                    return {
                                        ...objectProperty,
                                        valueType: convertTypeReference(objectProperty.valueType)
                                    };
                                }),
                                types: union.types.map((singleUnionType) => convertSingleUnionType(singleUnionType))
                            });
                        },
                        enum: IrVersions.V49.types.Type.enum,
                        object: (object) => {
                            return IrVersions.V49.types.Type.object({
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
                            return IrVersions.V49.types.Type.alias({
                                aliasOf: convertTypeReference(aliasTypeDeclaration.aliasOf),
                                resolvedType: convertResolvedType(aliasTypeDeclaration.resolvedType)
                            });
                        },
                        undiscriminatedUnion: (undiscriminatedUnion) => {
                            return IrVersions.V49.types.Type.undiscriminatedUnion(
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
            ...v50,
            auth: convertAuth(v50.auth),
            headers: v50.headers.map((header) => convertHttpHeader(header)),
            idempotencyHeaders: v50.idempotencyHeaders.map((header) => convertHttpHeader(header)),
            types: v49Types,
            services: mapValues(v50.services, (service) => convertHttpService(service)),
            errors: mapValues(v50.errors, (error) => convertErrorDeclaration(error)),
            webhookGroups: mapValues(v50.webhookGroups, (webhookGroup) => convertWebhookGroup(webhookGroup)),
            websocketChannels: mapValues(v50.websocketChannels, (websocketChannel) =>
                convertWebsocketChannel(websocketChannel)
            ),
            pathParameters: v50.pathParameters.map((pathParameter) => convertPathParameter(pathParameter)),
            variables: v50.variables.map((variable) => convertVariable(variable))
        };
    }
};

function convertWebsocketChannel(
    websocketChannel: IrVersions.V50.websocket.WebSocketChannel
): IrVersions.V49.websocket.WebSocketChannel {
    return {
        ...websocketChannel,
        headers: websocketChannel.headers.map((header) => convertHttpHeader(header)),
        queryParameters: websocketChannel.queryParameters.map((queryParameter) =>
            convertQueryParameter(queryParameter)
        ),
        pathParameters: websocketChannel.pathParameters.map((pathParameter) => convertPathParameter(pathParameter)),
        messages: websocketChannel.messages.map((message) => convertWebsocketMessage(message))
    };
}

function convertWebsocketMessage(
    websocketMessage: IrVersions.V50.websocket.WebSocketMessage
): IrVersions.V49.websocket.WebSocketMessage {
    return {
        ...websocketMessage,
        body: convertWebsocketMessageBody(websocketMessage.body)
    };
}

function convertWebsocketMessageBody(
    body: IrVersions.V50.websocket.WebSocketMessageBody
): IrVersions.V49.websocket.WebSocketMessageBody {
    switch (body.type) {
        case "inlinedBody":
            return IrVersions.V49.websocket.WebSocketMessageBody.inlinedBody({
                ...body,
                properties: body.properties.map((property) => {
                    return {
                        ...property,
                        valueType: convertTypeReference(property.valueType)
                    };
                })
            });
        case "reference":
            return IrVersions.V49.websocket.WebSocketMessageBody.reference({
                ...body,
                bodyType: convertTypeReference(body.bodyType)
            });
    }
}

function convertWebhookGroup(webhookGroup: IrVersions.V50.webhooks.WebhookGroup): IrVersions.V49.webhooks.WebhookGroup {
    return webhookGroup.map((webhook) => convertWebhook(webhook));
}

function convertWebhook(webhook: IrVersions.V50.webhooks.Webhook): IrVersions.V49.webhooks.Webhook {
    return {
        ...webhook,
        headers: webhook.headers.map((header) => convertHttpHeader(header)),
        payload: convertWebhookPayload(webhook.payload)
    };
}

function convertWebhookPayload(
    payload: IrVersions.V50.webhooks.WebhookPayload
): IrVersions.V49.webhooks.WebhookPayload {
    switch (payload.type) {
        case "reference":
            return IrVersions.V49.webhooks.WebhookPayload.reference({
                ...payload,
                payloadType: convertTypeReference(payload.payloadType)
            });
        case "inlinedPayload":
            return IrVersions.V49.webhooks.WebhookPayload.inlinedPayload({
                ...payload,
                properties: payload.properties.map((property) => {
                    return {
                        ...property,
                        valueType: convertTypeReference(property.valueType)
                    };
                })
            });
    }
}

function convertAuth(auth: IrVersions.V50.auth.ApiAuth): IrVersions.V49.auth.ApiAuth {
    return {
        ...auth,
        schemes: auth.schemes.map((scheme) => {
            switch (scheme.type) {
                case "basic":
                    return IrVersions.V49.auth.AuthScheme.basic(scheme);
                case "bearer":
                    return IrVersions.V49.auth.AuthScheme.bearer(scheme);
                case "header":
                    return IrVersions.V49.auth.AuthScheme.header(convertHeader(scheme));
                case "oauth":
                    return IrVersions.V49.auth.AuthScheme.oauth(convertOAuth(scheme));
            }
        })
    };
}

function convertHeader(header: IrVersions.V50.auth.AuthScheme.Header): IrVersions.V49.auth.HeaderAuthScheme {
    return {
        ...header,
        valueType: convertTypeReference(header.valueType)
    };
}

function convertOAuth(oauth: IrVersions.V50.auth.AuthScheme.Oauth): IrVersions.V49.auth.OAuthScheme {
    return {
        ...oauth,
        configuration: IrVersions.V49.auth.OAuthConfiguration.clientCredentials({
            ...oauth.configuration,
            tokenEndpoint: convertOAuthTokenEndpoint(oauth.configuration.tokenEndpoint),
            refreshEndpoint:
                oauth.configuration.refreshEndpoint != null
                    ? convertOAuthRefreshEndpoint(oauth.configuration.refreshEndpoint)
                    : undefined
        })
    };
}

function convertOAuthTokenEndpoint(
    tokenEndpoint: IrVersions.V50.auth.OAuthTokenEndpoint
): IrVersions.V49.auth.OAuthTokenEndpoint {
    return {
        ...tokenEndpoint,
        requestProperties: {
            clientId: convertRequestProperty(tokenEndpoint.requestProperties.clientId),
            clientSecret: convertRequestProperty(tokenEndpoint.requestProperties.clientSecret),
            scopes:
                tokenEndpoint.requestProperties.scopes != null
                    ? convertRequestProperty(tokenEndpoint.requestProperties.scopes)
                    : undefined
        },
        responseProperties: {
            accessToken: convertResponseProperty(tokenEndpoint.responseProperties.accessToken),
            expiresIn:
                tokenEndpoint.responseProperties.expiresIn != null
                    ? convertResponseProperty(tokenEndpoint.responseProperties.expiresIn)
                    : undefined,
            refreshToken:
                tokenEndpoint.responseProperties.refreshToken != null
                    ? convertResponseProperty(tokenEndpoint.responseProperties.refreshToken)
                    : undefined
        }
    };
}

function convertOAuthRefreshEndpoint(
    refreshEndpoint: IrVersions.V50.auth.OAuthRefreshEndpoint
): IrVersions.V49.auth.OAuthRefreshEndpoint | undefined {
    return {
        ...refreshEndpoint,
        requestProperties: {
            refreshToken: convertRequestProperty(refreshEndpoint.requestProperties.refreshToken)
        },
        responseProperties: {
            accessToken: convertResponseProperty(refreshEndpoint.responseProperties.accessToken),
            expiresIn:
                refreshEndpoint.responseProperties.expiresIn != null
                    ? convertResponseProperty(refreshEndpoint.responseProperties.expiresIn)
                    : undefined,
            refreshToken:
                refreshEndpoint.responseProperties.refreshToken != null
                    ? convertResponseProperty(refreshEndpoint.responseProperties.refreshToken)
                    : undefined
        }
    };
}

function convertHttpHeader(header: IrVersions.V50.http.HttpHeader): IrVersions.V49.http.HttpHeader {
    return {
        ...header,
        valueType: convertTypeReference(header.valueType)
    };
}

function convertTypeReference(typeReference: IrVersions.V50.types.TypeReference): IrVersions.V49.types.TypeReference {
    return IrVersions.V50.types.TypeReference._visit<IrVersions.V49.types.TypeReference>(typeReference, {
        container: (container) => IrVersions.V49.types.TypeReference.container(convertContainerType(container)),
        primitive: (primitiveType) => {
            if (primitiveType.v2?.type === "integer") {
                return IrVersions.V49.types.TypeReference.primitive({
                    v1: primitiveType.v1,
                    v2: IrVersions.V49.types.PrimitiveTypeV2.integer(primitiveType.v2)
                });
            } else if (primitiveType.v2?.type === "double") {
                return IrVersions.V49.types.TypeReference.primitive({
                    v1: primitiveType.v1,
                    v2: IrVersions.V49.types.PrimitiveTypeV2.double(primitiveType.v2)
                });
            } else if (primitiveType.v2?.type === "string") {
                return IrVersions.V49.types.TypeReference.primitive({
                    v1: primitiveType.v1,
                    v2: IrVersions.V49.types.PrimitiveTypeV2.string(primitiveType.v2)
                });
            } else {
                return IrVersions.V49.types.TypeReference.primitive({
                    v1: primitiveType.v1,
                    v2: undefined
                });
            }
        },
        named: IrVersions.V49.types.TypeReference.named,
        unknown: IrVersions.V49.types.TypeReference.unknown,
        _other: () => {
            throw new Error("Unknown type reference: " + typeReference.type);
        }
    });
}

function convertContainerType(container: IrVersions.V50.types.ContainerType): IrVersions.V49.types.ContainerType {
    return IrVersions.V50.types.ContainerType._visit<IrVersions.V49.types.ContainerType>(container, {
        list: (itemType) => IrVersions.V49.types.ContainerType.list(convertTypeReference(itemType)),
        optional: (itemType) => IrVersions.V49.types.ContainerType.optional(convertTypeReference(itemType)),
        set: (itemType) => IrVersions.V49.types.ContainerType.set(convertTypeReference(itemType)),
        map: ({ keyType, valueType }) =>
            IrVersions.V49.types.ContainerType.map({
                keyType: convertTypeReference(keyType),
                valueType: convertTypeReference(valueType)
            }),
        literal: IrVersions.V49.types.ContainerType.literal,
        _other: () => {
            throw new Error("Unknown ContainerType: " + container.type);
        }
    });
}

function convertSingleUnionType(
    singleUnionType: IrVersions.V50.types.SingleUnionType
): IrVersions.V49.types.SingleUnionType {
    return {
        ...singleUnionType,
        shape: convertSingleUnionTypeProperties(singleUnionType.shape)
    };
}

function convertSingleUnionTypeProperties(
    properties: IrVersions.V50.types.SingleUnionTypeProperties
): IrVersions.V49.types.SingleUnionTypeProperties {
    return IrVersions.V50.types.SingleUnionTypeProperties._visit<IrVersions.V49.types.SingleUnionTypeProperties>(
        properties,
        {
            samePropertiesAsObject: (declaredTypeName) =>
                IrVersions.V49.types.SingleUnionTypeProperties.samePropertiesAsObject(declaredTypeName),
            singleProperty: (singleProperty) =>
                IrVersions.V49.types.SingleUnionTypeProperties.singleProperty({
                    ...singleProperty,
                    type: convertTypeReference(singleProperty.type)
                }),
            noProperties: IrVersions.V49.types.SingleUnionTypeProperties.noProperties,
            _other: () => {
                throw new Error(`Unknown SingleUnionTypeProperties: ${JSON.stringify(properties)}`);
            }
        }
    );
}

function convertResolvedType(
    resolvedType: IrVersions.V50.types.ResolvedTypeReference
): IrVersions.V49.types.ResolvedTypeReference {
    return IrVersions.V50.types.ResolvedTypeReference._visit<IrVersions.V49.types.ResolvedTypeReference>(resolvedType, {
        container: (container) => IrVersions.V49.types.ResolvedTypeReference.container(convertContainerType(container)),
        named: IrVersions.V49.types.ResolvedTypeReference.named,
        primitive: (primitiveType) => {
            if (primitiveType.v2?.type === "integer") {
                return IrVersions.V49.types.ResolvedTypeReference.primitive({
                    v1: primitiveType.v1,
                    v2: IrVersions.V49.types.PrimitiveTypeV2.integer(primitiveType.v2)
                });
            } else if (primitiveType.v2?.type === "double") {
                return IrVersions.V49.types.ResolvedTypeReference.primitive({
                    v1: primitiveType.v1,
                    v2: IrVersions.V49.types.PrimitiveTypeV2.double(primitiveType.v2)
                });
            } else if (primitiveType.v2?.type === "string") {
                return IrVersions.V49.types.ResolvedTypeReference.primitive({
                    v1: primitiveType.v1,
                    v2: IrVersions.V49.types.PrimitiveTypeV2.string(primitiveType.v2)
                });
            } else {
                return IrVersions.V49.types.ResolvedTypeReference.primitive({
                    v1: primitiveType.v1,
                    v2: undefined
                });
            }
        },
        unknown: IrVersions.V49.types.ResolvedTypeReference.unknown,
        _other: () => {
            throw new Error("Unknown ResolvedTypeReference: " + resolvedType.type);
        }
    });
}

function convertUndiscriminatedUnion(
    undiscriminatedUnion: IrVersions.V50.types.UndiscriminatedUnionTypeDeclaration
): IrVersions.V49.types.UndiscriminatedUnionTypeDeclaration {
    return {
        members: undiscriminatedUnion.members.map((member) => {
            return {
                ...member,
                type: convertTypeReference(member.type)
            };
        })
    };
}

function convertHttpService(service: IrVersions.V50.http.HttpService): IrVersions.V49.http.HttpService {
    return {
        ...service,
        pathParameters: service.pathParameters.map((pathParameter) => convertPathParameter(pathParameter)),
        headers: service.headers.map((header) => convertHttpHeader(header)),
        endpoints: service.endpoints.map((endpoint) => convertEndpoint(endpoint))
    };
}

function convertPathParameter(pathParameter: IrVersions.V50.http.PathParameter): IrVersions.V49.http.PathParameter {
    return {
        ...pathParameter,
        valueType: convertTypeReference(pathParameter.valueType)
    };
}

function convertVariable(variable: IrVersions.V50.VariableDeclaration): IrVersions.V49.VariableDeclaration {
    return {
        ...variable,
        type: convertTypeReference(variable.type)
    };
}

function convertEndpoint(endpoint: IrVersions.V50.http.HttpEndpoint): IrVersions.V49.http.HttpEndpoint {
    return {
        ...endpoint,
        pagination: endpoint.pagination != null ? convertPagination(endpoint.pagination) : undefined,
        allPathParameters: endpoint.allPathParameters.map((pathParameter) => convertPathParameter(pathParameter)),
        pathParameters: endpoint.pathParameters.map((pathParameter) => convertPathParameter(pathParameter)),
        sdkRequest: endpoint.sdkRequest != null ? convertSdkRequest(endpoint.sdkRequest) : undefined,
        requestBody: endpoint.requestBody != null ? convertRequestBody(endpoint.requestBody) : undefined,
        response: endpoint.response != null ? convertHttpResponse(endpoint.response) : undefined,
        headers: endpoint.headers.map((header) => convertHttpHeader(header)),
        queryParameters: endpoint.queryParameters.map((queryParameter) => convertQueryParameter(queryParameter))
    };
}

function convertHttpResponse(response: IrVersions.V50.http.HttpResponse): IrVersions.V49.http.HttpResponse {
    return {
        ...response,
        body: response.body != null ? convertResponseBody(response.body) : undefined
    };
}

function convertResponseBody(responseBody: IrVersions.V50.http.HttpResponseBody): IrVersions.V49.http.HttpResponseBody {
    switch (responseBody.type) {
        case "json":
            return IrVersions.V49.http.HttpResponseBody.json(convertJsonResponse(responseBody.value));
        case "fileDownload":
            return IrVersions.V49.http.HttpResponseBody.fileDownload(responseBody);
        case "text":
            return IrVersions.V49.http.HttpResponseBody.text(responseBody);
        case "streaming":
            return IrVersions.V49.http.HttpResponseBody.streaming(convertStreamingResponse(responseBody.value));
        case "streamParameter":
            return IrVersions.V49.http.HttpResponseBody.streamParameter(convertStreamParameter(responseBody));
    }
}

function convertJsonResponse(jsonResponse: IrVersions.V50.http.JsonResponse): IrVersions.V49.http.JsonResponse {
    switch (jsonResponse.type) {
        case "response":
            return IrVersions.V49.http.JsonResponse.response({
                ...jsonResponse,
                responseBodyType: convertTypeReference(jsonResponse.responseBodyType)
            });
        case "nestedPropertyAsResponse":
            return IrVersions.V49.http.JsonResponse.nestedPropertyAsResponse({
                ...jsonResponse,
                responseBodyType: convertTypeReference(jsonResponse.responseBodyType),
                responseProperty:
                    jsonResponse.responseProperty != null
                        ? convertObjectProperty(jsonResponse.responseProperty)
                        : undefined
            });
    }
}

function convertStreamingResponse(
    streamingResponse: IrVersions.V50.http.StreamingResponse
): IrVersions.V49.http.StreamingResponse {
    switch (streamingResponse.type) {
        case "json":
            return IrVersions.V49.http.StreamingResponse.json({
                ...streamingResponse,
                payload: convertTypeReference(streamingResponse.payload)
            });
        case "text":
            return IrVersions.V49.http.StreamingResponse.text(streamingResponse);
        case "sse":
            return IrVersions.V49.http.StreamingResponse.sse({
                ...streamingResponse,
                payload: convertTypeReference(streamingResponse.payload)
            });
    }
}

function convertNonStreamHttpResponse(
    nonStreamingResponse: IrVersions.V50.http.NonStreamHttpResponseBody
): IrVersions.V49.http.NonStreamHttpResponseBody {
    switch (nonStreamingResponse.type) {
        case "json":
            return IrVersions.V49.http.NonStreamHttpResponseBody.json(convertJsonResponse(nonStreamingResponse.value));
        case "text":
            return IrVersions.V49.http.NonStreamHttpResponseBody.text(nonStreamingResponse);
        case "fileDownload":
            return IrVersions.V49.http.NonStreamHttpResponseBody.fileDownload(nonStreamingResponse);
    }
}

function convertStreamParameter(
    streamingResponse: IrVersions.V50.http.StreamParameterResponse
): IrVersions.V49.http.StreamParameterResponse {
    return {
        nonStreamResponse: convertNonStreamHttpResponse(streamingResponse.nonStreamResponse),
        streamResponse: convertStreamingResponse(streamingResponse.streamResponse)
    };
}

function convertPagination(pagination: IrVersions.V50.http.Pagination): IrVersions.V49.http.Pagination {
    switch (pagination.type) {
        case "cursor":
            return IrVersions.V49.http.Pagination.cursor(convertCursorPagination(pagination));
        case "offset":
            return IrVersions.V49.http.Pagination.offset(convertOffsetPagination(pagination));
    }
}

function convertCursorPagination(
    cursorPagination: IrVersions.V50.http.CursorPagination
): IrVersions.V49.http.CursorPagination {
    return {
        ...cursorPagination,
        page: convertRequestProperty(cursorPagination.page),
        next: convertResponseProperty(cursorPagination.next),
        results: convertResponseProperty(cursorPagination.results)
    };
}

function convertOffsetPagination(
    offsetPagination: IrVersions.V50.http.OffsetPagination
): IrVersions.V49.http.OffsetPagination {
    return {
        ...offsetPagination,
        page: convertRequestProperty(offsetPagination.page),
        results: convertResponseProperty(offsetPagination.results),
        step: offsetPagination.step != null ? convertRequestProperty(offsetPagination.step) : undefined
    };
}

function convertRequestProperty(
    requestProperty: IrVersions.V50.http.RequestProperty
): IrVersions.V49.http.RequestProperty {
    return {
        ...requestProperty,
        property: convertRequestPropertValue(requestProperty.property)
    };
}

function convertRequestPropertValue(
    requestPropertyValue: IrVersions.V50.http.RequestPropertyValue
): IrVersions.V49.http.RequestPropertyValue {
    switch (requestPropertyValue.type) {
        case "query":
            return IrVersions.V49.RequestPropertyValue.query(convertQueryParameter(requestPropertyValue));
        case "body":
            return IrVersions.V49.RequestPropertyValue.body(convertObjectProperty(requestPropertyValue));
    }
}

function convertResponseProperty(
    responseProperty: IrVersions.V50.http.ResponseProperty
): IrVersions.V49.http.ResponseProperty {
    return {
        ...responseProperty,
        property: convertObjectProperty(responseProperty.property)
    };
}

function convertObjectProperty(
    objectProperty: IrVersions.V50.types.ObjectProperty
): IrVersions.V49.types.ObjectProperty {
    return {
        ...objectProperty,
        valueType: convertTypeReference(objectProperty.valueType)
    };
}

function convertQueryParameter(queryParameter: IrVersions.V50.http.QueryParameter): IrVersions.V49.http.QueryParameter {
    return {
        ...queryParameter,
        valueType: convertTypeReference(queryParameter.valueType)
    };
}

function convertSdkRequest(sdkRequest: IrVersions.V50.http.SdkRequest): IrVersions.V49.http.SdkRequest {
    return {
        ...sdkRequest,
        streamParameter:
            sdkRequest.streamParameter != null ? convertRequestProperty(sdkRequest.streamParameter) : undefined,
        shape: convertSdkRequestShape(sdkRequest.shape)
    };
}

function convertSdkRequestShape(shape: IrVersions.V50.http.SdkRequestShape): IrVersions.V49.http.SdkRequestShape {
    return IrVersions.V50.http.SdkRequestShape._visit<IrVersions.V49.http.SdkRequestShape>(shape, {
        justRequestBody: (reference) =>
            IrVersions.V49.http.SdkRequestShape.justRequestBody(convertSdkRequestBodyType(reference)),
        wrapper: IrVersions.V49.http.SdkRequestShape.wrapper,
        _other: () => {
            throw new Error("Unknown SdkRequestShape: " + shape.type);
        }
    });
}

function convertSdkRequestBodyType(
    shape: IrVersions.V50.http.SdkRequestBodyType
): IrVersions.V49.http.SdkRequestBodyType {
    switch (shape.type) {
        case "bytes":
            return IrVersions.V49.http.SdkRequestBodyType.bytes(shape);
        case "typeReference":
            return IrVersions.V49.http.SdkRequestBodyType.typeReference({
                ...shape,
                requestBodyType: convertTypeReference(shape.requestBodyType)
            });
    }
}

function convertRequestBody(requestBody: IrVersions.V50.http.HttpRequestBody): IrVersions.V49.http.HttpRequestBody {
    return IrVersions.V50.http.HttpRequestBody._visit<IrVersions.V49.http.HttpRequestBody>(requestBody, {
        inlinedRequestBody: (inlinedRequestBody) =>
            IrVersions.V49.http.HttpRequestBody.inlinedRequestBody({
                ...inlinedRequestBody,
                properties: inlinedRequestBody.properties.map((property) => ({
                    ...property,
                    valueType: convertTypeReference(property.valueType)
                }))
            }),
        reference: (reference) =>
            IrVersions.V49.http.HttpRequestBody.reference({
                ...reference,
                requestBodyType: convertTypeReference(reference.requestBodyType)
            }),
        fileUpload: (fileUpload) =>
            IrVersions.V49.http.HttpRequestBody.fileUpload({
                ...fileUpload,
                properties: fileUpload.properties.map((fileUploadRequestProperty) => {
                    switch (fileUploadRequestProperty.type) {
                        case "bodyProperty":
                            return IrVersions.V49.http.FileUploadRequestProperty.bodyProperty({
                                ...fileUploadRequestProperty,
                                valueType: convertTypeReference(fileUploadRequestProperty.valueType)
                            });
                        case "file":
                            return IrVersions.V49.http.FileUploadRequestProperty.file(
                                convertFileProperty(fileUploadRequestProperty.value)
                            );
                    }
                })
            }),
        bytes: (bytes) => {
            return IrVersions.V49.http.HttpRequestBody.bytes(bytes);
        },
        _other: () => {
            throw new Error("Unknown HttpRequestBody: " + requestBody.type);
        }
    });
}

function convertFileProperty(fileProperty: IrVersions.V50.http.FileProperty): IrVersions.V49.http.FileProperty {
    switch (fileProperty.type) {
        case "file":
            return IrVersions.V49.http.FileProperty.file(fileProperty);
        case "fileArray":
            return IrVersions.V49.http.FileProperty.fileArray(fileProperty);
    }
}

function convertErrorDeclaration(
    error: IrVersions.V50.errors.ErrorDeclaration
): IrVersions.V49.errors.ErrorDeclaration {
    return {
        ...error,
        type: error.type != null ? convertTypeReference(error.type) : undefined
    };
}
