import { mapValues } from "lodash-es";

import { GeneratorName } from "@fern-api/configuration-loader";

import { IrSerialization } from "../../ir-serialization";
import { IrVersions } from "../../ir-versions";
import {
    GeneratorWasNeverUpdatedToConsumeNewIR,
    GeneratorWasNotCreatedYet,
    IrMigration
} from "../../types/IrMigration";

export const V51_TO_V50_MIGRATION: IrMigration<
    IrVersions.V51.ir.IntermediateRepresentation,
    IrVersions.V50.ir.IntermediateRepresentation
> = {
    laterVersion: "v51",
    earlierVersion: "v50",
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
        [GeneratorName.CSHARP_SDK]: "0.1.2",
        [GeneratorName.SWIFT_MODEL]: GeneratorWasNeverUpdatedToConsumeNewIR,
        [GeneratorName.SWIFT_SDK]: GeneratorWasNotCreatedYet,
        [GeneratorName.PHP_MODEL]: GeneratorWasNotCreatedYet,
        [GeneratorName.PHP_SDK]: GeneratorWasNotCreatedYet,
        [GeneratorName.RUST_MODEL]: GeneratorWasNotCreatedYet,
        [GeneratorName.RUST_SDK]: GeneratorWasNotCreatedYet
    },
    jsonifyEarlierVersion: (ir) =>
        IrSerialization.V50.IntermediateRepresentation.jsonOrThrow(ir, {
            unrecognizedObjectKeys: "strip",
            skipValidation: true
        }),
    migrateBackwards: (v51): IrVersions.V50.ir.IntermediateRepresentation => {
        const v50Types: Record<string, IrVersions.V50.types.TypeDeclaration> = mapValues(
            v51.types,
            (typeDeclaration) => {
                const autogeneratedExamples = typeDeclaration.autogeneratedExamples.map((example) =>
                    convertExampleType(example)
                );
                const userProvidedExamples = typeDeclaration.userProvidedExamples.map((example) =>
                    convertExampleType(example)
                );
                return {
                    ...typeDeclaration,
                    examples: [...autogeneratedExamples, ...userProvidedExamples]
                };
            }
        );
        return {
            ...v51,
            types: v50Types,
            services: mapValues(v51.services, (service) => convertHttpService(service)),
            errors: mapValues(v51.errors, (error) => convertErrorDeclaration(error)),
            webhookGroups: mapValues(v51.webhookGroups, (webhookGroup) => convertWebhookGroup(webhookGroup)),
            websocketChannels: mapValues(v51.websocketChannels, (websocketChannel) =>
                convertWebsocketChannel(websocketChannel)
            )
        };
    }
};

function convertWebsocketChannel(websocketChannel: IrVersions.V51.WebSocketChannel): IrVersions.V50.WebSocketChannel {
    return {
        ...websocketChannel,
        examples: websocketChannel.examples.map((example) => convertExampleWebsocketSession(example))
    };
}

function convertExampleWebsocketSession(
    example: IrVersions.V51.ExampleWebSocketSession
): IrVersions.V50.ExampleWebSocketSession {
    return {
        ...example,
        pathParameters: example.pathParameters.map((pathParameter) => convertExamplePathParameter(pathParameter)),
        headers: example.headers.map((exampleHeader) => convertExampleHeader(exampleHeader)),
        queryParameters: example.queryParameters.map((exampleQueryParameter) =>
            convertExampleQueryParameter(exampleQueryParameter)
        ),
        messages: example.messages.map((message) => ({
            ...message,
            body: convertExampleWebSocketMessageBody(message.body)
        }))
    };
}

function convertExampleQueryParameter(
    exampleQueryParameter: IrVersions.V51.ExampleQueryParameter
): IrVersions.V50.ExampleQueryParameter {
    return {
        ...exampleQueryParameter,
        value: convertExampleTypeReference(exampleQueryParameter.value)
    };
}

function convertExampleHeader(exampleHeader: IrVersions.V51.ExampleHeader): IrVersions.V50.ExampleHeader {
    return {
        ...exampleHeader,
        value: convertExampleTypeReference(exampleHeader.value)
    };
}

function convertExamplePathParameter(
    pathParameter: IrVersions.V51.ExamplePathParameter
): IrVersions.V50.ExamplePathParameter {
    return {
        ...pathParameter,
        value: convertExampleTypeReference(pathParameter.value)
    };
}

function convertExampleWebSocketMessageBody(
    body: IrVersions.V51.ExampleWebSocketMessageBody
): IrVersions.V50.ExampleWebSocketMessageBody {
    switch (body.type) {
        case "inlinedBody":
            return IrVersions.V50.ExampleWebSocketMessageBody.inlinedBody(convertExampleInlinedRequestBody(body));
        case "reference":
            return IrVersions.V50.ExampleWebSocketMessageBody.reference(convertExampleTypeReference(body));
    }
}

function convertExampleInlinedRequestBody(
    inlinedBody: IrVersions.V51.ExampleInlinedRequestBody
): IrVersions.V50.ExampleInlinedRequestBody {
    return {
        ...inlinedBody,
        properties: inlinedBody.properties.map((property) => ({
            ...property,
            value: convertExampleTypeReference(property.value)
        }))
    };
}

