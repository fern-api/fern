import { FernIr } from "@fern-api/ir-sdk";

const stableStatuses: FernIr.AvailabilityStatus[] = [FernIr.AvailabilityStatus.GeneralAvailability];

export function isMarkedUnstable(availability: FernIr.Availability | undefined): boolean {
    return availability !== undefined && !stableStatuses.includes(availability.status);
}

export function getStableTypeIdsFromIr(ir: FernIr.IntermediateRepresentation): Set<FernIr.TypeId> {
    let stableTypes = new Set<FernIr.TypeId>();
    ir.headers.forEach((header) => {
        stableTypes = stableTypes.union(getStableTypeIdsFromHeader(header));
    });
    ir.idempotencyHeaders.forEach((header) => {
        stableTypes = stableTypes.union(getStableTypeIdsFromHeader(header));
    });
    Object.values(ir.services).forEach((service) => {
        stableTypes = stableTypes.union(getStableTypeIdsFromService(service));
    });
    Object.values(ir.webhookGroups).forEach((webhookGroup) => {
        stableTypes = stableTypes.union(getStableTypeIdsFromWebhookGroup(webhookGroup));
    });
    Object.values(ir.websocketChannels ?? {}).forEach((websocketChannel) => {
        stableTypes = stableTypes.union(getStableTypeIdsFromWebsocketChannel(websocketChannel));
    });
    Object.values(ir.subpackages).forEach((subpackage) => {
        stableTypes = stableTypes.union(getStableTypeIdsFromSubpackage(subpackage));
    });

    return stableTypes;
}

function getStableTypeIdsFromService(service: FernIr.HttpService): Set<FernIr.TypeId> {
    if (isMarkedUnstable(service.availability)) {
        return new Set<FernIr.TypeId>();
    }
    let stableTypes = new Set<FernIr.TypeId>();
    service.headers.forEach((header) => {
        stableTypes = stableTypes.union(getStableTypeIdsFromHeader(header));
    });
    service.pathParameters.forEach((pathParameter) => {
        stableTypes = stableTypes.union(getStableTypeIdsFromPathParameter(pathParameter));
    });
    service.endpoints.forEach((endpoint) => {
        stableTypes = stableTypes.union(getStableTypeIdsFromEndpoint(endpoint));
    });
    return stableTypes;
}

function getStableTypeIdsFromSubpackage(subpackage: FernIr.Subpackage): Set<FernIr.TypeId> {
    return new Set<FernIr.TypeId>();
}

function getStableTypeIdsFromWebhookGroup(webhookGroup: FernIr.WebhookGroup): Set<FernIr.TypeId> {
    return webhookGroup.reduce((acc, webhook) => {
        return acc.union(getStableTypeIdsFromWebhook(webhook));
    }, new Set<FernIr.TypeId>());
}

function getStableTypeIdsFromWebhook(webhook: FernIr.Webhook): Set<FernIr.TypeId> {
    let stableTypes = new Set<FernIr.TypeId>([webhook.id]);
    webhook.headers.forEach((header) => {
        stableTypes = stableTypes.union(getStableTypeIdsFromHeader(header));
    });
    if (webhook.payload !== undefined) {
        const payloadStableTypes = webhook.payload._visit({
            inlinedPayload: (inlinedPayload) => {
                return getStableTypeIdsFromInlinedPayload(inlinedPayload);
            },
            reference: (reference) => {
                return getStableTypeIdsFromWebhookPayloadReference(reference);
            },
            _other: () => {
                return new Set<FernIr.TypeId>();
            }
        });
        stableTypes = stableTypes.union(payloadStableTypes);
    }
    return stableTypes;
}

function getStableTypeIdsFromInlinedPayload(inlinedPayload: FernIr.InlinedWebhookPayload): Set<FernIr.TypeId> {
    let stableTypes = new Set<FernIr.TypeId>();
    inlinedPayload.extends.forEach((extendsType) => {
        stableTypes = stableTypes.union(getStableTypeIdsFromDeclaredTypeName(extendsType));
    });
    inlinedPayload.properties.forEach((property) => {
        stableTypes = stableTypes.union(getStableTypeIdsFromInlinedWebhookPayloadProperty(property));
    });
    return stableTypes;
}

function getStableTypeIdsFromDeclaredTypeName(declaredTypeName: FernIr.DeclaredTypeName): Set<FernIr.TypeId> {
    return new Set<FernIr.TypeId>([declaredTypeName.typeId]);
}

