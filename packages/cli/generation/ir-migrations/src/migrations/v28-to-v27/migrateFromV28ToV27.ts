import { GeneratorName } from "@fern-api/configuration-loader";
import { assertNever } from "@fern-api/core-utils";

import { IrSerialization } from "../../ir-serialization";
import { IrVersions } from "../../ir-versions";
import {
    GeneratorWasNeverUpdatedToConsumeNewIR,
    GeneratorWasNotCreatedYet,
    IrMigration
} from "../../types/IrMigration";

export const V28_TO_V27_MIGRATION: IrMigration<
    IrVersions.V28.ir.IntermediateRepresentation,
    IrVersions.V27.ir.IntermediateRepresentation
> = {
    laterVersion: "v28",
    earlierVersion: "v27",
    firstGeneratorVersionToConsumeNewIR: {
        [GeneratorName.TYPESCRIPT_NODE_SDK]: "0.8.1-1-g0f40bf18",
        [GeneratorName.TYPESCRIPT_BROWSER_SDK]: "0.8.1-1-g0f40bf18",
        [GeneratorName.TYPESCRIPT]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.TYPESCRIPT_SDK]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.TYPESCRIPT_EXPRESS]: "0.8.1-1-g0f40bf18",
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
        [GeneratorName.GO_FIBER]: "0.9.0-2-g6b0be0e",
        [GeneratorName.GO_MODEL]: "0.9.0-2-g6b0be0e",
        [GeneratorName.GO_SDK]: "0.9.0-2-g6b0be0e",
        [GeneratorName.RUBY_MODEL]: GeneratorWasNotCreatedYet,
        [GeneratorName.RUBY_SDK]: GeneratorWasNotCreatedYet,
        [GeneratorName.CSHARP_MODEL]: GeneratorWasNotCreatedYet,
        [GeneratorName.CSHARP_SDK]: GeneratorWasNotCreatedYet,
        [GeneratorName.SWIFT_MODEL]: GeneratorWasNotCreatedYet,
        [GeneratorName.SWIFT_SDK]: GeneratorWasNotCreatedYet,
        [GeneratorName.PHP_MODEL]: GeneratorWasNotCreatedYet,
        [GeneratorName.PHP_SDK]: GeneratorWasNotCreatedYet
    },
    jsonifyEarlierVersion: (ir) =>
        IrSerialization.V27.IntermediateRepresentation.jsonOrThrow(ir, {
            unrecognizedObjectKeys: "strip"
        }),
    migrateBackwards: (v28): IrVersions.V27.ir.IntermediateRepresentation => {
        return {
            ...v28,
            auth: convertAuth(v28.auth),
            headers: convertHttpHeaders(v28.headers),
            types: Object.fromEntries(
                Object.entries(v28.types).map(([key, val]) => {
                    return [key, convertTypeDeclaration(val)];
                })
            ),
            services: Object.fromEntries(
                Object.entries(v28.services).map(([key, val]) => {
                    return [key, convertHttpService(val)];
                })
            ),
            webhookGroups: Object.fromEntries(
                Object.entries(v28.webhookGroups).map(([key, val]) => {
                    return [key, convertWebhookGroup(val)];
                })
            ),
            errors: Object.fromEntries(
                Object.entries(v28.errors).map(([key, val]) => {
                    return [key, convertErrorDeclaration(val)];
                })
            ),
            pathParameters: convertPathParameters(v28.pathParameters),
            variables: convertVariableDeclarations(v28.variables)
        };
    }
};

function convertVariableDeclarations(val: IrVersions.V28.VariableDeclaration[]): IrVersions.V27.VariableDeclaration[] {
    return val.map((variable) => {
        return convertVariableDeclaration(variable);
    });
}

function convertVariableDeclaration(val: IrVersions.V28.VariableDeclaration): IrVersions.V27.VariableDeclaration {
    return {
        ...val,
        type: maybeConvertBooleanLiteralForTypeReference(val.type)
    };
}

function convertErrorDeclaration(val: IrVersions.V28.ErrorDeclaration): IrVersions.V27.ErrorDeclaration {
    return {
        ...val,
        type: val.type != null ? maybeConvertBooleanLiteralForTypeReference(val.type) : undefined
    };
}

function convertWebhookGroup(val: IrVersions.V28.WebhookGroup): IrVersions.V27.WebhookGroup {
    return val.map((webhook) => {
        return convertWebhook(webhook);
    });
}

