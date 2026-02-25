import { GeneratorName } from "@fern-api/configuration-loader";
import { mapValues } from "lodash-es";
import { IrMigrationContext } from "../../IrMigrationContext";
import { IrSerialization } from "../../ir-serialization";
import { IrVersions } from "../../ir-versions";
import { GeneratorWasNeverUpdatedToConsumeNewIR, IrMigration } from "../../types/IrMigration";

export const V65_TO_V63_MIGRATION: IrMigration<
    IrVersions.V65.ir.IntermediateRepresentation,
    IrVersions.V63.ir.IntermediateRepresentation
> = {
    laterVersion: "v65",
    earlierVersion: "v63",
    firstGeneratorVersionToConsumeNewIR: {
        [GeneratorName.TYPESCRIPT_NODE_SDK]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.TYPESCRIPT_BROWSER_SDK]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.TYPESCRIPT]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.TYPESCRIPT_SDK]: "3.50.0",
        [GeneratorName.TYPESCRIPT_EXPRESS]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.JAVA]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.JAVA_MODEL]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.JAVA_SDK]: "3.36.0",
        [GeneratorName.JAVA_SPRING]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.OPENAPI_PYTHON_CLIENT]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.OPENAPI]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.PYTHON_FASTAPI]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.PYTHON_PYDANTIC]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.PYTHON_SDK]: "4.56.0",
        [GeneratorName.STOPLIGHT]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.POSTMAN]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.GO_MODEL]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.GO_SDK]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.RUBY_SDK]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.CSHARP_MODEL]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.CSHARP_SDK]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.SWIFT_MODEL]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.SWIFT_SDK]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.PHP_MODEL]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.PHP_SDK]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.RUST_MODEL]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.RUST_SDK]: GeneratorWasNeverUpdatedToConsumeNewIR
    },
    jsonifyEarlierVersion: (ir) =>
        IrSerialization.V63.IntermediateRepresentation.jsonOrThrow(ir, {
            unrecognizedObjectKeys: "passthrough",
            skipValidation: true
        }),
    migrateBackwards: (
        v65: IrVersions.V65.IntermediateRepresentation,
        context: IrMigrationContext
    ): IrVersions.V63.ir.IntermediateRepresentation => {
        return {
            ...v65,
            // V65 adds DATE_TIME_RFC_2822 to PrimitiveType, which makes TypeReference incompatible
            // with V63. We convert all fields that contain TypeReference to map DATE_TIME_RFC_2822
            // back to DATE_TIME. The serializer uses skipValidation: true so deeply nested
            // TypeReferences (in examples, OAuth, etc.) are handled at serialization time.
            types: mapValues(v65.types, (typeDeclaration) => convertTypeDeclaration(typeDeclaration)),
            headers: v65.headers.map((header) => convertHttpHeader(header)),
            idempotencyHeaders: v65.idempotencyHeaders.map((header) => convertHttpHeader(header)),
            pathParameters: v65.pathParameters.map((p) => convertPathParameter(p)),
            variables: v65.variables.map((v) => ({
                ...v,
                type: convertTypeReference(v.type)
            })),
            auth: convertApiAuth(v65.auth),
            // apiVersion contains nested TypeReferences; skipValidation handles serialization
            apiVersion: v65.apiVersion as unknown as IrVersions.V63.ir.ApiVersionScheme | undefined,
            // dynamic IR contains its own TypeReference hierarchy; skipValidation handles serialization
            dynamic: v65.dynamic as unknown as IrVersions.V63.dynamic.DynamicIntermediateRepresentation | undefined,
            errors: mapValues(v65.errors, (error) => convertErrorDeclaration(error)),
            services: mapValues(v65.services, (service) => convertHttpService(service, context)),
            webhookGroups: mapValues(v65.webhookGroups, (webhookGroup) =>
                webhookGroup.map((webhook) => {
                    const { signatureVerification: _, ...rest } = webhook;
                    return convertWebhook(rest);
                })
            ),
            websocketChannels:
                v65.websocketChannels != null
                    ? mapValues(v65.websocketChannels, (channel) => convertWebsocketChannel(channel))
                    : undefined
        };
    }
};