function getStableTypeIdsFromInlinedWebhookPayloadProperty(
    property: FernIr.InlinedWebhookPayloadProperty
): Set<FernIr.TypeId> {
    return property.valueType._visit({
        container: (container) => {
            return getTypeIdsFromContainer(container);
        },
        named: (named) => {
            return getTypeIdsFromNamed(named);
        },
        primitive: (primitive) => {
            return getTypeIdsFromPrimitive(primitive);
        },
        unknown: () => {
            return new Set<FernIr.TypeId>();
        },
        _other: () => {
            return new Set<FernIr.TypeId>();
        }
    });
}

function getStableTypeIdsFromWebhookPayloadReference(reference: FernIr.WebhookPayloadReference): Set<FernIr.TypeId> {
    return getTypeIdsFromTypeReference(reference.payloadType);
}

function getStableTypeIdsFromPathParameter(pathParameter: FernIr.PathParameter): Set<FernIr.TypeId> {
    return getTypeIdsFromTypeReference(pathParameter.valueType);
}

function getStableTypeIdsFromQueryParameter(queryParameter: FernIr.QueryParameter): Set<FernIr.TypeId> {
    return getTypeIdsFromTypeReference(queryParameter.valueType);
}

function getStableTypeIdsFromWebsocketChannel(websocketChannel: FernIr.WebSocketChannel): Set<FernIr.TypeId> {
    if (isMarkedUnstable(websocketChannel.availability)) {
        return new Set<FernIr.TypeId>();
    }
    let stableTypes = new Set<FernIr.TypeId>();
    websocketChannel.headers.forEach((header) => {
        stableTypes = stableTypes.union(getStableTypeIdsFromHeader(header));
    });
    websocketChannel.queryParameters.forEach((queryParameter) => {
        stableTypes = stableTypes.union(getStableTypeIdsFromQueryParameter(queryParameter));
    });
    websocketChannel.pathParameters.forEach((pathParameter) => {
        stableTypes = stableTypes.union(getStableTypeIdsFromPathParameter(pathParameter));
    });
    websocketChannel.messages.forEach((message) => {
        stableTypes = stableTypes.union(getStableTypeIdsFromWebSocketMessage(message));
    });
    return stableTypes;
}

function getStableTypeIdsFromWebSocketMessage(message: FernIr.WebSocketMessage): Set<FernIr.TypeId> {
    if (isMarkedUnstable(message.availability)) {
        return new Set<FernIr.TypeId>();
    }
    let stableTypes = new Set<FernIr.TypeId>(message.type);
    stableTypes = stableTypes.union(getStableTypesIdsFromWebSocketMessageBody(message.body));
    return stableTypes;
}

function getStableTypesIdsFromWebSocketMessageBody(body: FernIr.WebSocketMessageBody): Set<FernIr.TypeId> {
    return body._visit({
        inlinedBody: (inlined) => {
            return getStableTypeIdsFromInlinedWebSocketMessageBody(inlined);
        },
        reference: (reference) => {
            return getStableTypeIdsFromWebSocketMessageBodyReference(reference);
        },
        _other: () => {
            return new Set<FernIr.TypeId>();
        }
    });
}

function getStableTypeIdsFromInlinedWebSocketMessageBody(
    inlined: FernIr.InlinedWebSocketMessageBody
): Set<FernIr.TypeId> {
    let stableTypes = new Set<FernIr.TypeId>();
    inlined.extends.forEach((extendsType) => {
        stableTypes = stableTypes.union(getStableTypeIdsFromDeclaredTypeName(extendsType));
    });
    inlined.properties.forEach((property) => {
        stableTypes = stableTypes.union(getStableTypeIdsFromInlinedWebSocketMessageBodyProperty(property));
    });
    return stableTypes;
}

function getStableTypeIdsFromInlinedWebSocketMessageBodyProperty(
    property: FernIr.InlinedWebSocketMessageBodyProperty
): Set<FernIr.TypeId> {
    return property.valueType._visit({
        container: (container) => {
            return getTypeIdsFromContainer(container);
        },
        named: (named) => {
            return getTypeIdsFromNamed(named);
        },
        primitive: (primitive) => {
            return getTypeIdsFromPrimitive(primitive);
        },
        unknown: () => {
            return new Set<FernIr.TypeId>();
        },
        _other: () => {
            return new Set<FernIr.TypeId>();
        }
    });
}

