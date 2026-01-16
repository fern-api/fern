import { GeneratorName } from "@fern-api/configuration-loader";
import { mapValues } from "lodash-es";
import { IrSerialization } from "../../ir-serialization";
import { IrVersions } from "../../ir-versions";
import { GeneratorWasNeverUpdatedToConsumeNewIR, IrMigration } from "../../types/IrMigration";

export const V63_TO_V62_MIGRATION: IrMigration<
    IrVersions.V63.ir.IntermediateRepresentation,
    IrVersions.V62.ir.IntermediateRepresentation
> = {
    laterVersion: "v63",
    earlierVersion: "v62",
    firstGeneratorVersionToConsumeNewIR: {
        [GeneratorName.TYPESCRIPT_NODE_SDK]: "3.43.0",
        [GeneratorName.TYPESCRIPT_BROWSER_SDK]: "3.43.0",
        [GeneratorName.TYPESCRIPT]: "3.43.0",
        [GeneratorName.TYPESCRIPT_SDK]: "3.43.0",
        [GeneratorName.TYPESCRIPT_EXPRESS]: "3.43.0",
        [GeneratorName.JAVA]: "3.28.0",
        [GeneratorName.JAVA_MODEL]: "1.8.5",
        [GeneratorName.JAVA_SDK]: "3.28.0",
        [GeneratorName.JAVA_SPRING]: "2.0.0-rc5",
        [GeneratorName.OPENAPI_PYTHON_CLIENT]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.OPENAPI]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.PYTHON_FASTAPI]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.PYTHON_PYDANTIC]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.PYTHON_SDK]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.STOPLIGHT]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.POSTMAN]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.GO_FIBER]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.GO_MODEL]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.GO_SDK]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.RUBY_MODEL]: GeneratorWasNeverUpdatedToConsumeNewIR,
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
        IrSerialization.V62.IntermediateRepresentation.jsonOrThrow(ir, {
            unrecognizedObjectKeys: "passthrough",
            skipValidation: true
        }),
    migrateBackwards: (
        v63: IrVersions.V63.IntermediateRepresentation
    ): IrVersions.V62.ir.IntermediateRepresentation => {
        const v62Types: Record<string, IrVersions.V62.types.TypeDeclaration> = mapValues(v63.types, (typeDeclaration) =>
            convertTypeDeclaration(typeDeclaration)
        );
        return {
            ...v63,
            auth: convertApiAuth(v63.auth),
            types: v62Types,
            services: mapValues(v63.services, (service) => convertHttpService(service)),
            errors: mapValues(v63.errors, (error) => convertErrorDeclaration(error)),
            headers: v63.headers?.map((header) => convertHttpHeader(header)) ?? [],
            idempotencyHeaders: v63.idempotencyHeaders?.map((header) => convertHttpHeader(header)) ?? [],
            pathParameters: v63.pathParameters?.map((pathParameter) => convertPathParameter(pathParameter)) ?? [],
            variables: v63.variables?.map((variable) => convertVariable(variable)) ?? [],
            webhookGroups: mapValues(v63.webhookGroups, (webhookGroup) => convertWebhookGroup(webhookGroup)),
            websocketChannels:
                v63.websocketChannels != null
                    ? mapValues(v63.websocketChannels, (channel) => convertWebsocketChannel(channel))
                    : undefined,
            // ApiVersion contains TypeReferences that need conversion, but since skipValidation is true
            // in the serializer, we can pass it through with a type assertion
            apiVersion: v63.apiVersion as unknown as IrVersions.V62.ir.ApiVersionScheme | undefined
        };
    }
};

function convertApiAuth(auth: IrVersions.V63.ApiAuth): IrVersions.V62.ApiAuth {
    return {
        ...auth,
        requirement: IrVersions.V63.AuthSchemesRequirement._visit(auth.requirement, {
            all: () => IrVersions.V62.AuthSchemesRequirement.All,
            any: () => IrVersions.V62.AuthSchemesRequirement.Any,
            // Convert ENDPOINT_SECURITY to ALL when migrating backwards since v62 doesn't support ENDPOINT_SECURITY
            endpointSecurity: () => IrVersions.V62.AuthSchemesRequirement.All,
            _other: () => IrVersions.V62.AuthSchemesRequirement.All
        }),
        schemes: auth.schemes.map((scheme) => convertAuthScheme(scheme))
    };
}