// ==================== Primitive Type Conversion ====================
// V65 adds DATE_TIME_RFC_2822 to PrimitiveTypeV1 and PrimitiveTypeV2.
// V63 does not have this variant, so we map it back to DATE_TIME.

function convertPrimitiveType(primitive: IrVersions.V65.PrimitiveType): IrVersions.V63.types.PrimitiveType {
    return {
        v1: convertPrimitiveTypeV1(primitive.v1),
        v2: primitive.v2 != null ? convertPrimitiveTypeV2(primitive.v2) : undefined
    };
}

function convertPrimitiveTypeV1(v1: IrVersions.V65.PrimitiveTypeV1): IrVersions.V63.types.PrimitiveTypeV1 {
    switch (v1) {
        case "DATE_TIME_RFC_2822":
            return IrVersions.V63.types.PrimitiveTypeV1.DateTime;
        default:
            return v1 as IrVersions.V63.types.PrimitiveTypeV1;
    }
}

function convertPrimitiveTypeV2(v2: IrVersions.V65.PrimitiveTypeV2): IrVersions.V63.types.PrimitiveTypeV2 {
    switch (v2.type) {
        case "dateTimeRfc2822":
            return IrVersions.V63.types.PrimitiveTypeV2.dateTime({});
        default:
            // All other PrimitiveTypeV2 variants exist in V63 with the same structure
            return v2 as unknown as IrVersions.V63.types.PrimitiveTypeV2;
    }
}

// ==================== Type Reference Conversion ====================

function convertTypeReference(typeRef: IrVersions.V65.TypeReference): IrVersions.V63.types.TypeReference {
    switch (typeRef.type) {
        case "primitive":
            return IrVersions.V63.types.TypeReference.primitive(convertPrimitiveType(typeRef.primitive));
        case "container":
            return IrVersions.V63.types.TypeReference.container(convertContainerType(typeRef.container));
        case "named":
            return IrVersions.V63.types.TypeReference.named(typeRef);
        case "unknown":
            return IrVersions.V63.types.TypeReference.unknown();
    }
}

function convertContainerType(container: IrVersions.V65.ContainerType): IrVersions.V63.types.ContainerType {
    switch (container.type) {
        case "list":
            return IrVersions.V63.types.ContainerType.list(convertTypeReference(container.list));
        case "set":
            return IrVersions.V63.types.ContainerType.set(convertTypeReference(container.set));
        case "map":
            return IrVersions.V63.types.ContainerType.map({
                keyType: convertTypeReference(container.keyType),
                valueType: convertTypeReference(container.valueType)
            });
        case "optional":
            return IrVersions.V63.types.ContainerType.optional(convertTypeReference(container.optional));
        case "nullable":
            return IrVersions.V63.types.ContainerType.nullable(convertTypeReference(container.nullable));
        case "literal":
            return IrVersions.V63.types.ContainerType.literal(container.literal);
    }
}

function convertResolvedTypeReference(
    resolved: IrVersions.V65.ResolvedTypeReference
): IrVersions.V63.types.ResolvedTypeReference {
    switch (resolved.type) {
        case "container":
            return IrVersions.V63.types.ResolvedTypeReference.container(convertContainerType(resolved.container));
        case "named":
            return IrVersions.V63.types.ResolvedTypeReference.named(resolved);
        case "primitive":
            return IrVersions.V63.types.ResolvedTypeReference.primitive(convertPrimitiveType(resolved.primitive));
        case "unknown":
            return IrVersions.V63.types.ResolvedTypeReference.unknown();
    }
}

// ==================== Auth ====================

