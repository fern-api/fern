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
        [GeneratorName.TYPESCRIPT_SDK]: GeneratorWasNeverUpdatedToConsumeNewIR,
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
            types: mapValues(v65.types, (type) => convertTypeDeclaration(type)),
            services: mapValues(v65.services, (service) => convertHttpService(service, context)),
            webhookGroups: mapValues(v65.webhookGroups, (group) => convertWebhookGroup(group)),
            websocketChannels:
                v65.websocketChannels != null
                    ? mapValues(v65.websocketChannels, (channel) => convertWebsocketChannel(channel))
                    : undefined
        } as unknown as IrVersions.V63.ir.IntermediateRepresentation;
    }
};

function convertAvailability(
    availability: IrVersions.V65.Availability | undefined
): IrVersions.V63.Availability | undefined {
    if (availability == null) {
        return undefined;
    }
    return {
        status: convertAvailabilityStatus(availability.status),
        message: availability.message
    };
}

function convertAvailabilityStatus(status: IrVersions.V65.AvailabilityStatus): IrVersions.V63.AvailabilityStatus {
    switch (status) {
        case "ALPHA":
        case "IN_DEVELOPMENT":
            return IrVersions.V63.AvailabilityStatus.InDevelopment;
        case "BETA":
        case "PREVIEW":
        case "PRE_RELEASE":
            return IrVersions.V63.AvailabilityStatus.PreRelease;
        case "STABLE":
        case "GENERAL_AVAILABILITY":
            return IrVersions.V63.AvailabilityStatus.GeneralAvailability;
        case "LEGACY":
        case "DEPRECATED":
            return IrVersions.V63.AvailabilityStatus.Deprecated;
        default:
            return IrVersions.V63.AvailabilityStatus.GeneralAvailability;
    }
}

function convertTypeDeclaration(typeDeclaration: IrVersions.V65.TypeDeclaration): IrVersions.V63.types.TypeDeclaration {
    return {
        ...typeDeclaration,
        availability: convertAvailability(typeDeclaration.availability),
        shape: convertType(typeDeclaration.shape)
    } as unknown as IrVersions.V63.types.TypeDeclaration;
}

function convertType(type: IrVersions.V65.Type): IrVersions.V63.types.Type {
    switch (type.type) {
        case "alias":
            return type as unknown as IrVersions.V63.types.Type;
        case "enum":
            return IrVersions.V63.types.Type.enum({
                ...type,
                default:
                    type.default != null
                        ? { ...type.default, availability: convertAvailability(type.default.availability) }
                        : undefined,
                values: type.values.map((v) => ({
                    ...v,
                    availability: convertAvailability(v.availability)
                }))
            });
        case "object": {
            const objectArg = {
                ...type,
                properties: type.properties.map((prop) => ({
                    ...prop,
                    availability: convertAvailability(prop.availability)
                })),
                extendedProperties: type.extendedProperties?.map((prop) => ({
                    ...prop,
                    availability: convertAvailability(prop.availability)
                }))
            };
            return IrVersions.V63.types.Type.object(
                objectArg as unknown as Parameters<typeof IrVersions.V63.types.Type.object>[0]
            );
        }
        case "union": {
            const unionArg = {
                ...type,
                baseProperties: type.baseProperties.map((prop) => ({
                    ...prop,
                    availability: convertAvailability(prop.availability)
                })),
                types: type.types.map((singleUnionType) => ({
                    ...singleUnionType,
                    availability: convertAvailability(singleUnionType.availability)
                }))
            };
            return IrVersions.V63.types.Type.union(
                unionArg as unknown as Parameters<typeof IrVersions.V63.types.Type.union>[0]
            );
        }
        case "undiscriminatedUnion":
            return type as unknown as IrVersions.V63.types.Type;
        default:
            return type as unknown as IrVersions.V63.types.Type;
    }
}

// V65 adds DATE_TIME_RFC_2822 to PrimitiveTypeV1 and PrimitiveTypeV2.
// V63 does not have this variant. The serializer uses skipValidation: true
// and unrecognizedObjectKeys: "passthrough", so the new primitive value is
// handled at serialization time for all nested TypeReferences throughout the IR.