function convertWebhookGroup(webhookGroup: IrVersions.V51.WebhookGroup): IrVersions.V50.WebhookGroup {
    return webhookGroup.map((webhook) => ({
        ...webhook,
        examples: webhook.examples?.map((example) => ({
            ...example,
            payload: convertExampleTypeReference(example.payload)
        }))
    }));
}

function convertExampleType(example: IrVersions.V51.ExampleType): IrVersions.V50.ExampleType {
    return {
        ...example,
        shape: convertExampleTypeShape(example.shape)
    };
}

function convertExampleTypeReferenceShape(
    shape: IrVersions.V51.ExampleTypeReferenceShape
): IrVersions.V50.ExampleTypeReferenceShape {
    switch (shape.type) {
        case "primitive":
            return IrVersions.V50.ExampleTypeReferenceShape.primitive({
                ...shape.primitive
            });
        case "container":
            return IrVersions.V50.ExampleTypeReferenceShape.container(convertExampleContainerTypeReferenceShape(shape));
        case "unknown":
            return IrVersions.V50.ExampleTypeReferenceShape.unknown(shape.unknown);
        case "named":
            return IrVersions.V50.ExampleTypeReferenceShape.named({
                ...shape,
                typeName: shape.typeName,
                shape: convertExampleTypeShape(shape.shape)
            });
    }
}

function convertExampleContainerTypeReferenceShape(
    shape: IrVersions.V51.ExampleTypeReferenceShape.Container
): IrVersions.V50.ExampleContainer {
    switch (shape.container.type) {
        case "list":
            return IrVersions.V50.ExampleContainer.list(
                shape.container.list.map((exampleTypeReference) => convertExampleTypeReference(exampleTypeReference))
            );
        case "set":
            return IrVersions.V50.ExampleContainer.set(
                shape.container.set.map((exampleTypeReference) => convertExampleTypeReference(exampleTypeReference))
            );
        case "optional":
            return IrVersions.V50.ExampleContainer.optional(
                shape.container.optional != null ? convertExampleTypeReference(shape.container.optional) : undefined
            );
        case "map":
            return IrVersions.V50.ExampleContainer.map(
                shape.container.map.map((exampleKeyValuePair) => ({
                    key: convertExampleTypeReference(exampleKeyValuePair.key),
                    value: convertExampleTypeReference(exampleKeyValuePair.value)
                }))
            );
        case "literal":
            return IrVersions.V50.ExampleContainer.literal(shape.container.literal);
    }
}

function convertExampleTypeReference(
    exampleTypeReference: IrVersions.V51.ExampleTypeReference
): IrVersions.V50.ExampleTypeReference {
    return {
        ...exampleTypeReference,
        shape: convertExampleTypeReferenceShape(exampleTypeReference.shape)
    };
}

function convertExampleTypeShape(shape: IrVersions.V51.ExampleTypeShape): IrVersions.V50.ExampleTypeShape {
    switch (shape.type) {
        case "object":
            return IrVersions.V50.ExampleTypeShape.object({
                properties: shape.properties.map((property) => convertExampleObjectProperty(property))
            });
        case "alias":
            return IrVersions.V50.ExampleTypeShape.alias({
                value: { ...convertExampleTypeReference(shape.value) }
            });
        case "enum":
            return IrVersions.V50.ExampleTypeShape.enum(shape);
        case "union":
            return IrVersions.V50.ExampleTypeShape.union(convertUnionExampleTypeShape(shape));
        case "undiscriminatedUnion":
            return IrVersions.V50.ExampleTypeShape.undiscriminatedUnion(
                convertUndiscriminatedUnionExampleTypeShape(shape)
            );
    }
}

function convertUndiscriminatedUnionExampleTypeShape(
    shape: IrVersions.V51.ExampleTypeShape.UndiscriminatedUnion
): IrVersions.V50.ExampleUndiscriminatedUnionType {
    return {
        ...shape,
        singleUnionType: convertExampleTypeReference(shape.singleUnionType)
    };
}

function convertUnionExampleTypeShape(shape: IrVersions.V51.ExampleTypeShape.Union): IrVersions.V50.ExampleUnionType {
    return {
        ...shape,
        singleUnionType: convertExampleSingleUnionType(shape.singleUnionType)
    };
}

function convertExampleSingleUnionType(
    singleUnionType: IrVersions.V51.ExampleSingleUnionType
): IrVersions.V50.ExampleSingleUnionType {
    return {
        ...singleUnionType,
        shape: convertExampleSingleUnionTypeProperties(singleUnionType.shape)
    };
}