function convertApiAuth(auth: IrVersions.V65.ApiAuth): IrVersions.V63.ApiAuth {
    return {
        ...auth,
        schemes: auth.schemes.map((scheme) => convertAuthScheme(scheme))
    };
}

function convertAuthScheme(scheme: IrVersions.V65.AuthScheme): IrVersions.V63.AuthScheme {
    switch (scheme.type) {
        case "bearer":
            return IrVersions.V63.AuthScheme.bearer(scheme);
        case "basic":
            return IrVersions.V63.AuthScheme.basic(scheme);
        case "header":
            return IrVersions.V63.AuthScheme.header({
                ...scheme,
                valueType: convertTypeReference(scheme.valueType)
            });
        case "oauth":
            // OAuth contains deeply nested TypeReferences; skipValidation handles serialization
            return IrVersions.V63.AuthScheme.oauth(scheme as unknown as IrVersions.V63.auth.OAuthScheme);
        case "inferred":
            return IrVersions.V63.AuthScheme.inferred(scheme as unknown as IrVersions.V63.auth.InferredAuthScheme);
        default:
            return scheme as unknown as IrVersions.V63.AuthScheme;
    }
}

// ==================== Types ====================

function convertTypeDeclaration(typeDeclaration: IrVersions.V65.TypeDeclaration): IrVersions.V63.types.TypeDeclaration {
    return {
        ...typeDeclaration,
        shape: convertType(typeDeclaration.shape),
        // Examples contain deeply nested ExamplePrimitive types with datetimeRfc2822 not in V63.
        // skipValidation: true in the serializer handles the mismatch.
        autogeneratedExamples: typeDeclaration.autogeneratedExamples as unknown as IrVersions.V63.types.ExampleType[],
        userProvidedExamples: typeDeclaration.userProvidedExamples as unknown as IrVersions.V63.types.ExampleType[]
    };
}

function convertType(type: IrVersions.V65.Type): IrVersions.V63.types.Type {
    switch (type.type) {
        case "alias":
            return IrVersions.V63.types.Type.alias({
                aliasOf: convertTypeReference(type.aliasOf),
                resolvedType: convertResolvedTypeReference(type.resolvedType)
            });
        case "enum":
            return IrVersions.V63.types.Type.enum(type);
        case "object":
            return IrVersions.V63.types.Type.object({
                ...type,
                properties: type.properties.map((prop) => ({
                    ...prop,
                    valueType: convertTypeReference(prop.valueType)
                })),
                extendedProperties: type.extendedProperties?.map((prop) => ({
                    ...prop,
                    valueType: convertTypeReference(prop.valueType)
                }))
            });
        case "union":
            return IrVersions.V63.types.Type.union({
                ...type,
                baseProperties: type.baseProperties.map((prop) => ({
                    ...prop,
                    valueType: convertTypeReference(prop.valueType)
                })),
                types: type.types.map((t) => ({
                    ...t,
                    shape: convertSingleUnionTypeProperties(t.shape)
                }))
            });
        case "undiscriminatedUnion":
            return IrVersions.V63.types.Type.undiscriminatedUnion({
                members: type.members.map((member) => ({
                    ...member,
                    type: convertTypeReference(member.type)
                }))
            });
    }
}

function convertSingleUnionTypeProperties(
    properties: IrVersions.V65.SingleUnionTypeProperties
): IrVersions.V63.types.SingleUnionTypeProperties {
    switch (properties.propertiesType) {
        case "samePropertiesAsObject":
            return IrVersions.V63.types.SingleUnionTypeProperties.samePropertiesAsObject(properties);
        case "singleProperty":
            return IrVersions.V63.types.SingleUnionTypeProperties.singleProperty({
                ...properties,
                type: convertTypeReference(properties.type)
            });
        case "noProperties":
            return IrVersions.V63.types.SingleUnionTypeProperties.noProperties();
    }
}

// ==================== HTTP ====================