function convertAuthScheme(scheme: IrVersions.V63.AuthScheme): IrVersions.V62.AuthScheme {
    switch (scheme.type) {
        case "basic":
            return IrVersions.V62.AuthScheme.basic(scheme);
        case "bearer":
            return IrVersions.V62.AuthScheme.bearer(scheme);
        case "header":
            return IrVersions.V62.AuthScheme.header({
                ...scheme,
                valueType: convertTypeReference(scheme.valueType)
            });
        case "oauth":
            // OAuth contains nested TypeReferences that need conversion, but since skipValidation is true
            // in the serializer, we can pass it through with a type assertion
            return IrVersions.V62.AuthScheme.oauth(scheme as unknown as IrVersions.V62.auth.OAuthScheme);
        case "inferred":
            // Inferred auth scheme contains nested TypeReferences that need conversion, but since skipValidation is true
            // in the serializer, we can pass it through with a type assertion
            return IrVersions.V62.AuthScheme.inferred(scheme as unknown as IrVersions.V62.auth.InferredAuthScheme);
        default:
            throw new Error("Unknown AuthScheme type");
    }
}

function convertTypeDeclaration(typeDeclaration: IrVersions.V63.TypeDeclaration): IrVersions.V62.types.TypeDeclaration {
    return {
        ...typeDeclaration,
        shape: convertType(typeDeclaration.shape),
        // Examples contain TypeReferences that need conversion, but since skipValidation is true
        // in the serializer, we can pass them through and let the serializer handle it
        autogeneratedExamples: typeDeclaration.autogeneratedExamples as unknown as IrVersions.V62.types.ExampleType[],
        userProvidedExamples: typeDeclaration.userProvidedExamples as unknown as IrVersions.V62.types.ExampleType[]
    };
}