function convertExampleSingleUnionTypeProperties(
    exampleSingleUnionTypeProperties: IrVersions.V51.ExampleSingleUnionTypeProperties
): IrVersions.V50.ExampleSingleUnionTypeProperties {
    switch (exampleSingleUnionTypeProperties.type) {
        case "samePropertiesAsObject":
            return IrVersions.V50.ExampleSingleUnionTypeProperties.samePropertiesAsObject({
                ...exampleSingleUnionTypeProperties,
                object: convertExampleObjectType(exampleSingleUnionTypeProperties.object)
            });
        case "singleProperty":
            return IrVersions.V50.ExampleSingleUnionTypeProperties.singleProperty({
                ...exampleSingleUnionTypeProperties,
                shape: convertExampleTypeReferenceShape(exampleSingleUnionTypeProperties.shape)
            });
        case "noProperties":
            return IrVersions.V50.ExampleSingleUnionTypeProperties.noProperties();
    }
}

function convertExampleObjectType(object: IrVersions.V51.ExampleObjectType): IrVersions.V50.ExampleObjectType {
    return {
        ...object,
        properties: object.properties.map((property) => convertExampleObjectProperty(property))
    };
}

function convertExampleObjectProperty(
    property: IrVersions.V51.ExampleObjectProperty
): IrVersions.V50.ExampleObjectProperty {
    return {
        ...property,
        value: {
            ...property.value,
            shape: convertExampleTypeReferenceShape(property.value.shape)
        }
    };
}

function convertHttpService(service: IrVersions.V51.http.HttpService): IrVersions.V50.http.HttpService {
    return {
        ...service,
        endpoints: service.endpoints.map((endpoint) => convertEndpoint(endpoint))
    };
}

function convertEndpoint(endpoint: IrVersions.V51.http.HttpEndpoint): IrVersions.V50.http.HttpEndpoint {
    return {
        ...endpoint,
        autogeneratedExamples: endpoint.autogeneratedExamples.map((autogeneratedExample) => ({
            ...autogeneratedExample,
            example: convertExampleEndpointCall(autogeneratedExample.example)
        })),
        userSpecifiedExamples: endpoint.userSpecifiedExamples.map((userSpecifiedExample) => ({
            ...userSpecifiedExample,
            example:
                userSpecifiedExample.example != null
                    ? convertExampleEndpointCall(userSpecifiedExample.example)
                    : undefined
        }))
    };
}

function convertExampleEndpointCall(example: IrVersions.V51.ExampleEndpointCall): IrVersions.V50.ExampleEndpointCall {
    return {
        ...example,
        rootPathParameters: example.rootPathParameters.map((examplePathParameter) =>
            convertExamplePathParameter(examplePathParameter)
        ),
        servicePathParameters: example.servicePathParameters.map((examplePathParameter) =>
            convertExamplePathParameter(examplePathParameter)
        ),
        endpointPathParameters: example.endpointPathParameters.map((examplePathParameter) =>
            convertExamplePathParameter(examplePathParameter)
        ),
        serviceHeaders: example.serviceHeaders.map((exampleHeader) => convertExampleHeader(exampleHeader)),
        endpointHeaders: example.endpointHeaders.map((exampleHeader) => convertExampleHeader(exampleHeader)),
        queryParameters: example.queryParameters.map((exampleQueryParameter) =>
            convertExampleQueryParameter(exampleQueryParameter)
        ),
        request: example.request != null ? convertExampleRequest(example.request) : undefined,
        response: convertExampleResponse(example.response)
    };
}

function convertExampleResponse(response: IrVersions.V51.ExampleResponse): IrVersions.V50.ExampleResponse {
    switch (response.type) {
        case "error":
            return IrVersions.V50.ExampleResponse.error({
                ...response,
                body: response.body != null ? convertExampleTypeReference(response.body) : undefined
            });
        case "ok":
            return IrVersions.V50.ExampleResponse.ok(convertExampleEndpointSuccessResponse(response));
    }
}

function convertExampleEndpointSuccessResponse(
    response: IrVersions.V51.ExampleResponse.Ok
): IrVersions.V50.ExampleEndpointSuccessResponse {
    switch (response.value.type) {
        case "body":
            return IrVersions.V50.ExampleEndpointSuccessResponse.body(
                response.value.value != null ? convertExampleTypeReference(response.value.value) : undefined
            );
        case "stream":
            return IrVersions.V50.ExampleEndpointSuccessResponse.stream(
                response.value.value.map((exampleTypeReference) => convertExampleTypeReference(exampleTypeReference))
            );
        case "sse":
            return IrVersions.V50.ExampleEndpointSuccessResponse.sse(
                response.value.value.map((exampleServerSideEvent) => ({
                    ...exampleServerSideEvent,
                    data: convertExampleTypeReference(exampleServerSideEvent.data)
                }))
            );
    }
}

function convertExampleRequest(request: IrVersions.V51.ExampleRequestBody): IrVersions.V50.ExampleRequestBody {
    switch (request.type) {
        case "inlinedRequestBody":
            return IrVersions.V50.ExampleRequestBody.inlinedRequestBody(convertExampleInlinedRequestBody(request));
        case "reference":
            return IrVersions.V50.ExampleRequestBody.reference(convertExampleTypeReference(request));
    }
}

function convertErrorDeclaration(
    error: IrVersions.V51.errors.ErrorDeclaration
): IrVersions.V50.errors.ErrorDeclaration {
    return {
        ...error,
        examples: error.examples.map((example) => ({
            ...example,
            shape: convertExampleTypeReference(example.shape)
        }))
    };
}