function getStableTypeIdsFromWebSocketMessageBodyReference(
    reference: FernIr.WebSocketMessageBodyReference
): Set<FernIr.TypeId> {
    return getTypeIdsFromTypeReference(reference.bodyType);
}

function getStableTypeIdsFromEndpoint(endpoint: FernIr.HttpEndpoint): Set<FernIr.TypeId> {
    if (isMarkedUnstable(endpoint.availability)) {
        return new Set<FernIr.TypeId>();
    }
    let stableTypes = new Set<FernIr.TypeId>();
    endpoint.headers.forEach((header) => {
        stableTypes = stableTypes.union(getStableTypeIdsFromHeader(header));
    });
    endpoint.pathParameters.forEach((pathParameter) => {
        stableTypes = stableTypes.union(getStableTypeIdsFromPathParameter(pathParameter));
    });
    endpoint.queryParameters.forEach((queryParameter) => {
        stableTypes = stableTypes.union(getStableTypeIdsFromQueryParameter(queryParameter));
    });
    if (endpoint.requestBody !== undefined) {
        stableTypes = stableTypes.union(getStableTypeIdsFromRequestBody(endpoint.requestBody));
    }
    if (endpoint.response !== undefined) {
        stableTypes = stableTypes.union(getStableTypeIdsFromResponse(endpoint.response));
    }
    if (endpoint.v2Responses !== undefined) {
        stableTypes = stableTypes.union(getStableTypeIdsFromV2Responses(endpoint.v2Responses));
    }
    if (endpoint.v2RequestBodies !== undefined) {
        stableTypes = stableTypes.union(getStableTypeIdsFromV2RequestBodies(endpoint.v2RequestBodies));
    }

    return stableTypes;
}

function getStableTypeIdsFromRequestBody(requestBody: FernIr.HttpRequestBody): Set<FernIr.TypeId> {
    return requestBody._visit({
        inlinedRequestBody: (inlined) => {
            return getStableTypeIdsFromInlinedRequestBody(inlined);
        },
        reference: (reference) => {
            return getStableTypeIdsFromRequestBodyReference(reference);
        },
        fileUpload: (fileUpload) => {
            return getStableTypeIdsFromFileUpload(fileUpload);
        },
        bytes: (bytes) => {
            return getStableTypeIdsFromBytes(bytes);
        },
        _other: () => {
            return new Set<FernIr.TypeId>();
        }
    });
}

function getStableTypeIdsFromInlinedRequestBody(inlined: FernIr.InlinedRequestBody): Set<FernIr.TypeId> {
    let stableTypes = new Set<FernIr.TypeId>();
    inlined.extends.forEach((extendsType) => {
        stableTypes = stableTypes.union(getStableTypeIdsFromDeclaredTypeName(extendsType));
    });
    inlined.properties.forEach((property) => {
        stableTypes = stableTypes.union(getStableTypeIdsFromInlinedRequestBodyProperty(property));
    });
    return stableTypes;
}

function getStableTypeIdsFromInlinedRequestBodyProperty(
    property: FernIr.InlinedRequestBodyProperty
): Set<FernIr.TypeId> {
    return property.valueType._visit({
        container: (container) => {
            return getTypeIdsFromContainer(container);
        },
        named: (named) => {
            return getTypeIdsFromNamed(named);
        },
        primitive: (primitive) => {
            return getTypeIdsFromPrimitive(primitive);
        },
        unknown: () => {
            return new Set<FernIr.TypeId>();
        },
        _other: () => {
            return new Set<FernIr.TypeId>();
        }
    });
}

function getStableTypeIdsFromRequestBodyReference(reference: FernIr.HttpRequestBodyReference): Set<FernIr.TypeId> {
    return getTypeIdsFromTypeReference(reference.requestBodyType);
}

function getStableTypeIdsFromFileUpload(fileUpload: FernIr.FileUploadRequest): Set<FernIr.TypeId> {
    let stableTypes = new Set<FernIr.TypeId>();
    fileUpload.properties.forEach((property) => {
        stableTypes = stableTypes.union(getStableTypeIdsFromFileUploadRequestProperty(property));
    });
    return stableTypes;
}

function getStableTypeIdsFromFileUploadRequestProperty(property: FernIr.FileUploadRequestProperty): Set<FernIr.TypeId> {
    return property._visit({
        file: (file) => {
            return getTypeIdsFromFileProperty(file);
        },
        bodyProperty: (bodyProperty) => {
            return getTypeIdsFromBodyProperty(bodyProperty);
        },
        _other: () => {
            return new Set<FernIr.TypeId>();
        }
    });
}