function convertType(type: IrVersions.V63.Type): IrVersions.V62.types.Type {
    switch (type.type) {
        case "alias":
            return IrVersions.V62.types.Type.alias({
                aliasOf: convertTypeReference(type.aliasOf),
                resolvedType: convertResolvedTypeReference(type.resolvedType)
            });
        case "enum":
            return IrVersions.V62.types.Type.enum(type);
        case "object":
            return IrVersions.V62.types.Type.object({
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
            return IrVersions.V62.types.Type.union({
                ...type,
                baseProperties: type.baseProperties.map((prop) => ({
                    ...prop,
                    valueType: convertTypeReference(prop.valueType)
                })),
                types: type.types.map((singleUnionType) => convertSingleUnionType(singleUnionType))
            });
        case "undiscriminatedUnion":
            return IrVersions.V62.types.Type.undiscriminatedUnion({
                members: type.members.map((member) => ({
                    ...member,
                    type: convertTypeReference(member.type)
                }))
            });
    }
}

function convertSingleUnionType(singleUnionType: IrVersions.V63.SingleUnionType): IrVersions.V62.types.SingleUnionType {
    return {
        ...singleUnionType,
        shape: convertSingleUnionTypeProperties(singleUnionType.shape)
    };
}

function convertSingleUnionTypeProperties(
    properties: IrVersions.V63.SingleUnionTypeProperties
): IrVersions.V62.types.SingleUnionTypeProperties {
    switch (properties.propertiesType) {
        case "samePropertiesAsObject":
            return IrVersions.V62.types.SingleUnionTypeProperties.samePropertiesAsObject(properties);
        case "singleProperty":
            return IrVersions.V62.types.SingleUnionTypeProperties.singleProperty({
                ...properties,
                type: convertTypeReference(properties.type)
            });
        case "noProperties":
            return IrVersions.V62.types.SingleUnionTypeProperties.noProperties();
    }
}

function convertResolvedTypeReference(
    resolved: IrVersions.V63.ResolvedTypeReference
): IrVersions.V62.types.ResolvedTypeReference {
    switch (resolved.type) {
        case "container":
            return IrVersions.V62.types.ResolvedTypeReference.container(convertContainerType(resolved.container));
        case "named":
            return IrVersions.V62.types.ResolvedTypeReference.named(resolved);
        case "primitive":
            return IrVersions.V62.types.ResolvedTypeReference.primitive(convertPrimitiveType(resolved.primitive));
        case "unknown":
            return IrVersions.V62.types.ResolvedTypeReference.unknown();
    }
}

function convertTypeReference(typeReference: IrVersions.V63.TypeReference): IrVersions.V62.types.TypeReference {
    switch (typeReference.type) {
        case "container":
            return IrVersions.V62.types.TypeReference.container(convertContainerType(typeReference.container));
        case "named":
            return IrVersions.V62.types.TypeReference.named(typeReference);
        case "primitive":
            return IrVersions.V62.types.TypeReference.primitive(convertPrimitiveType(typeReference.primitive));
        case "unknown":
            return IrVersions.V62.types.TypeReference.unknown();
    }
}

function convertContainerType(container: IrVersions.V63.ContainerType): IrVersions.V62.types.ContainerType {
    switch (container.type) {
        case "list":
            return IrVersions.V62.types.ContainerType.list(convertTypeReference(container.list));
        case "set":
            return IrVersions.V62.types.ContainerType.set(convertTypeReference(container.set));
        case "map":
            return IrVersions.V62.types.ContainerType.map({
                keyType: convertTypeReference(container.keyType),
                valueType: convertTypeReference(container.valueType)
            });
        case "optional":
            return IrVersions.V62.types.ContainerType.optional(convertTypeReference(container.optional));
        case "nullable":
            return IrVersions.V62.types.ContainerType.nullable(convertTypeReference(container.nullable));
        case "literal":
            return IrVersions.V62.types.ContainerType.literal(container.literal);
    }
}

function convertPrimitiveType(primitive: IrVersions.V63.PrimitiveType): IrVersions.V62.types.PrimitiveType {
    if (primitive.v2 == null) {
        return { v1: primitive.v1, v2: undefined };
    }
    switch (primitive.v2.type) {
        case "integer":
            return {
                v1: primitive.v1,
                v2: IrVersions.V62.types.PrimitiveTypeV2.integer({
                    default: primitive.v2.default,
                    validation: primitive.v2.validation
                })
            };
        case "long":
            return {
                v1: primitive.v1,
                v2: IrVersions.V62.types.PrimitiveTypeV2.long({
                    default: primitive.v2.default
                })
            };
        case "uint":
            return {
                v1: primitive.v1,
                v2: IrVersions.V62.types.PrimitiveTypeV2.uint({})
            };
        case "uint64":
            return {
                v1: primitive.v1,
                v2: IrVersions.V62.types.PrimitiveTypeV2.uint64({})
            };
        case "float":
            return {
                v1: primitive.v1,
                v2: IrVersions.V62.types.PrimitiveTypeV2.float({})
            };
        case "double":
            return {
                v1: primitive.v1,
                v2: IrVersions.V62.types.PrimitiveTypeV2.double({
                    default: primitive.v2.default,
                    validation: primitive.v2.validation
                })
            };
        case "string":
            return {
                v1: primitive.v1,
                v2: IrVersions.V62.types.PrimitiveTypeV2.string({
                    default: primitive.v2.default,
                    validation: primitive.v2.validation
                })
            };
        case "boolean":
            return {
                v1: primitive.v1,
                v2: IrVersions.V62.types.PrimitiveTypeV2.boolean(primitive.v2)
            };
        case "date":
            return {
                v1: primitive.v1,
                v2: IrVersions.V62.types.PrimitiveTypeV2.date({})
            };
        case "dateTime":
            return {
                v1: primitive.v1,
                v2: IrVersions.V62.types.PrimitiveTypeV2.dateTime({})
            };
        case "uuid":
            return {
                v1: primitive.v1,
                v2: IrVersions.V62.types.PrimitiveTypeV2.uuid({})
            };
        case "base64":
            return {
                v1: primitive.v1,
                v2: IrVersions.V62.types.PrimitiveTypeV2.base64({})
            };
        case "bigInteger":
            return {
                v1: primitive.v1,
                v2: IrVersions.V62.types.PrimitiveTypeV2.bigInteger({ default: undefined })
            };
        default:
            return { v1: primitive.v1, v2: undefined };
    }
}

function convertHttpService(service: IrVersions.V63.HttpService): IrVersions.V62.http.HttpService {
    return {
        ...service,
        pathParameters: service.pathParameters.map((p) => convertPathParameter(p)),
        headers: service.headers.map((h) => convertHttpHeader(h)),
        endpoints: service.endpoints.map((e) => convertHttpEndpoint(e))
    };
}

function convertHttpEndpoint(endpoint: IrVersions.V63.HttpEndpoint): IrVersions.V62.http.HttpEndpoint {
    return {
        ...endpoint,
        allPathParameters: endpoint.allPathParameters.map((p) => convertPathParameter(p)),
        pathParameters: endpoint.pathParameters.map((p) => convertPathParameter(p)),
        headers: endpoint.headers.map((h) => convertHttpHeader(h)),
        queryParameters: endpoint.queryParameters.map((q) => convertQueryParameter(q)),
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
        // Pagination contains TypeReferences that need conversion, but since skipValidation is true
        // in the serializer, we can pass it through with a type assertion
        pagination: endpoint.pagination as unknown as IrVersions.V62.http.Pagination | undefined,
        // UserSpecifiedExamples contain TypeReferences that need conversion, but since skipValidation is true
        // in the serializer, we can pass them through with a type assertion
        userSpecifiedExamples:
            endpoint.userSpecifiedExamples as unknown as IrVersions.V62.http.UserSpecifiedEndpointExample[],
        // AutogeneratedExamples contain TypeReferences that need conversion, but since skipValidation is true
        // in the serializer, we can pass them through with a type assertion
        autogeneratedExamples:
            endpoint.autogeneratedExamples as unknown as IrVersions.V62.http.AutogeneratedEndpointExample[]
    };
}

function convertHttpHeader(header: IrVersions.V63.HttpHeader): IrVersions.V62.http.HttpHeader {
    return {
        ...header,
        valueType: convertTypeReference(header.valueType)
    };
}

function convertPathParameter(pathParameter: IrVersions.V63.PathParameter): IrVersions.V62.http.PathParameter {
    return {
        ...pathParameter,
        valueType: convertTypeReference(pathParameter.valueType)
    };
}

function convertQueryParameter(queryParameter: IrVersions.V63.QueryParameter): IrVersions.V62.http.QueryParameter {
    return {
        ...queryParameter,
        valueType: convertTypeReference(queryParameter.valueType)
    };
}

function convertVariable(variable: IrVersions.V63.VariableDeclaration): IrVersions.V62.VariableDeclaration {
    return {
        ...variable,
        type: convertTypeReference(variable.type)
    };
}

function convertRequestBody(requestBody: IrVersions.V63.HttpRequestBody): IrVersions.V62.http.HttpRequestBody {
    switch (requestBody.type) {
        case "inlinedRequestBody":
            return IrVersions.V62.http.HttpRequestBody.inlinedRequestBody({
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
            return IrVersions.V62.http.HttpRequestBody.reference({
                ...requestBody,
                requestBodyType: convertTypeReference(requestBody.requestBodyType)
            });
        case "fileUpload":
            return IrVersions.V62.http.HttpRequestBody.fileUpload({
                ...requestBody,
                properties: requestBody.properties.map((prop) => convertFileUploadRequestProperty(prop))
            });
        case "bytes":
            return IrVersions.V62.http.HttpRequestBody.bytes(requestBody);
    }
}

function convertFileUploadRequestProperty(
    prop: IrVersions.V63.FileUploadRequestProperty
): IrVersions.V62.http.FileUploadRequestProperty {
    switch (prop.type) {
        case "file":
            return IrVersions.V62.http.FileUploadRequestProperty.file(convertFileProperty(prop.value));
        case "bodyProperty":
            return IrVersions.V62.http.FileUploadRequestProperty.bodyProperty({
                ...prop,
                valueType: convertTypeReference(prop.valueType)
            });
    }
}

function convertFileProperty(fileProperty: IrVersions.V63.FileProperty): IrVersions.V62.http.FileProperty {
    switch (fileProperty.type) {
        case "file":
            return IrVersions.V62.http.FileProperty.file(fileProperty);
        case "fileArray":
            return IrVersions.V62.http.FileProperty.fileArray(fileProperty);
    }
}

function convertSdkRequest(sdkRequest: IrVersions.V63.SdkRequest): IrVersions.V62.http.SdkRequest {
    return {
        ...sdkRequest,
        shape: convertSdkRequestShape(sdkRequest.shape),
        streamParameter:
            sdkRequest.streamParameter != null ? convertRequestProperty(sdkRequest.streamParameter) : undefined
    };
}

function convertRequestProperty(requestProperty: IrVersions.V63.RequestProperty): IrVersions.V62.http.RequestProperty {
    return {
        ...requestProperty,
        property: convertRequestPropertyValue(requestProperty.property),
        // PropertyPath contains TypeReferences that need conversion, but since skipValidation is true
        // in the serializer, we can pass it through with a type assertion
        propertyPath: requestProperty.propertyPath as unknown as IrVersions.V62.http.PropertyPathItem[] | undefined
    };
}

function convertRequestPropertyValue(
    requestPropertyValue: IrVersions.V63.RequestPropertyValue
): IrVersions.V62.http.RequestPropertyValue {
    switch (requestPropertyValue.type) {
        case "query":
            return IrVersions.V62.RequestPropertyValue.query(convertQueryParameter(requestPropertyValue));
        case "body":
            return IrVersions.V62.RequestPropertyValue.body({
                ...requestPropertyValue,
                valueType: convertTypeReference(requestPropertyValue.valueType)
            });
    }
}

function convertSdkRequestShape(shape: IrVersions.V63.SdkRequestShape): IrVersions.V62.http.SdkRequestShape {
    switch (shape.type) {
        case "justRequestBody":
            return IrVersions.V62.http.SdkRequestShape.justRequestBody(convertSdkRequestBodyType(shape));
        case "wrapper":
            return IrVersions.V62.http.SdkRequestShape.wrapper(shape);
    }
}

function convertSdkRequestBodyType(
    bodyType: IrVersions.V63.SdkRequestShape.JustRequestBody
): IrVersions.V62.http.SdkRequestBodyType {
    switch (bodyType.value.type) {
        case "typeReference":
            return IrVersions.V62.http.SdkRequestBodyType.typeReference({
                ...bodyType.value,
                requestBodyType: convertTypeReference(bodyType.value.requestBodyType)
            });
        case "bytes":
            return IrVersions.V62.http.SdkRequestBodyType.bytes(bodyType.value);
    }
}

function convertHttpResponse(response: IrVersions.V63.HttpResponse): IrVersions.V62.http.HttpResponse {
    return {
        ...response,
        body: response.body != null ? convertHttpResponseBody(response.body) : undefined
    };
}

function convertHttpResponseBody(body: IrVersions.V63.HttpResponseBody): IrVersions.V62.http.HttpResponseBody {
    switch (body.type) {
        case "json":
            return IrVersions.V62.http.HttpResponseBody.json(convertJsonResponse(body.value));
        case "fileDownload":
            return IrVersions.V62.http.HttpResponseBody.fileDownload(body);
        case "text":
            return IrVersions.V62.http.HttpResponseBody.text(body);
        case "bytes":
            return IrVersions.V62.http.HttpResponseBody.bytes(body);
        case "streaming":
            return IrVersions.V62.http.HttpResponseBody.streaming(convertStreamingResponse(body.value));
        case "streamParameter":
            return IrVersions.V62.http.HttpResponseBody.streamParameter({
                ...body,
                nonStreamResponse: convertNonStreamHttpResponseBody(body.nonStreamResponse),
                streamResponse: convertStreamingResponse(body.streamResponse)
            });
    }
}

function convertJsonResponse(json: IrVersions.V63.JsonResponse): IrVersions.V62.http.JsonResponse {
    switch (json.type) {
        case "response":
            return IrVersions.V62.http.JsonResponse.response({
                ...json,
                responseBodyType: convertTypeReference(json.responseBodyType)
            });
        case "nestedPropertyAsResponse":
            return IrVersions.V62.http.JsonResponse.nestedPropertyAsResponse({
                ...json,
                responseBodyType: convertTypeReference(json.responseBodyType),
                responseProperty:
                    json.responseProperty != null
                        ? {
                              ...json.responseProperty,
                              valueType: convertTypeReference(json.responseProperty.valueType)
                          }
                        : undefined
            });
    }
}

function convertStreamingResponse(streaming: IrVersions.V63.StreamingResponse): IrVersions.V62.http.StreamingResponse {
    switch (streaming.type) {
        case "json":
            return IrVersions.V62.http.StreamingResponse.json({
                ...streaming,
                payload: convertTypeReference(streaming.payload)
            });
        case "text":
            return IrVersions.V62.http.StreamingResponse.text(streaming);
        case "sse":
            return IrVersions.V62.http.StreamingResponse.sse({
                ...streaming,
                payload: convertTypeReference(streaming.payload)
            });
    }
}

function convertNonStreamHttpResponseBody(
    body: IrVersions.V63.NonStreamHttpResponseBody
): IrVersions.V62.http.NonStreamHttpResponseBody {
    switch (body.type) {
        case "json":
            return IrVersions.V62.http.NonStreamHttpResponseBody.json(
                IrVersions.V62.http.JsonResponse.response({
                    responseBodyType: convertTypeReference(body.value.responseBodyType),
                    docs: body.value.docs,
                    v2Examples: body.value.v2Examples
                })
            );
        case "fileDownload":
            return IrVersions.V62.http.NonStreamHttpResponseBody.fileDownload(body);
        case "text":
            return IrVersions.V62.http.NonStreamHttpResponseBody.text(body);
        case "bytes":
            return IrVersions.V62.http.NonStreamHttpResponseBody.bytes(body);
    }
}

function convertErrorDeclaration(error: IrVersions.V63.ErrorDeclaration): IrVersions.V62.errors.ErrorDeclaration {
    return {
        ...error,
        type: error.type != null ? convertTypeReference(error.type) : undefined,
        // Headers contain TypeReferences that need conversion, but since skipValidation is true
        // in the serializer, we can pass them through with a type assertion
        headers: error.headers as unknown as IrVersions.V62.http.HttpHeader[] | undefined,
        // Examples contain TypeReferences that need conversion, but since skipValidation is true
        // in the serializer, we can pass them through with a type assertion
        examples: error.examples as unknown as IrVersions.V62.errors.ExampleError[]
    };
}

function convertWebhookGroup(webhookGroup: IrVersions.V63.WebhookGroup): IrVersions.V62.webhooks.WebhookGroup {
    return webhookGroup.map((webhook) => convertWebhook(webhook));
}

function convertWebhook(webhook: IrVersions.V63.Webhook): IrVersions.V62.webhooks.Webhook {
    return {
        ...webhook,
        headers: webhook.headers.map((h) => convertHttpHeader(h)),
        payload: convertWebhookPayload(webhook.payload),
        // Responses contain TypeReferences that need conversion, but since skipValidation is true
        // in the serializer, we can pass them through with a type assertion
        responses: webhook.responses as unknown as IrVersions.V62.http.HttpResponse[] | undefined,
        // Examples contain TypeReferences that need conversion, but since skipValidation is true
        // in the serializer, we can pass them through with a type assertion
        examples: webhook.examples as unknown as IrVersions.V62.webhooks.ExampleWebhookCall[] | undefined
    };
}

function convertWebhookPayload(payload: IrVersions.V63.WebhookPayload): IrVersions.V62.webhooks.WebhookPayload {
    switch (payload.type) {
        case "inlinedPayload":
            return IrVersions.V62.webhooks.WebhookPayload.inlinedPayload({
                ...payload,
                properties: payload.properties.map((prop) => ({
                    ...prop,
                    valueType: convertTypeReference(prop.valueType)
                }))
            });
        case "reference":
            return IrVersions.V62.webhooks.WebhookPayload.reference({
                ...payload,
                payloadType: convertTypeReference(payload.payloadType)
            });
        case "fileUpload":
            return IrVersions.V62.webhooks.WebhookPayload.inlinedPayload({
                name: payload.name,
                extends: [],
                properties: payload.properties
                    .filter(
                        (prop): prop is IrVersions.V63.FileUploadRequestProperty.BodyProperty =>
                            prop.type === "bodyProperty"
                    )
                    .map((prop) => ({
                        docs: prop.docs,
                        availability: prop.availability,
                        name: prop.name,
                        valueType: convertTypeReference(prop.valueType)
                    }))
            });
    }
}

function convertWebsocketChannel(channel: IrVersions.V63.WebSocketChannel): IrVersions.V62.websocket.WebSocketChannel {
    return {
        ...channel,
        headers: channel.headers.map((h) => convertHttpHeader(h)),
        queryParameters: channel.queryParameters.map((q) => convertQueryParameter(q)),
        pathParameters: channel.pathParameters.map((p) => convertPathParameter(p)),
        messages: channel.messages.map((m) => convertWebsocketMessage(m)),
        // Examples contain TypeReferences that need conversion, but since skipValidation is true
        // in the serializer, we can pass them through with a type assertion
        examples: channel.examples as unknown as IrVersions.V62.websocket.ExampleWebSocketSession[]
    };
}

function convertWebsocketMessage(message: IrVersions.V63.WebSocketMessage): IrVersions.V62.websocket.WebSocketMessage {
    return {
        ...message,
        body: convertWebsocketMessageBody(message.body)
    };
}

function convertWebsocketMessageBody(
    body: IrVersions.V63.WebSocketMessageBody
): IrVersions.V62.websocket.WebSocketMessageBody {
    switch (body.type) {
        case "inlinedBody":
            return IrVersions.V62.websocket.WebSocketMessageBody.inlinedBody({
                ...body,
                properties: body.properties.map((prop) => ({
                    ...prop,
                    valueType: convertTypeReference(prop.valueType)
                }))
            });
        case "reference":
            return IrVersions.V62.websocket.WebSocketMessageBody.reference({
                ...body,
                bodyType: convertTypeReference(body.bodyType)
            });
    }
}