function convertWebhook(val: IrVersions.V28.Webhook): IrVersions.V27.Webhook {
    return {
        ...val,
        headers: convertHttpHeaders(val.headers),
        payload: convertWebhookPayload(val.payload)
    };
}

function convertWebhookPayload(val: IrVersions.V28.WebhookPayload): IrVersions.V27.WebhookPayload {
    switch (val.type) {
        case "inlinedPayload":
            return IrVersions.V27.WebhookPayload.inlinedPayload(convertInlinedWebhookPayload(val));
        case "reference":
            return IrVersions.V27.WebhookPayload.reference({
                ...val,
                payloadType: maybeConvertBooleanLiteralForTypeReference(val.payloadType)
            });
    }
}

function convertInlinedWebhookPayload(val: IrVersions.V28.InlinedWebhookPayload): IrVersions.V27.InlinedWebhookPayload {
    return {
        ...val,
        properties: convertInlinedWebhookPayloadProperties(val.properties)
    };
}

function convertInlinedWebhookPayloadProperties(
    val: IrVersions.V28.InlinedWebhookPayloadProperty[]
): IrVersions.V27.InlinedWebhookPayloadProperty[] {
    return val.map((payloadProperty) => {
        return convertInlinedWebhookPayloadProperty(payloadProperty);
    });
}

function convertInlinedWebhookPayloadProperty(
    val: IrVersions.V28.InlinedWebhookPayloadProperty
): IrVersions.V27.InlinedWebhookPayloadProperty {
    return {
        ...val,
        valueType: maybeConvertBooleanLiteralForTypeReference(val.valueType)
    };
}

function convertHttpService(val: IrVersions.V28.HttpService): IrVersions.V27.HttpService {
    return {
        ...val,
        endpoints: convertHttpEndpoints(val.endpoints),
        headers: convertHttpHeaders(val.headers),
        pathParameters: convertPathParameters(val.pathParameters)
    };
}

function convertHttpEndpoints(val: IrVersions.V28.HttpEndpoint[]): IrVersions.V27.HttpEndpoint[] {
    return val.map((httpEndpoint) => {
        return convertHttpEndpoint(httpEndpoint);
    });
}

function convertHttpEndpoint(val: IrVersions.V28.HttpEndpoint): IrVersions.V27.HttpEndpoint {
    return {
        ...val,
        headers: convertHttpHeaders(val.headers),
        pathParameters: convertPathParameters(val.pathParameters),
        allPathParameters: convertPathParameters(val.allPathParameters),
        queryParameters: convertQueryParameters(val.queryParameters),
        requestBody: val.requestBody != null ? convertHttpRequestBody(val.requestBody) : undefined,
        sdkRequest: val.sdkRequest != null ? convertSdkRequest(val.sdkRequest) : undefined,
        response: val.response != null ? convertHttpResponse(val.response) : undefined
    };
}

function convertHttpResponse(val: IrVersions.V28.HttpResponse): IrVersions.V27.HttpResponse {
    switch (val.type) {
        case "json":
            return IrVersions.V27.HttpResponse.json(convertJsonResponse(val.value));
        case "fileDownload":
            return IrVersions.V27.HttpResponse.fileDownload(val);
        case "text":
            return IrVersions.V27.HttpResponse.text(val);
        case "streaming":
            return IrVersions.V27.HttpResponse.streaming(convertStreamingResponse(val));
        default:
            assertNever(val);
    }
}

function convertStreamingResponse(val: IrVersions.V28.StreamingResponse): IrVersions.V27.StreamingResponse {
    return {
        ...val,
        dataEventType: convertStreamingResponseChunkType(val.dataEventType)
    };
}

function convertStreamingResponseChunkType(
    val: IrVersions.V28.StreamingResponseChunkType
): IrVersions.V27.StreamingResponseChunkType {
    switch (val.type) {
        case "json":
            return IrVersions.V27.StreamingResponseChunkType.json(maybeConvertBooleanLiteralForTypeReference(val.json));
        case "text":
            return IrVersions.V27.StreamingResponseChunkType.text();
        default:
            assertNever(val);
    }
}

function convertJsonResponse(val: IrVersions.V28.JsonResponse): IrVersions.V27.JsonResponse {
    switch (val.type) {
        case "response":
            return IrVersions.V27.JsonResponse.response({
                ...val,
                responseBodyType: maybeConvertBooleanLiteralForTypeReference(val.responseBodyType)
            });
        case "nestedPropertyAsResponse":
            return IrVersions.V27.JsonResponse.nestedPropertyAsResponse({
                ...val,
                responseBodyType: maybeConvertBooleanLiteralForTypeReference(val.responseBodyType),
                responseProperty: val.responseProperty != null ? convertObjectProperty(val.responseProperty) : undefined
            });
        default:
            assertNever(val);
    }
}