function getTypeIdsFromFileProperty(file: FernIr.FileProperty): Set<FernIr.TypeId> {
    throw new Error("Not implemented");
}

function getTypeIdsFromBodyProperty(bodyProperty: FernIr.FileUploadBodyProperty): Set<FernIr.TypeId> {
    throw new Error("Not implemented");
}

function getStableTypeIdsFromBytes(bytes: FernIr.BytesRequest): Set<FernIr.TypeId> {
    return new Set<FernIr.TypeId>();
}

function getStableTypeIdsFromResponse(response: FernIr.HttpResponse): Set<FernIr.TypeId> {
    if (response.body === undefined) {
        return new Set<FernIr.TypeId>();
    }
    return response.body._visit({
        json: (json) => {
            return getStableTypeIdsFromJsonResponse(json);
        },
        fileDownload: (fileDownload) => {
            return getStableTypeIdsFromFileDownloadResponse(fileDownload);
        },
        text: (text) => {
            return getStableTypeIdsFromTextResponse(text);
        },
        bytes: (bytes) => {
            return getStableTypeIdsFromBytesResponse(bytes);
        },
        streaming: (streaming) => {
            return getStableTypeIdsFromStreamingResponse(streaming);
        },
        streamParameter: (streamParameter) => {
            return getStableTypeIdsFromStreamParameterResponse(streamParameter);
        },
        _other: () => {
            return new Set<FernIr.TypeId>();
        }
    });
}

function getStableTypeIdsFromV2Responses(v2Responses: FernIr.V2HttpResponses): Set<FernIr.TypeId> {
    throw new Error("Not implemented");
}

function getStableTypeIdsFromV2RequestBodies(v2RequestBodies: FernIr.V2HttpRequestBodies): Set<FernIr.TypeId> {
    throw new Error("Not implemented");
}

function getStableTypeIdsFromV2Examples(v2Examples: FernIr.V2HttpEndpointExamples): Set<FernIr.TypeId> {
    throw new Error("Not implemented");
}

function getStableTypeIdsFromHeader(header: FernIr.HttpHeader): Set<FernIr.TypeId> {
    if (isMarkedUnstable(header.availability)) {
        return new Set<FernIr.TypeId>();
    }
    return header.valueType._visit({
        container: (container) => {
            return getTypeIdsFromContainer(container);
        },
        named: (named) => {
            return getTypeIdsFromNamed(named);
        },
        primitive: (primitive) => {
            return getTypeIdsFromPrimitive(primitive);
        },
        unknown: () => {
            return new Set<FernIr.TypeId>();
        },
        _other: () => {
            return new Set<FernIr.TypeId>();
        }
    });
}

function getTypeIdsFromContainer(container: FernIr.ContainerType): Set<FernIr.TypeId> {
    return container._visit({
        list: (list) => {
            return getTypeIdsFromTypeReference(list);
        },
        map: (map) => {
            return getTypeIdsFromTypeReference(map.keyType).union(getTypeIdsFromTypeReference(map.valueType));
        },
        nullable: (nullable) => {
            return getTypeIdsFromTypeReference(nullable);
        },
        optional: (optional) => {
            return getTypeIdsFromTypeReference(optional);
        },
        set: (set) => {
            return getTypeIdsFromTypeReference(set);
        },
        literal: (literal) => {
            return new Set([literal.type]);
        },
        _other: () => {
            return new Set<FernIr.TypeId>();
        }
    });
}

function getTypeIdsFromTypeReference(typeReference: FernIr.TypeReference): Set<FernIr.TypeId> {
    return typeReference._visit({
        container: (container) => {
            return getTypeIdsFromContainer(container);
        },
        named: (named) => {
            return getTypeIdsFromNamed(named);
        },
        primitive: (primitive) => {
            return getTypeIdsFromPrimitive(primitive);
        },
        unknown: () => {
            return new Set<FernIr.TypeId>();
        },
        _other: () => {
            return new Set<FernIr.TypeId>();
        }
    });
}

function getTypeIdsFromNamed(named: FernIr.NamedType): Set<FernIr.TypeId> {
    return new Set([named.typeId]);
}

function getTypeIdsFromPrimitive(primitive: FernIr.PrimitiveType): Set<FernIr.TypeId> {
    if (primitive.v2 !== undefined) {
        return new Set([primitive.v2.type]);
    }
    return new Set([primitive.v1]);
}