function convertHttpHeader(header: IrVersions.V65.HttpHeader): IrVersions.V63.http.HttpHeader {
    return {
        ...header,
        valueType: convertTypeReference(header.valueType)
    };
}

function convertPathParameter(param: IrVersions.V65.PathParameter): IrVersions.V63.http.PathParameter {
    return {
        ...param,
        valueType: convertTypeReference(param.valueType)
    };
}

function convertQueryParameter(param: IrVersions.V65.QueryParameter): IrVersions.V63.http.QueryParameter {
    return {
        ...param,
        valueType: convertTypeReference(param.valueType)
    };
}

function convertHttpService(
    service: IrVersions.V65.HttpService,
    context: IrMigrationContext
): IrVersions.V63.http.HttpService {
    return {
        ...service,
        headers: service.headers.map((h) => convertHttpHeader(h)),
        pathParameters: service.pathParameters.map((p) => convertPathParameter(p)),
        endpoints: service.endpoints.map((endpoint) => convertHttpEndpoint(endpoint, context))
    };
}

function convertHttpEndpoint(
    endpoint: IrVersions.V65.HttpEndpoint,
    context: IrMigrationContext
): IrVersions.V63.http.HttpEndpoint {
    return {
        ...endpoint,
        allPathParameters: endpoint.allPathParameters.map((p) => convertPathParameter(p)),
        pathParameters: endpoint.pathParameters.map((p) => convertPathParameter(p)),
        headers: endpoint.headers.map((h) => convertHttpHeader(h)),
        queryParameters: endpoint.queryParameters.map((q) => convertQueryParameter(q)),
        responseHeaders: endpoint.responseHeaders?.map((h) => convertHttpHeader(h)),
        requestBody: endpoint.requestBody != null ? convertRequestBody(endpoint.requestBody) : undefined,
        sdkRequest: endpoint.sdkRequest != null ? convertSdkRequest(endpoint.sdkRequest) : undefined,
        response: endpoint.response != null ? convertHttpResponse(endpoint.response) : undefined,
        v2RequestBodies:
            endpoint.v2RequestBodies != null
                ? {
                      ...endpoint.v2RequestBodies,
                      requestBodies: endpoint.v2RequestBodies.requestBodies?.map((rb) => convertRequestBody(rb))
                  }
                : undefined,
        v2Responses:
            endpoint.v2Responses != null
                ? {
                      ...endpoint.v2Responses,
                      responses: endpoint.v2Responses.responses?.map((r) => convertHttpResponse(r))
                  }
                : undefined,
        pagination: endpoint.pagination != null ? convertPagination(endpoint.pagination, context) : undefined,
        // Examples contain deeply nested ExamplePrimitive types; skipValidation handles serialization
        autogeneratedExamples:
            endpoint.autogeneratedExamples as unknown as IrVersions.V63.http.AutogeneratedEndpointExample[],
        userSpecifiedExamples:
            endpoint.userSpecifiedExamples as unknown as IrVersions.V63.http.UserSpecifiedEndpointExample[]
    };
}

function convertRequestBody(requestBody: IrVersions.V65.HttpRequestBody): IrVersions.V63.http.HttpRequestBody {
    switch (requestBody.type) {
        case "inlinedRequestBody":
            return IrVersions.V63.http.HttpRequestBody.inlinedRequestBody({
                ...requestBody,
                properties: requestBody.properties.map((prop) => ({
                    ...prop,
                    valueType: convertTypeReference(prop.valueType)
                })),
                extendedProperties: requestBody.extendedProperties?.map((prop) => ({
                    ...prop,
                    valueType: convertTypeReference(prop.valueType)
                }))
            });
        case "reference":
            return IrVersions.V63.http.HttpRequestBody.reference({
                ...requestBody,
                requestBodyType: convertTypeReference(requestBody.requestBodyType)
            });
        case "fileUpload":
            return IrVersions.V63.http.HttpRequestBody.fileUpload({
                ...requestBody,
                properties: requestBody.properties.map((prop) => {
                    if (prop.type === "file") {
                        return IrVersions.V63.http.FileUploadRequestProperty.file(prop.value);
                    }
                    return IrVersions.V63.http.FileUploadRequestProperty.bodyProperty({
                        ...prop,
                        valueType: convertTypeReference(prop.valueType)
                    });
                })
            });
        case "bytes":
            return IrVersions.V63.http.HttpRequestBody.bytes(requestBody);
    }
}