function convertSdkRequest(val: IrVersions.V28.SdkRequest): IrVersions.V27.SdkRequest {
    return {
        ...val,
        shape: convertSdkRequestShape(val.shape)
    };
}

function convertSdkRequestShape(val: IrVersions.V28.SdkRequestShape): IrVersions.V27.SdkRequestShape {
    switch (val.type) {
        case "justRequestBody":
            return IrVersions.V27.SdkRequestShape.justRequestBody(convertSdkRequestBodyType(val.value));
        case "wrapper":
            return IrVersions.V27.SdkRequestShape.wrapper(val);
        default:
            assertNever(val);
    }
}

function convertSdkRequestBodyType(val: IrVersions.V28.SdkRequestBodyType): IrVersions.V27.SdkRequestBodyType {
    switch (val.type) {
        case "typeReference":
            return IrVersions.V27.SdkRequestBodyType.typeReference(convertHttpRequestBodyReference(val));
        case "bytes":
            return IrVersions.V27.SdkRequestBodyType.bytes(val);
        default:
            assertNever(val);
    }
}

function convertHttpRequestBody(val: IrVersions.V28.HttpRequestBody): IrVersions.V27.HttpRequestBody {
    switch (val.type) {
        case "inlinedRequestBody":
            return IrVersions.V27.HttpRequestBody.inlinedRequestBody(convertInlinedRequestBody(val));
        case "reference":
            return IrVersions.V27.HttpRequestBody.reference(convertHttpRequestBodyReference(val));
        case "fileUpload":
            return IrVersions.V27.HttpRequestBody.fileUpload(convertFileUploadRequest(val));
        case "bytes":
            return IrVersions.V27.HttpRequestBody.bytes(val);
        default:
            assertNever(val);
    }
}

function convertFileUploadRequest(val: IrVersions.V28.FileUploadRequest): IrVersions.V27.FileUploadRequest {
    return {
        ...val,
        properties: convertFileUploadRequestProperties(val.properties)
    };
}

function convertFileUploadRequestProperties(
    val: IrVersions.V28.FileUploadRequestProperty[]
): IrVersions.V27.FileUploadRequestProperty[] {
    return val.map((fileUploadRequestProperty) => {
        return convertFileUploadRequestProperty(fileUploadRequestProperty);
    });
}

function convertFileUploadRequestProperty(
    val: IrVersions.V28.FileUploadRequestProperty
): IrVersions.V27.FileUploadRequestProperty {
    switch (val.type) {
        case "file":
            return IrVersions.V27.FileUploadRequestProperty.file(val);
        case "bodyProperty":
            return IrVersions.V27.FileUploadRequestProperty.bodyProperty(convertInlinedRequestBodyProperty(val));
        default:
            assertNever(val);
    }
}

function convertHttpRequestBodyReference(
    val: IrVersions.V28.HttpRequestBodyReference
): IrVersions.V27.HttpRequestBodyReference {
    return {
        ...val,
        requestBodyType: maybeConvertBooleanLiteralForTypeReference(val.requestBodyType)
    };
}

function convertInlinedRequestBody(val: IrVersions.V28.InlinedRequestBody): IrVersions.V27.InlinedRequestBody {
    return {
        ...val,
        properties: convertInlinedRequestBodyProperties(val.properties)
    };
}

function convertInlinedRequestBodyProperties(
    val: IrVersions.V28.InlinedRequestBodyProperty[]
): IrVersions.V27.InlinedRequestBodyProperty[] {
    return val.map((inlinedRequestBodyProperty) => {
        return convertInlinedRequestBodyProperty(inlinedRequestBodyProperty);
    });
}

function convertInlinedRequestBodyProperty(
    val: IrVersions.V28.InlinedRequestBodyProperty
): IrVersions.V27.InlinedRequestBodyProperty {
    return {
        ...val,
        valueType: maybeConvertBooleanLiteralForTypeReference(val.valueType)
    };
}

function convertPathParameters(val: IrVersions.V28.PathParameter[]): IrVersions.V27.PathParameter[] {
    return val.map((pathParameter) => {
        return convertPathParameter(pathParameter);
    });
}

function convertPathParameter(val: IrVersions.V28.PathParameter): IrVersions.V27.PathParameter {
    return {
        ...val,
        valueType: maybeConvertBooleanLiteralForTypeReference(val.valueType)
    };
}

