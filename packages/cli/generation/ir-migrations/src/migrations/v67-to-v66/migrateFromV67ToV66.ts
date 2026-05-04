import { GeneratorName } from "@fern-api/configuration-loader";
import { assertNever } from "@fern-api/core-utils";

import { IrMigrationContext } from "../../IrMigrationContext.js";
import { IrSerialization } from "../../ir-serialization/index.js";
import { IrVersions } from "../../ir-versions/index.js";
import { GeneratorWasNeverUpdatedToConsumeNewIR, IrMigration } from "../../types/IrMigration.js";

export const V67_TO_V66_MIGRATION: IrMigration<
    IrVersions.V67.ir.IntermediateRepresentation,
    IrVersions.V66.ir.IntermediateRepresentation
> = {
    laterVersion: "v67",
    earlierVersion: "v66",
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
        [GeneratorName.OPENAPI_PYTHON_CLIENT]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.OPENAPI]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.PYTHON_FASTAPI]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.PYTHON_PYDANTIC]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.PYTHON_SDK]: GeneratorWasNeverUpdatedToConsumeNewIR,
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
        IrSerialization.V66.IntermediateRepresentation.jsonOrThrow(ir, {
            unrecognizedObjectKeys: "passthrough",
            skipValidation: true
        }),
    migrateBackwards: (
        v67: IrVersions.V67.ir.IntermediateRepresentation,
        _context: IrMigrationContext
    ): IrVersions.V66.ir.IntermediateRepresentation => {
        // The workspace V67 SDK and the published V66 SDK are nominally distinct generated
        // TypeScript packages (newer `_Utils` style vs. older flat declarations), so a V67 IR
        // value with V66-compatible runtime shape is not structurally assignable to V66's IR
        // type. We migrate availability values in V67 space, then round-trip through V67's
        // serializer + V66's parser to obtain a true V66-typed object.
        const migrated = migrateIntermediateRepresentation(v67);
        const json = IrSerialization.V67.IntermediateRepresentation.jsonOrThrow(migrated, {
            unrecognizedObjectKeys: "passthrough",
            skipValidation: true
        });
        return IrSerialization.V66.IntermediateRepresentation.parseOrThrow(json, {
            unrecognizedObjectKeys: "passthrough",
            skipValidation: true
        });
    }
};

// V66 does not know about ALPHA, BETA, PREVIEW, or LEGACY, so map them to the closest
// pre-existing v66 availability status for backward compatibility with older generators.
function downcastAvailabilityStatus(status: IrVersions.V67.AvailabilityStatus): IrVersions.V66.AvailabilityStatus {
    switch (status) {
        case "IN_DEVELOPMENT":
        case "ALPHA":
            return IrVersions.V66.AvailabilityStatus.InDevelopment;
        case "PRE_RELEASE":
        case "BETA":
        case "PREVIEW":
            return IrVersions.V66.AvailabilityStatus.PreRelease;
        case "GENERAL_AVAILABILITY":
            return IrVersions.V66.AvailabilityStatus.GeneralAvailability;
        case "DEPRECATED":
        case "LEGACY":
            return IrVersions.V66.AvailabilityStatus.Deprecated;
        default:
            return assertNever(status);
    }
}

function migrateAvailability(
    availability: IrVersions.V67.Availability | undefined
): IrVersions.V67.Availability | undefined {
    if (availability == null) {
        return availability;
    }
    return {
        ...availability,
        // The downcast result is a V66 status string. It is also a valid V67 status string
        // (since V67 is a strict superset of V66), so we keep V67 typing throughout the
        // V67-shaped traversal. The final V66 conversion happens in `migrateBackwards`.
        status: downcastAvailabilityStatus(availability.status)
    };
}

// ===== Explicit traversal of every IR site that carries an `availability` field =====
// The only structural difference between V67 and V66 is the AvailabilityStatus enum, so
// we keep the rest of the IR in place and only rewrite the `availability` field at each
// known site. Walking the IR explicitly (instead of via a generic recursive object walker)
// avoids matching unrelated user data (e.g. raw `jsonExample` payloads that happen to
// contain an `availability` field) and keeps non-plain objects (Date, Buffer, Set, Map)
// intact without special-casing.