function convertSdkRequest(sdkRequest: IrVersions.V65.SdkRequest): IrVersions.V63.http.SdkRequest {
    return {
        ...sdkRequest,
        shape: convertSdkRequestShape(sdkRequest.shape),
        streamParameter:
            sdkRequest.streamParameter != null ? convertRequestProperty(sdkRequest.streamParameter) : undefined
    };
}

function convertSdkRequestShape(shape: IrVersions.V65.SdkRequestShape): IrVersions.V63.http.SdkRequestShape {
    switch (shape.type) {
        case "justRequestBody":
            return IrVersions.V63.http.SdkRequestShape.justRequestBody(convertSdkRequestBodyType(shape.value));
        case "wrapper":
            return IrVersions.V63.http.SdkRequestShape.wrapper(shape);
    }
}

function convertSdkRequestBodyType(
    bodyType: IrVersions.V65.SdkRequestBodyType
): IrVersions.V63.http.SdkRequestBodyType {
    switch (bodyType.type) {
        case "typeReference":
            return IrVersions.V63.http.SdkRequestBodyType.typeReference({
                ...bodyType,
                requestBodyType: convertTypeReference(bodyType.requestBodyType)
            });
        case "bytes":
            return IrVersions.V63.http.SdkRequestBodyType.bytes(bodyType);
    }
}

function convertHttpResponse(response: IrVersions.V65.HttpResponse): IrVersions.V63.http.HttpResponse {
    return {
        ...response,
        body: response.body != null ? convertHttpResponseBody(response.body) : undefined
    };
}

function convertHttpResponseBody(body: IrVersions.V65.HttpResponseBody): IrVersions.V63.http.HttpResponseBody {
    switch (body.type) {
        case "json":
            return IrVersions.V63.http.HttpResponseBody.json(convertJsonResponse(body.value));
        case "fileDownload":
            return IrVersions.V63.http.HttpResponseBody.fileDownload(body);
        case "text":
            return IrVersions.V63.http.HttpResponseBody.text(body);
        case "streaming":
            return IrVersions.V63.http.HttpResponseBody.streaming(convertStreamingResponse(body.value));
        case "streamParameter":
            return IrVersions.V63.http.HttpResponseBody.streamParameter({
                ...body,
                nonStreamResponse: convertNonStreamHttpResponseBody(body.nonStreamResponse),
                streamResponse: convertStreamingResponse(body.streamResponse)
            });
        default:
            return body as unknown as IrVersions.V63.http.HttpResponseBody;
    }
}

function convertJsonResponse(jsonResponse: IrVersions.V65.JsonResponse): IrVersions.V63.http.JsonResponse {
    switch (jsonResponse.type) {
        case "response":
            return IrVersions.V63.http.JsonResponse.response({
                ...jsonResponse,
                responseBodyType: convertTypeReference(jsonResponse.responseBodyType)
            });
        case "nestedPropertyAsResponse":
            return IrVersions.V63.http.JsonResponse.nestedPropertyAsResponse({
                ...jsonResponse,
                responseBodyType: convertTypeReference(jsonResponse.responseBodyType),
                responseProperty:
                    jsonResponse.responseProperty != null
                        ? {
                              ...jsonResponse.responseProperty,
                              valueType: convertTypeReference(jsonResponse.responseProperty.valueType)
                          }
                        : undefined
            });
        default:
            return jsonResponse as unknown as IrVersions.V63.http.JsonResponse;
    }
}

