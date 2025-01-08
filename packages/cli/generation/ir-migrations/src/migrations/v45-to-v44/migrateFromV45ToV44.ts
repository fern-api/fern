import { mapValues } from "lodash-es";

import { GeneratorName } from "@fern-api/configuration-loader";

import { IrSerialization } from "../../ir-serialization";
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
    laterVersion: "v45",
    earlierVersion: "v44",
    firstGeneratorVersionToConsumeNewIR: {
        [GeneratorName.TYPESCRIPT_NODE_SDK]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.TYPESCRIPT_BROWSER_SDK]: GeneratorWasNeverUpdatedToConsumeNewIR,
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
        [GeneratorName.PYTHON_SDK]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.GO_FIBER]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.GO_MODEL]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.GO_SDK]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.RUBY_MODEL]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.RUBY_SDK]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.CSHARP_MODEL]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.CSHARP_SDK]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.SWIFT_MODEL]: GeneratorWasNotCreatedYet,
        [GeneratorName.SWIFT_SDK]: GeneratorWasNotCreatedYet,
        [GeneratorName.PHP_MODEL]: GeneratorWasNotCreatedYet,
        [GeneratorName.PHP_SDK]: GeneratorWasNotCreatedYet
    },
    jsonifyEarlierVersion: (ir) =>
        IrSerialization.V44.IntermediateRepresentation.jsonOrThrow(ir, {
            unrecognizedObjectKeys: "strip",
            skipValidation: true
        }),
    migrateBackwards: (v45): IrVersions.V44.ir.IntermediateRepresentation => {
        const v44Types: Record<string, IrVersions.V44.types.TypeDeclaration> = mapValues(
            v45.types,
            (typeDeclaration) => {
                return {
                    ...typeDeclaration,
                    shape: IrVersions.V45.types.Type._visit<IrVersions.V44.types.Type>(typeDeclaration.shape, {
                        union: (union) => {
                            return IrVersions.V44.types.Type.union({
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
            webhookGroups: mapValues(v45.webhookGroups, (webhookGroup) => convertWebhookGroup(webhookGroup)),
            websocketChannels: mapValues(v45.websocketChannels, (websocketChannel) =>
                convertWebsocketChannel(websocketChannel)
            ),
            pathParameters: v45.pathParameters.map((pathParameter) => convertPathParameter(pathParameter)),
            variables: v45.variables.map((variable) => convertVariable(variable))
        };
    }
};

function convertWebsocketChannel(
    websocketChannel: IrVersions.V45.websocket.WebSocketChannel
): IrVersions.V44.websocket.WebSocketChannel {
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
    websocketMessage: IrVersions.V45.websocket.WebSocketMessage
): IrVersions.V44.websocket.WebSocketMessage {
    return {
        ...websocketMessage,
        body: convertWebsocketMessageBody(websocketMessage.body)
    };
}

function convertWebsocketMessageBody(
    body: IrVersions.V45.websocket.WebSocketMessageBody
): IrVersions.V44.websocket.WebSocketMessageBody {
    switch (body.type) {
        case "inlinedBody":
            return IrVersions.V44.websocket.WebSocketMessageBody.inlinedBody({
                ...body,
                properties: body.properties.map((property) => {
                    return {
                        ...property,
                        valueType: convertTypeReference(property.valueType)
                    };
                })
            });
        case "reference":
            return IrVersions.V44.websocket.WebSocketMessageBody.reference({
                ...body,
                bodyType: convertTypeReference(body.bodyType)
            });
    }
}

function convertWebhookGroup(webhookGroup: IrVersions.V45.webhooks.WebhookGroup): IrVersions.V44.webhooks.WebhookGroup {
    return webhookGroup.map((webhook) => convertWebhook(webhook));
}

function convertWebhook(webhook: IrVersions.V45.webhooks.Webhook): IrVersions.V44.webhooks.Webhook {
    return {
        ...webhook,
        headers: webhook.headers.map((header) => convertHttpHeader(header)),
        payload: convertWebhookPayload(webhook.payload)
    };
}

function convertWebhookPayload(
    payload: IrVersions.V45.webhooks.WebhookPayload
): IrVersions.V44.webhooks.WebhookPayload {
    switch (payload.type) {
        case "reference":
            return IrVersions.V44.webhooks.WebhookPayload.reference({
                ...payload,
                payloadType: convertTypeReference(payload.payloadType)
            });
        case "inlinedPayload":
            return IrVersions.V44.webhooks.WebhookPayload.inlinedPayload({
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

function convertAuth(auth: IrVersions.V45.auth.ApiAuth): IrVersions.V44.auth.ApiAuth {
    return {
        ...auth,
        schemes: auth.schemes.map((scheme) => {
            switch (scheme.type) {
                case "basic":
                    return IrVersions.V44.auth.AuthScheme.basic(scheme);
                case "bearer":
                    return IrVersions.V44.auth.AuthScheme.bearer(scheme);
                case "header":
                    return IrVersions.V44.auth.AuthScheme.header(convertHeader(scheme));
                case "oauth":
                    return IrVersions.V44.auth.AuthScheme.oauth(convertOAuth(scheme));
            }
        })
    };
}

function convertHeader(header: IrVersions.V45.auth.AuthScheme.Header): IrVersions.V44.auth.HeaderAuthScheme {
    return {
        ...header,
        valueType: convertTypeReference(header.valueType)
    };
}

function convertOAuth(oauth: IrVersions.V45.auth.AuthScheme.Oauth): IrVersions.V44.auth.OAuthScheme {
    return {
        ...oauth,
        configuration: IrVersions.V44.auth.OAuthConfiguration.clientCredentials({
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
    tokenEndpoint: IrVersions.V45.auth.OAuthTokenEndpoint
): IrVersions.V44.auth.OAuthTokenEndpoint {
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
    refreshEndpoint: IrVersions.V45.auth.OAuthRefreshEndpoint
): IrVersions.V44.auth.OAuthRefreshEndpoint | undefined {
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

function convertHttpHeader(header: IrVersions.V45.http.HttpHeader): IrVersions.V44.http.HttpHeader {
    return {
        ...header,
        valueType: convertTypeReference(header.valueType)
    };
}

function convertTypeReference(typeReference: IrVersions.V45.types.TypeReference): IrVersions.V44.types.TypeReference {
    return IrVersions.V45.types.TypeReference._visit<IrVersions.V44.types.TypeReference>(typeReference, {
        container: (container) => IrVersions.V44.types.TypeReference.container(convertContainerType(container)),
        primitive: (primitiveType) => {
            if (primitiveType.v1 === "BIG_INTEGER") {
                return IrVersions.V44.types.TypeReference.primitive(IrVersions.V44.types.PrimitiveType.String);
            }
            return IrVersions.V44.types.TypeReference.primitive(primitiveType.v1);
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
        ...singleUnionType,
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
                    ...singleProperty,
                    type: convertTypeReference(singleProperty.type)
                }),
            noProperties: IrVersions.V44.types.SingleUnionTypeProperties.noProperties,
            _other: () => {
                throw new Error(`Unknown SingleUnionTypeProperties: ${JSON.stringify(properties)}`);
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
            if (primitiveType.v1 === "BIG_INTEGER") {
                return IrVersions.V44.types.ResolvedTypeReference.primitive(IrVersions.V44.types.PrimitiveType.String);
            }
            return IrVersions.V44.types.ResolvedTypeReference.primitive(primitiveType.v1);
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
        ...service,
        pathParameters: service.pathParameters.map((pathParameter) => convertPathParameter(pathParameter)),
        headers: service.headers.map((header) => convertHttpHeader(header)),
        endpoints: service.endpoints.map((endpoint) => convertEndpoint(endpoint))
    };
}

function convertPathParameter(pathParameter: IrVersions.V45.http.PathParameter): IrVersions.V44.http.PathParameter {
    return {
        ...pathParameter,
        valueType: convertTypeReference(pathParameter.valueType)
    };
}

function convertVariable(variable: IrVersions.V45.VariableDeclaration): IrVersions.V44.VariableDeclaration {
    return {
        ...variable,
        type: convertTypeReference(variable.type)
    };
}

function convertEndpoint(endpoint: IrVersions.V45.http.HttpEndpoint): IrVersions.V44.http.HttpEndpoint {
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

function convertHttpResponse(response: IrVersions.V45.http.HttpResponse): IrVersions.V44.http.HttpResponse {
    return {
        ...response,
        body: response.body != null ? convertResponseBody(response.body) : undefined
    };
}

function convertResponseBody(responseBody: IrVersions.V45.http.HttpResponseBody): IrVersions.V44.http.HttpResponseBody {
    switch (responseBody.type) {
        case "json":
            return IrVersions.V44.http.HttpResponseBody.json(convertJsonResponse(responseBody.value));
        case "fileDownload":
            return IrVersions.V44.http.HttpResponseBody.fileDownload(responseBody);
        case "text":
            return IrVersions.V44.http.HttpResponseBody.text(responseBody);
        case "streaming":
            return IrVersions.V44.http.HttpResponseBody.streaming(convertStreamingResponse(responseBody.value));
    }
}

function convertJsonResponse(jsonResponse: IrVersions.V45.http.JsonResponse): IrVersions.V44.http.JsonResponse {
    switch (jsonResponse.type) {
        case "response":
            return IrVersions.V44.http.JsonResponse.response({
                ...jsonResponse,
                responseBodyType: convertTypeReference(jsonResponse.responseBodyType)
            });
        case "nestedPropertyAsResponse":
            return IrVersions.V44.http.JsonResponse.nestedPropertyAsResponse({
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
    streamingResponse: IrVersions.V45.http.StreamingResponse
): IrVersions.V44.http.StreamingResponse {
    switch (streamingResponse.type) {
        case "json":
            return IrVersions.V44.http.StreamingResponse.json({
                ...streamingResponse,
                payload: convertTypeReference(streamingResponse.payload)
            });
        case "text":
            return IrVersions.V44.http.StreamingResponse.text(streamingResponse);
        case "sse":
            return IrVersions.V44.http.StreamingResponse.sse({
                ...streamingResponse,
                payload: convertTypeReference(streamingResponse.payload)
            });
    }
}

function convertPagination(pagination: IrVersions.V45.http.Pagination): IrVersions.V44.http.Pagination {
    switch (pagination.type) {
        case "cursor":
            return IrVersions.V44.http.Pagination.cursor(convertCursorPagination(pagination));
        case "offset":
            return IrVersions.V44.http.Pagination.offset(convertOffsetPagination(pagination));
    }
}

function convertCursorPagination(
    cursorPagination: IrVersions.V45.http.CursorPagination
): IrVersions.V44.http.CursorPagination {
    return {
        ...cursorPagination,
        page: convertQueryParameter(cursorPagination.page),
        next: convertResponseProperty(cursorPagination.next),
        results: convertResponseProperty(cursorPagination.results)
    };
}

function convertOffsetPagination(
    offsetPagination: IrVersions.V45.http.OffsetPagination
): IrVersions.V44.http.OffsetPagination {
    return {
        ...offsetPagination,
        page: convertQueryParameter(offsetPagination.page),
        results: convertResponseProperty(offsetPagination.results)
    };
}

function convertRequestProperty(
    requestProperty: IrVersions.V45.http.RequestProperty
): IrVersions.V44.http.RequestProperty {
    return {
        ...requestProperty,
        property: convertRequestPropertValue(requestProperty.property)
    };
}

function convertRequestPropertValue(
    requestPropertyValue: IrVersions.V45.http.RequestPropertyValue
): IrVersions.V44.http.RequestPropertyValue {
    switch (requestPropertyValue.type) {
        case "query":
            return IrVersions.V44.RequestPropertyValue.query(convertQueryParameter(requestPropertyValue));
        case "body":
            return IrVersions.V44.RequestPropertyValue.body(convertObjectProperty(requestPropertyValue));
    }
}

function convertResponseProperty(
    responseProperty: IrVersions.V45.http.ResponseProperty
): IrVersions.V44.http.ResponseProperty {
    return {
        ...responseProperty,
        property: convertObjectProperty(responseProperty.property)
    };
}

function convertObjectProperty(
    objectProperty: IrVersions.V45.types.ObjectProperty
): IrVersions.V44.types.ObjectProperty {
    return {
        ...objectProperty,
        valueType: convertTypeReference(objectProperty.valueType)
    };
}

function convertQueryParameter(queryParameter: IrVersions.V45.http.QueryParameter): IrVersions.V44.http.QueryParameter {
    return {
        ...queryParameter,
        valueType: convertTypeReference(queryParameter.valueType)
    };
}

function convertSdkRequest(sdkRequest: IrVersions.V45.http.SdkRequest): IrVersions.V44.http.SdkRequest {
    return {
        ...sdkRequest,
        shape: convertSdkRequestShape(sdkRequest.shape)
    };
}

function convertSdkRequestShape(shape: IrVersions.V45.http.SdkRequestShape): IrVersions.V44.http.SdkRequestShape {
    return IrVersions.V45.http.SdkRequestShape._visit<IrVersions.V44.http.SdkRequestShape>(shape, {
        justRequestBody: (reference) =>
            IrVersions.V44.http.SdkRequestShape.justRequestBody(convertSdkRequestBodyType(reference)),
        wrapper: IrVersions.V44.http.SdkRequestShape.wrapper,
        _other: () => {
            throw new Error("Unknown SdkRequestShape: " + shape.type);
        }
    });
}

function convertSdkRequestBodyType(
    shape: IrVersions.V45.http.SdkRequestBodyType
): IrVersions.V44.http.SdkRequestBodyType {
    switch (shape.type) {
        case "bytes":
            return IrVersions.V44.http.SdkRequestBodyType.bytes(shape);
        case "typeReference":
            return IrVersions.V44.http.SdkRequestBodyType.typeReference({
                ...shape,
                requestBodyType: convertTypeReference(shape.requestBodyType)
            });
    }
}

function convertRequestBody(requestBody: IrVersions.V45.http.HttpRequestBody): IrVersions.V44.http.HttpRequestBody {
    return IrVersions.V45.http.HttpRequestBody._visit<IrVersions.V44.http.HttpRequestBody>(requestBody, {
        inlinedRequestBody: (inlinedRequestBody) =>
            IrVersions.V44.http.HttpRequestBody.inlinedRequestBody({
                ...inlinedRequestBody,
                properties: inlinedRequestBody.properties.map((property) => ({
                    ...property,
                    valueType: convertTypeReference(property.valueType)
                }))
            }),
        reference: (reference) =>
            IrVersions.V44.http.HttpRequestBody.reference({
                ...reference,
                requestBodyType: convertTypeReference(reference.requestBodyType)
            }),
        fileUpload: (fileUpload) =>
            IrVersions.V44.http.HttpRequestBody.fileUpload({
                ...fileUpload,
                properties: fileUpload.properties.map((fileUploadRequestProperty) => {
                    switch (fileUploadRequestProperty.type) {
                        case "bodyProperty":
                            return IrVersions.V44.http.FileUploadRequestProperty.bodyProperty({
                                ...fileUploadRequestProperty,
                                valueType: convertTypeReference(fileUploadRequestProperty.valueType)
                            });
                        case "file":
                            return IrVersions.V44.http.FileUploadRequestProperty.file(
                                convertFileProperty(fileUploadRequestProperty.value)
                            );
                    }
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

function convertFileProperty(fileProperty: IrVersions.V45.http.FileProperty): IrVersions.V44.http.FileProperty {
    switch (fileProperty.type) {
        case "file":
            return IrVersions.V44.http.FileProperty.file(fileProperty);
        case "fileArray":
            return IrVersions.V44.http.FileProperty.fileArray(fileProperty);
    }
}

function convertErrorDeclaration(
    error: IrVersions.V45.errors.ErrorDeclaration
): IrVersions.V44.errors.ErrorDeclaration {
    return {
        ...error,
        type: error.type != null ? convertTypeReference(error.type) : undefined
    };
}