function migrateIntermediateRepresentation(
    v67: IrVersions.V67.ir.IntermediateRepresentation
): IrVersions.V67.ir.IntermediateRepresentation {
    return {
        ...v67,
        apiVersion: v67.apiVersion != null ? migrateApiVersionScheme(v67.apiVersion) : undefined,
        headers: v67.headers.map(migrateHttpHeader),
        idempotencyHeaders: v67.idempotencyHeaders.map(migrateHttpHeader),
        types: mapRecord(v67.types, migrateTypeDeclaration),
        services: mapRecord(v67.services, migrateHttpService),
        errors: mapRecord(v67.errors, migrateErrorDeclaration),
        webhookGroups: mapRecord(v67.webhookGroups, (group) => group.map(migrateWebhook)),
        websocketChannels:
            v67.websocketChannels != null ? mapRecord(v67.websocketChannels, migrateWebSocketChannel) : undefined
    };
}

function migrateApiVersionScheme(scheme: IrVersions.V67.ApiVersionScheme): IrVersions.V67.ApiVersionScheme {
    switch (scheme.type) {
        case "header":
            return {
                ...scheme,
                header: migrateHttpHeader(scheme.header),
                value: {
                    ...scheme.value,
                    default: scheme.value.default != null ? migrateEnumValue(scheme.value.default) : undefined,
                    values: scheme.value.values.map(migrateEnumValue)
                }
            };
        default:
            return assertNever(scheme.type);
    }
}

function migrateErrorDeclaration(error: IrVersions.V67.ErrorDeclaration): IrVersions.V67.ErrorDeclaration {
    return {
        ...error,
        headers: error.headers?.map(migrateHttpHeader)
    };
}

function migrateHttpHeader(header: IrVersions.V67.HttpHeader): IrVersions.V67.HttpHeader {
    return {
        ...header,
        availability: migrateAvailability(header.availability)
    };
}

function migrateQueryParameter(queryParameter: IrVersions.V67.QueryParameter): IrVersions.V67.QueryParameter {
    return {
        ...queryParameter,
        availability: migrateAvailability(queryParameter.availability)
    };
}

function migrateObjectProperty(property: IrVersions.V67.ObjectProperty): IrVersions.V67.ObjectProperty {
    return {
        ...property,
        availability: migrateAvailability(property.availability)
    };
}

function migrateInlinedRequestBodyProperty(
    property: IrVersions.V67.InlinedRequestBodyProperty
): IrVersions.V67.InlinedRequestBodyProperty {
    return {
        ...property,
        availability: migrateAvailability(property.availability)
    };
}

function migrateInlinedWebhookPayloadProperty(
    property: IrVersions.V67.InlinedWebhookPayloadProperty
): IrVersions.V67.InlinedWebhookPayloadProperty {
    return {
        ...property,
        availability: migrateAvailability(property.availability)
    };
}

function migrateInlinedWebSocketMessageBodyProperty(
    property: IrVersions.V67.InlinedWebSocketMessageBodyProperty
): IrVersions.V67.InlinedWebSocketMessageBodyProperty {
    return {
        ...property,
        availability: migrateAvailability(property.availability)
    };
}

function migrateEnumValue(enumValue: IrVersions.V67.EnumValue): IrVersions.V67.EnumValue {
    return {
        ...enumValue,
        availability: migrateAvailability(enumValue.availability)
    };
}

function migrateSingleUnionType(singleUnionType: IrVersions.V67.SingleUnionType): IrVersions.V67.SingleUnionType {
    return {
        ...singleUnionType,
        availability: migrateAvailability(singleUnionType.availability)
    };
}

function migrateTypeDeclaration(typeDeclaration: IrVersions.V67.TypeDeclaration): IrVersions.V67.TypeDeclaration {
    return {
        ...typeDeclaration,
        availability: migrateAvailability(typeDeclaration.availability),
        shape: migrateType(typeDeclaration.shape)
    };
}

function migrateType(type: IrVersions.V67.Type): IrVersions.V67.Type {
    switch (type.type) {
        case "alias":
            return type;
        case "undiscriminatedUnion":
            return {
                ...type,
                baseProperties: type.baseProperties?.map(migrateObjectProperty)
            };
        case "object":
            return {
                ...type,
                properties: type.properties.map(migrateObjectProperty),
                extendedProperties: type.extendedProperties?.map(migrateObjectProperty)
            };
        case "union":
            return {
                ...type,
                types: type.types.map(migrateSingleUnionType),
                baseProperties: type.baseProperties.map(migrateObjectProperty),
                default: type.default != null ? migrateSingleUnionType(type.default) : undefined
            };
        case "enum":
            return {
                ...type,
                default: type.default != null ? migrateEnumValue(type.default) : undefined,
                values: type.values.map(migrateEnumValue)
            };
        default:
            return assertNever(type);
    }
}

function migrateHttpService(service: IrVersions.V67.HttpService): IrVersions.V67.HttpService {
    return {
        ...service,
        availability: migrateAvailability(service.availability),
        headers: service.headers.map(migrateHttpHeader),
        endpoints: service.endpoints.map(migrateHttpEndpoint)
    };
}