function convertStreamingResponse(
    streamingResponse: IrVersions.V65.StreamingResponse
): IrVersions.V63.http.StreamingResponse {
    switch (streamingResponse.type) {
        case "json":
            return IrVersions.V63.http.StreamingResponse.json({
                ...streamingResponse,
                payload: convertTypeReference(streamingResponse.payload)
            });
        case "text":
            return IrVersions.V63.http.StreamingResponse.text(streamingResponse);
        case "sse":
            return IrVersions.V63.http.StreamingResponse.sse({
                ...streamingResponse,
                payload: convertTypeReference(streamingResponse.payload)
            });
        default:
            return streamingResponse as unknown as IrVersions.V63.http.StreamingResponse;
    }
}

function convertNonStreamHttpResponseBody(
    body: IrVersions.V65.NonStreamHttpResponseBody
): IrVersions.V63.http.NonStreamHttpResponseBody {
    switch (body.type) {
        case "json":
            return IrVersions.V63.http.NonStreamHttpResponseBody.json(convertJsonResponse(body.value));
        case "fileDownload":
            return IrVersions.V63.http.NonStreamHttpResponseBody.fileDownload(body);
        case "text":
            return IrVersions.V63.http.NonStreamHttpResponseBody.text(body);
        default:
            return body as unknown as IrVersions.V63.http.NonStreamHttpResponseBody;
    }
}

function convertPagination(
    pagination: IrVersions.V65.Pagination,
    context: IrMigrationContext
): IrVersions.V63.http.Pagination | undefined {
    switch (pagination.type) {
        case "cursor":
            return IrVersions.V63.http.Pagination.cursor({
                ...pagination,
                page: convertRequestProperty(pagination.page),
                next: convertResponseProperty(pagination.next),
                results: convertResponseProperty(pagination.results)
            });
        case "offset":
            return IrVersions.V63.http.Pagination.offset({
                ...pagination,
                page: convertRequestProperty(pagination.page),
                results: convertResponseProperty(pagination.results),
                step: pagination.step != null ? convertRequestProperty(pagination.step) : undefined,
                hasNextPage:
                    pagination.hasNextPage != null ? convertResponseProperty(pagination.hasNextPage) : undefined
            });
        case "custom":
            return IrVersions.V63.http.Pagination.custom({
                ...pagination,
                results: convertResponseProperty(pagination.results)
            });
        case "uri":
        case "path":
            context.taskContext.logger.warn(
                `Pagination with '${pagination.type}' cannot be migrated to IR v63. Removing pagination config.`
            );
            return undefined;
    }
}

function convertRequestProperty(prop: IrVersions.V65.RequestProperty): IrVersions.V63.http.RequestProperty {
    return {
        ...prop,
        propertyPath: prop.propertyPath?.map((item) => ({
            ...item,
            type: convertTypeReference(item.type)
        })),
        property: convertRequestPropertyValue(prop.property)
    };
}

function convertRequestPropertyValue(
    value: IrVersions.V65.RequestPropertyValue
): IrVersions.V63.http.RequestPropertyValue {
    switch (value.type) {
        case "query":
            return IrVersions.V63.http.RequestPropertyValue.query(convertQueryParameter(value));
        case "body":
            return IrVersions.V63.http.RequestPropertyValue.body({
                ...value,
                valueType: convertTypeReference(value.valueType)
            });
    }
}

function convertResponseProperty(prop: IrVersions.V65.ResponseProperty): IrVersions.V63.http.ResponseProperty {
    return {
        ...prop,
        propertyPath: prop.propertyPath?.map((item) => ({
            ...item,
            type: convertTypeReference(item.type)
        })),
        property: {
            ...prop.property,
            valueType: convertTypeReference(prop.property.valueType)
        }
    };
}

// ==================== Errors ====================