function convertHttpService(
    service: IrVersions.V65.HttpService,
    context: IrMigrationContext
): IrVersions.V63.http.HttpService {
    return {
        ...service,
        availability: convertAvailability(service.availability),
        headers: service.headers?.map((h) => convertHttpHeader(h)),
        endpoints: service.endpoints?.map((endpoint) => convertHttpEndpoint(endpoint, context))
    } as unknown as IrVersions.V63.http.HttpService;
}

function convertHttpEndpoint(
    endpoint: IrVersions.V65.HttpEndpoint,
    context: IrMigrationContext
): IrVersions.V63.http.HttpEndpoint {
    return {
        ...endpoint,
        availability: convertAvailability(endpoint.availability),
        headers: endpoint.headers?.map((h) => convertHttpHeader(h)),
        queryParameters: endpoint.queryParameters?.map((q) => convertQueryParameter(q)),
        requestBody: endpoint.requestBody != null ? convertRequestBody(endpoint.requestBody) : undefined,
        response: endpoint.response != null ? convertHttpResponse(endpoint.response) : undefined,
        pagination: endpoint.pagination != null ? convertPagination(endpoint.pagination, context) : undefined,
        autogeneratedExamples:
            endpoint.autogeneratedExamples as unknown as IrVersions.V63.http.AutogeneratedEndpointExample[],
        userSpecifiedExamples:
            endpoint.userSpecifiedExamples as unknown as IrVersions.V63.http.UserSpecifiedEndpointExample[]
    } as unknown as IrVersions.V63.http.HttpEndpoint;
}

function convertHttpHeader(header: IrVersions.V65.HttpHeader): IrVersions.V63.http.HttpHeader {
    return {
        ...header,
        availability: convertAvailability(header.availability)
    } as unknown as IrVersions.V63.http.HttpHeader;
}

function convertQueryParameter(queryParameter: IrVersions.V65.QueryParameter): IrVersions.V63.http.QueryParameter {
    return {
        ...queryParameter,
        availability: convertAvailability(queryParameter.availability)
    } as unknown as IrVersions.V63.http.QueryParameter;
}

function convertRequestBody(requestBody: IrVersions.V65.HttpRequestBody): IrVersions.V63.http.HttpRequestBody {
    switch (requestBody.type) {
        case "inlinedRequestBody":
            return IrVersions.V63.http.HttpRequestBody.inlinedRequestBody({
                ...requestBody,
                properties: requestBody.properties.map((prop) => ({
                    ...prop,
                    availability: convertAvailability(prop.availability)
                })),
                extendedProperties: requestBody.extendedProperties?.map((prop) => ({
                    ...prop,
                    availability: convertAvailability(prop.availability)
                }))
            } as unknown as IrVersions.V63.http.InlinedRequestBody);
        case "fileUpload":
            return IrVersions.V63.http.HttpRequestBody.fileUpload({
                ...requestBody,
                properties: requestBody.properties.map((prop) => convertFileUploadRequestProperty(prop))
            } as unknown as IrVersions.V63.http.FileUploadRequest);
        default:
            return requestBody as unknown as IrVersions.V63.http.HttpRequestBody;
    }
}

function convertFileUploadRequestProperty(
    prop: IrVersions.V65.FileUploadRequestProperty
): IrVersions.V63.http.FileUploadRequestProperty {
    switch (prop.type) {
        case "bodyProperty":
            return IrVersions.V63.http.FileUploadRequestProperty.bodyProperty({
                ...prop,
                availability: convertAvailability(prop.availability)
            } as unknown as IrVersions.V63.http.FileUploadBodyProperty);
        default:
            return prop as unknown as IrVersions.V63.http.FileUploadRequestProperty;
    }
}

function convertHttpResponse(response: IrVersions.V65.HttpResponse): IrVersions.V63.http.HttpResponse {
    return {
        ...response,
        body: response.body != null ? convertHttpResponseBody(response.body) : undefined
    } as unknown as IrVersions.V63.http.HttpResponse;
}