function migrateHttpEndpoint(endpoint: IrVersions.V67.HttpEndpoint): IrVersions.V67.HttpEndpoint {
    return {
        ...endpoint,
        availability: migrateAvailability(endpoint.availability),
        headers: endpoint.headers.map(migrateHttpHeader),
        responseHeaders: endpoint.responseHeaders?.map(migrateHttpHeader),
        queryParameters: endpoint.queryParameters.map(migrateQueryParameter),
        requestBody: endpoint.requestBody != null ? migrateHttpRequestBody(endpoint.requestBody) : undefined,
        v2RequestBodies:
            endpoint.v2RequestBodies != null ? migrateV2HttpRequestBodies(endpoint.v2RequestBodies) : undefined
    };
}

function migrateV2HttpRequestBodies(
    v2RequestBodies: IrVersions.V67.V2HttpRequestBodies
): IrVersions.V67.V2HttpRequestBodies {
    return {
        ...v2RequestBodies,
        requestBodies: v2RequestBodies.requestBodies?.map(migrateHttpRequestBody)
    };
}

function migrateHttpRequestBody(requestBody: IrVersions.V67.HttpRequestBody): IrVersions.V67.HttpRequestBody {
    switch (requestBody.type) {
        case "inlinedRequestBody":
            return {
                ...requestBody,
                properties: requestBody.properties.map(migrateInlinedRequestBodyProperty),
                extendedProperties: requestBody.extendedProperties?.map(migrateObjectProperty)
            };
        case "fileUpload":
            return {
                ...requestBody,
                properties: requestBody.properties.map(migrateFileUploadRequestProperty)
            };
        case "reference":
        case "bytes":
            return requestBody;
        default:
            return assertNever(requestBody);
    }
}

function migrateFileUploadRequestProperty(
    property: IrVersions.V67.FileUploadRequestProperty
): IrVersions.V67.FileUploadRequestProperty {
    switch (property.type) {
        case "file":
            return property;
        case "bodyProperty":
            return {
                ...property,
                availability: migrateAvailability(property.availability)
            };
        default:
            return assertNever(property);
    }
}

function migrateWebhook(webhook: IrVersions.V67.Webhook): IrVersions.V67.Webhook {
    return {
        ...webhook,
        availability: migrateAvailability(webhook.availability),
        headers: webhook.headers.map(migrateHttpHeader),
        payload: migrateWebhookPayload(webhook.payload),
        fileUploadPayload:
            webhook.fileUploadPayload != null ? migrateFileUploadRequest(webhook.fileUploadPayload) : undefined
    };
}

function migrateFileUploadRequest(
    fileUploadRequest: IrVersions.V67.FileUploadRequest
): IrVersions.V67.FileUploadRequest {
    return {
        ...fileUploadRequest,
        properties: fileUploadRequest.properties.map(migrateFileUploadRequestProperty)
    };
}

function migrateWebhookPayload(payload: IrVersions.V67.WebhookPayload): IrVersions.V67.WebhookPayload {
    switch (payload.type) {
        case "inlinedPayload":
            return {
                ...payload,
                properties: payload.properties.map(migrateInlinedWebhookPayloadProperty)
            };
        case "reference":
            return payload;
        default:
            return assertNever(payload);
    }
}

function migrateWebSocketChannel(channel: IrVersions.V67.WebSocketChannel): IrVersions.V67.WebSocketChannel {
    return {
        ...channel,
        availability: migrateAvailability(channel.availability),
        headers: channel.headers.map(migrateHttpHeader),
        queryParameters: channel.queryParameters.map(migrateQueryParameter),
        messages: channel.messages.map(migrateWebSocketMessage)
    };
}

function migrateWebSocketMessage(message: IrVersions.V67.WebSocketMessage): IrVersions.V67.WebSocketMessage {
    return {
        ...message,
        availability: migrateAvailability(message.availability),
        body: migrateWebSocketMessageBody(message.body)
    };
}

function migrateWebSocketMessageBody(body: IrVersions.V67.WebSocketMessageBody): IrVersions.V67.WebSocketMessageBody {
    switch (body.type) {
        case "inlinedBody":
            return {
                ...body,
                properties: body.properties.map(migrateInlinedWebSocketMessageBodyProperty)
            };
        case "reference":
            return body;
        default:
            return assertNever(body);
    }
}

function mapRecord<K extends string, V, R>(record: Record<K, V>, fn: (value: V) => R): Record<K, R> {
    const result = {} as Record<K, R>;
    for (const key of Object.keys(record) as K[]) {
        result[key] = fn(record[key]);
    }
    return result;
}