function convertErrorDeclaration(error: IrVersions.V65.ErrorDeclaration): IrVersions.V63.errors.ErrorDeclaration {
    return {
        ...error,
        type: error.type != null ? convertTypeReference(error.type) : undefined,
        headers: error.headers?.map((h) => convertHttpHeader(h)),
        // Examples contain deeply nested ExamplePrimitive types; skipValidation handles serialization
        examples: error.examples as unknown as IrVersions.V63.errors.ExampleError[]
    };
}

// ==================== Webhooks ====================

function convertWebhook(
    webhook: Omit<IrVersions.V65.Webhook, "signatureVerification">
): IrVersions.V63.webhooks.Webhook {
    return {
        ...webhook,
        headers: webhook.headers.map((h) => convertHttpHeader(h)),
        payload: convertWebhookPayload(webhook.payload),
        responses: webhook.responses?.map((r) => convertHttpResponse(r)),
        fileUploadPayload:
            webhook.fileUploadPayload != null ? convertFileUploadRequest(webhook.fileUploadPayload) : undefined,
        // Examples contain deeply nested ExamplePrimitive types; skipValidation handles serialization
        examples: webhook.examples as unknown as IrVersions.V63.webhooks.ExampleWebhookCall[] | undefined
    };
}

function convertWebhookPayload(payload: IrVersions.V65.WebhookPayload): IrVersions.V63.webhooks.WebhookPayload {
    switch (payload.type) {
        case "inlinedPayload":
            return IrVersions.V63.webhooks.WebhookPayload.inlinedPayload({
                ...payload,
                properties: payload.properties.map((prop) => ({
                    ...prop,
                    valueType: convertTypeReference(prop.valueType)
                }))
            });
        case "reference":
            return IrVersions.V63.webhooks.WebhookPayload.reference({
                ...payload,
                payloadType: convertTypeReference(payload.payloadType)
            });
    }
}

function convertFileUploadRequest(fileUpload: IrVersions.V65.FileUploadRequest): IrVersions.V63.http.FileUploadRequest {
    return {
        ...fileUpload,
        properties: fileUpload.properties.map((prop) => {
            if (prop.type === "file") {
                return IrVersions.V63.http.FileUploadRequestProperty.file(prop.value);
            }
            return IrVersions.V63.http.FileUploadRequestProperty.bodyProperty({
                ...prop,
                valueType: convertTypeReference(prop.valueType)
            });
        })
    };
}

// ==================== Websocket ====================

function convertWebsocketChannel(channel: IrVersions.V65.WebSocketChannel): IrVersions.V63.websocket.WebSocketChannel {
    return {
        ...channel,
        headers: channel.headers.map((h) => convertHttpHeader(h)),
        queryParameters: channel.queryParameters.map((q) => convertQueryParameter(q)),
        pathParameters: channel.pathParameters.map((p) => convertPathParameter(p)),
        messages: channel.messages.map((m) => convertWebsocketMessage(m)),
        // Examples contain deeply nested ExamplePrimitive types; skipValidation handles serialization
        examples: channel.examples as unknown as IrVersions.V63.websocket.ExampleWebSocketSession[]
    };
}

function convertWebsocketMessage(message: IrVersions.V65.WebSocketMessage): IrVersions.V63.websocket.WebSocketMessage {
    return {
        ...message,
        body: convertWebsocketMessageBody(message.body)
    };
}

function convertWebsocketMessageBody(
    body: IrVersions.V65.WebSocketMessageBody
): IrVersions.V63.websocket.WebSocketMessageBody {
    switch (body.type) {
        case "inlinedBody":
            return IrVersions.V63.websocket.WebSocketMessageBody.inlinedBody({
                ...body,
                properties: body.properties.map((prop) => ({
                    ...prop,
                    valueType: convertTypeReference(prop.valueType)
                }))
            });
        case "reference":
            return IrVersions.V63.websocket.WebSocketMessageBody.reference({
                ...body,
                bodyType: convertTypeReference(body.bodyType)
            });
    }
}