function convertQueryParameters(val: IrVersions.V28.QueryParameter[]): IrVersions.V27.QueryParameter[] {
    return val.map((pathParameter) => {
        return convertQueryParameter(pathParameter);
    });
}

function convertQueryParameter(val: IrVersions.V28.QueryParameter): IrVersions.V27.QueryParameter {
    return {
        ...val,
        valueType: maybeConvertBooleanLiteralForTypeReference(val.valueType)
    };
}

function convertAuth(val: IrVersions.V28.ApiAuth): IrVersions.V27.ApiAuth {
    return {
        ...val,
        schemes: convertAuthSchemes(val.schemes)
    };
}

function convertAuthSchemes(val: IrVersions.V28.AuthScheme[]): IrVersions.V27.AuthScheme[] {
    return val.map((authScheme) => {
        return convertAuthScheme(authScheme);
    });
}

function convertAuthScheme(val: IrVersions.V28.AuthScheme): IrVersions.V27.AuthScheme {
    switch (val.type) {
        case "basic":
            return IrVersions.V27.AuthScheme.basic(val);
        case "bearer":
            return IrVersions.V27.AuthScheme.bearer(val);
        case "header":
            return convertHeaderAuthScheme(val);
        default:
            assertNever(val);
    }
}

function convertHeaderAuthScheme(val: IrVersions.V28.AuthScheme.Header): IrVersions.V27.AuthScheme.Header {
    return IrVersions.V27.AuthScheme.header({
        ...val,
        valueType: maybeConvertBooleanLiteralForTypeReference(val.valueType)
    });
}

function convertHttpHeaders(val: IrVersions.V28.HttpHeader[]): IrVersions.V27.HttpHeader[] {
    return val.map((httpHeader) => {
        return convertHttpHeader(httpHeader);
    });
}

function convertHttpHeader(val: IrVersions.V28.HttpHeader): IrVersions.V27.HttpHeader {
    return {
        ...val,
        valueType: maybeConvertBooleanLiteralForTypeReference(val.valueType)
    };
}

function convertTypeDeclaration(val: IrVersions.V28.TypeDeclaration): IrVersions.V27.TypeDeclaration {
    return {
        ...val,
        shape: convertType(val.shape)
    };
}

function convertType(val: IrVersions.V28.Type): IrVersions.V27.Type {
    switch (val.type) {
        case "alias":
            return IrVersions.V27.Type.alias(convertAliasTypeDeclaration(val));
        case "enum":
            return IrVersions.V27.Type.enum(val);
        case "object":
            return IrVersions.V27.Type.object(convertObjectTypeDeclaration(val));
        case "union":
            return IrVersions.V27.Type.union(convertUnionTypeDeclaration(val));
        case "undiscriminatedUnion":
            return IrVersions.V27.Type.undiscriminatedUnion(convertUndiscriminatedUnionTypeDeclaration(val));
        default:
            assertNever(val);
    }
}

function convertAliasTypeDeclaration(val: IrVersions.V28.AliasTypeDeclaration): IrVersions.V27.AliasTypeDeclaration {
    return {
        aliasOf: maybeConvertBooleanLiteralForTypeReference(val.aliasOf),
        resolvedType: convertResolvedTypeReference(val.resolvedType)
    };
}

function convertObjectTypeDeclaration(val: IrVersions.V28.ObjectTypeDeclaration): IrVersions.V27.ObjectTypeDeclaration {
    return {
        ...val,
        properties: convertObjectProperties(val.properties)
    };
}

function convertUnionTypeDeclaration(val: IrVersions.V28.UnionTypeDeclaration): IrVersions.V27.UnionTypeDeclaration {
    return {
        ...val,
        types: convertSingleUnionTypes(val.types),
        baseProperties: convertObjectProperties(val.baseProperties)
    };
}

function convertUndiscriminatedUnionTypeDeclaration(
    val: IrVersions.V28.UndiscriminatedUnionTypeDeclaration
): IrVersions.V27.UndiscriminatedUnionTypeDeclaration {
    return {
        members: convertUndiscriminatedUnionMembers(val.members)
    };
}

function convertObjectProperties(val: IrVersions.V28.ObjectProperty[]): IrVersions.V27.ObjectProperty[] {
    return val.map((objectProperty) => {
        return convertObjectProperty(objectProperty);
    });
}

function convertObjectProperty(val: IrVersions.V28.ObjectProperty): IrVersions.V27.ObjectProperty {
    return {
        ...val,
        valueType: maybeConvertBooleanLiteralForTypeReference(val.valueType)
    };
}