function convertHttpResponseBody(body: IrVersions.V65.HttpResponseBody): IrVersions.V63.http.HttpResponseBody {
    switch (body.type) {
        case "json":
            return IrVersions.V63.http.HttpResponseBody.json(convertJsonResponse(body.value));
        default:
            return body as unknown as IrVersions.V63.http.HttpResponseBody;
    }
}

function convertJsonResponse(json: IrVersions.V65.JsonResponse): IrVersions.V63.http.JsonResponse {
    switch (json.type) {
        case "nestedPropertyAsResponse":
            return IrVersions.V63.http.JsonResponse.nestedPropertyAsResponse({
                ...json,
                responseProperty:
                    json.responseProperty != null
                        ? {
                              ...json.responseProperty,
                              availability: convertAvailability(json.responseProperty.availability)
                          }
                        : undefined
            } as unknown as IrVersions.V63.http.JsonResponseBodyWithProperty);
        default:
            return json as unknown as IrVersions.V63.http.JsonResponse;
    }
}

function convertWebhookGroup(webhookGroup: IrVersions.V65.WebhookGroup): IrVersions.V63.webhooks.WebhookGroup {
    return webhookGroup.map((webhook) => convertWebhook(webhook));
}

function convertWebhook(webhook: IrVersions.V65.Webhook): IrVersions.V63.webhooks.Webhook {
    const { signatureVerification: _, ...rest } = webhook;
    return {
        ...rest,
        availability: convertAvailability(webhook.availability),
        headers: webhook.headers?.map((h) => convertHttpHeader(h)),
        payload: convertWebhookPayload(webhook.payload)
    } as unknown as IrVersions.V63.webhooks.Webhook;
}

function convertWebhookPayload(payload: IrVersions.V65.WebhookPayload): IrVersions.V63.webhooks.WebhookPayload {
    switch (payload.type) {
        case "inlinedPayload":
            return IrVersions.V63.webhooks.WebhookPayload.inlinedPayload({
                ...payload,
                properties: payload.properties.map((prop) => ({
                    ...prop,
                    availability: convertAvailability(prop.availability)
                }))
            } as unknown as IrVersions.V63.webhooks.InlinedWebhookPayload);
        default:
            return payload as unknown as IrVersions.V63.webhooks.WebhookPayload;
    }
}

function convertWebsocketChannel(channel: IrVersions.V65.WebSocketChannel): IrVersions.V63.websocket.WebSocketChannel {
    return {
        ...channel,
        availability: convertAvailability(channel.availability),
        headers: channel.headers?.map((h) => convertHttpHeader(h)),
        queryParameters: channel.queryParameters?.map((q) => convertQueryParameter(q)),
        messages: channel.messages?.map((m) => convertWebsocketMessage(m))
    } as unknown as IrVersions.V63.websocket.WebSocketChannel;
}

function convertWebsocketMessage(message: IrVersions.V65.WebSocketMessage): IrVersions.V63.websocket.WebSocketMessage {
    return {
        ...message,
        availability: convertAvailability(message.availability),
        body: convertWebsocketMessageBody(message.body)
    } as unknown as IrVersions.V63.websocket.WebSocketMessage;
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
                    availability: convertAvailability(prop.availability)
                }))
            } as unknown as IrVersions.V63.websocket.InlinedWebSocketMessageBody);
        default:
            return body as unknown as IrVersions.V63.websocket.WebSocketMessageBody;
    }
}

function convertPagination(
    pagination: IrVersions.V65.Pagination,
    context: IrMigrationContext
): IrVersions.V63.http.Pagination | undefined {
    switch (pagination.type) {
        case "cursor":
            return IrVersions.V63.http.Pagination.cursor(pagination as unknown as IrVersions.V63.http.CursorPagination);
        case "offset":
            return IrVersions.V63.http.Pagination.offset(pagination as unknown as IrVersions.V63.http.OffsetPagination);
        case "custom":
            return IrVersions.V63.http.Pagination.custom(pagination as unknown as IrVersions.V63.http.CustomPagination);
        case "uri":
        case "path":
            context.taskContext.logger.warn(
                `Pagination with '${pagination.type}' cannot be migrated to IR v63. Removing pagination config.`
            );
            return undefined;
    }
}