function convertSingleUnionTypes(val: IrVersions.V28.SingleUnionType[]): IrVersions.V27.SingleUnionType[] {
    return val.map((singleUnionType) => {
        return {
            ...singleUnionType,
            shape: convertSingleUnionTypeProperties(singleUnionType.shape)
        };
    });
}

function convertSingleUnionTypeProperties(
    val: IrVersions.V28.SingleUnionTypeProperties
): IrVersions.V27.SingleUnionTypeProperties {
    switch (val.propertiesType) {
        case "samePropertiesAsObject":
            return IrVersions.V27.SingleUnionTypeProperties.samePropertiesAsObject(val);
        case "singleProperty":
            return IrVersions.V27.SingleUnionTypeProperties.singleProperty({
                name: val.name,
                type: maybeConvertBooleanLiteralForTypeReference(val.type)
            });
        case "noProperties":
            return IrVersions.V27.SingleUnionTypeProperties.noProperties();
        default:
            assertNever(val);
    }
}

function convertUndiscriminatedUnionMembers(
    val: IrVersions.V28.UndiscriminatedUnionMember[]
): IrVersions.V27.UndiscriminatedUnionMember[] {
    return val.map((member) => {
        return {
            ...member,
            type: maybeConvertBooleanLiteralForTypeReference(member.type)
        };
    });
}

function convertResolvedTypeReference(val: IrVersions.V28.ResolvedTypeReference): IrVersions.V27.ResolvedTypeReference {
    switch (val.type) {
        case "container":
            if (val.container.type === "literal") {
                if (val.container.literal.type === "boolean") {
                    return IrVersions.V27.ResolvedTypeReference.primitive(IrVersions.V27.PrimitiveType.Boolean);
                }
                return IrVersions.V27.ResolvedTypeReference.container(
                    IrVersions.V27.ContainerType.literal(IrVersions.V27.Literal.string(val.container.literal.string))
                );
            }
            return IrVersions.V27.ResolvedTypeReference.container(
                maybeConvertBooleanLiteralForContainer(val.container)
            );
        case "named":
            return IrVersions.V27.ResolvedTypeReference.named(val);
        case "primitive":
            return IrVersions.V27.ResolvedTypeReference.primitive(val.primitive);
        case "unknown":
            return IrVersions.V27.ResolvedTypeReference.unknown();
        default:
            assertNever(val);
    }
}

function maybeConvertBooleanLiteralForTypeReference(val: IrVersions.V28.TypeReference): IrVersions.V27.TypeReference {
    switch (val.type) {
        case "container":
            if (val.container.type === "literal") {
                if (val.container.literal.type === "boolean") {
                    return IrVersions.V27.TypeReference.primitive(IrVersions.V27.PrimitiveType.Boolean);
                }
                return IrVersions.V27.TypeReference.container(
                    IrVersions.V27.ContainerType.literal(IrVersions.V27.Literal.string(val.container.literal.string))
                );
            }
            return IrVersions.V27.TypeReference.container(maybeConvertBooleanLiteralForContainer(val.container));
        case "named":
            return IrVersions.V27.TypeReference.named(val);
        case "primitive":
            return IrVersions.V27.TypeReference.primitive(val.primitive);
        case "unknown":
            return IrVersions.V27.TypeReference.unknown();
        default:
            assertNever(val);
    }
}

function maybeConvertBooleanLiteralForContainer(container: IrVersions.V28.ContainerType): IrVersions.V27.ContainerType {
    switch (container.type) {
        case "list":
            return IrVersions.V27.ContainerType.list(maybeConvertBooleanLiteralForTypeReference(container.list));
        case "map":
            return IrVersions.V27.ContainerType.map({
                keyType: maybeConvertBooleanLiteralForTypeReference(container.keyType),
                valueType: maybeConvertBooleanLiteralForTypeReference(container.valueType)
            });
        case "optional":
            return IrVersions.V27.ContainerType.optional(
                maybeConvertBooleanLiteralForTypeReference(container.optional)
            );
        case "set":
            return IrVersions.V27.ContainerType.set(maybeConvertBooleanLiteralForTypeReference(container.set));
        case "literal":
            if (container.literal.type === "boolean") {
                // We throw an error here because the transformation is handled elsewhere.
                // This makes it possible to always return a ContainerType here.
                throw new Error("Internal error; failed to transform boolean literal between IR versions");
            }
            return IrVersions.V27.ContainerType.literal(IrVersions.V27.Literal.string(container.literal.string));
        default:
            assertNever(container);
    }
}
