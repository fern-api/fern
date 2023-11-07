import { assertNever } from "@fern-api/core-utils";
import { EndpointWithExample } from "@fern-fern/openapi-ir-model/parseIr";
import { OpenAPIV3 } from "openapi-types";
import { AbstractOpenAPIV3ParserContext } from "../../AbstractOpenAPIV3ParserContext";
import { FernOpenAPIExtension } from "../../extensions/fernExtensions";
import { FernStreamingExtension, StreamConditionEndpoint } from "../../extensions/getFernStreamingExtension";
import { setExtension } from "../../extensions/setExtension";
import { isReferenceObject } from "../../utils/isReferenceObject";
import { OperationContext } from "../contexts";
import { convertHttpOperation } from "./convertHttpOperation";

export interface StreamingEndpoints {
    streaming: EndpointWithExample;
    nonStreaming: EndpointWithExample | undefined;
}

export function convertStreamingOperation({
    operationContext,
    context,
    streamingExtension,
}: {
    operationContext: OperationContext;
    context: AbstractOpenAPIV3ParserContext;
    streamingExtension: FernStreamingExtension;
}): StreamingEndpoints | undefined {
    switch (streamingExtension.type) {
        case "stream": {
            const streamingOperation = convertHttpOperation({
                operationContext,
                context,
                streamingResponse: true,
            });
            return {
                streaming: streamingOperation,
                nonStreaming: undefined,
            };
        }
        case "streamCondition": {
            const streamingOperation = convertHttpOperation({
                operationContext: {
                    ...operationContext,
                    operation: {
                        ...operationContext.operation,
                        requestBody: convertRequestBodyToInlinedRequest({
                            context,
                            requestBody: operationContext.operation.requestBody,
                            streamCondition: streamingExtension,
                            isStreaming: true,
                        }),
                    },
                    baseBreadcrumbs: [...operationContext.baseBreadcrumbs, "stream"],
                },
                context,
                streamingResponse: true,
                suffix: "stream",
            });
            const nonStreamingOperation = convertHttpOperation({
                operationContext: {
                    ...operationContext,
                    operation: {
                        ...operationContext.operation,
                        requestBody: convertRequestBodyToInlinedRequest({
                            context,
                            requestBody: operationContext.operation.requestBody,
                            streamCondition: streamingExtension,
                            isStreaming: false,
                        }),
                    },
                },
                context,
            });
            return {
                streaming: streamingOperation,
                nonStreaming: nonStreamingOperation,
            };
        }
        default:
            assertNever(streamingExtension);
    }
}

function convertRequestBodyToInlinedRequest({
    context,
    requestBody,
    streamCondition,
    isStreaming,
}: {
    context: AbstractOpenAPIV3ParserContext;
    requestBody?: OpenAPIV3.ReferenceObject | OpenAPIV3.RequestBodyObject;
    streamCondition: StreamConditionEndpoint;
    isStreaming: boolean;
}): OpenAPIV3.RequestBodyObject {
    if (requestBody === undefined) {
        return {
            content: {
                "application/json": {
                    schema: newSchemaObjectWithBooleanLiteralProperty({
                        propertyName: streamCondition.streamConditionProperty,
                        propertyValue: isStreaming,
                    }),
                },
            },
        };
    }
    if (isReferenceObject(requestBody)) {
        const requestBodyObject = context.resolveRequestBodyReference(requestBody);
        return addStreamConditionPropertyToRequestBody({
            context,
            requestBodyObject,
            streamCondition,
            isStreaming,
        });
    }
    return addStreamConditionPropertyToRequestBody({
        context,
        requestBodyObject: requestBody,
        streamCondition,
        isStreaming,
    });
}

function addStreamConditionPropertyToRequestBody({
    context,
    requestBodyObject,
    streamCondition,
    isStreaming,
}: {
    context: AbstractOpenAPIV3ParserContext;
    requestBodyObject: OpenAPIV3.RequestBodyObject;
    streamCondition: StreamConditionEndpoint;
    isStreaming: boolean;
}): OpenAPIV3.RequestBodyObject {
    return {
        ...requestBodyObject,
        content: Object.fromEntries(
            Object.entries(requestBodyObject.content).map(([contentType, mediaTypeObject]) => [
                contentType,
                {
                    ...mediaTypeObject,
                    schema: addStreamConditionPropertyToObject({
                        context,
                        object: mediaTypeObject.schema,
                        streamCondition,
                        isStreaming,
                    }),
                },
            ])
        ),
    };
}

function addStreamConditionPropertyToObject({
    context,
    object,
    streamCondition,
    isStreaming,
}: {
    context: AbstractOpenAPIV3ParserContext;
    object: OpenAPIV3.ReferenceObject | OpenAPIV3.SchemaObject | undefined;
    streamCondition: StreamConditionEndpoint;
    isStreaming: boolean;
}): OpenAPIV3.SchemaObject {
    if (object === undefined) {
        return newSchemaObjectWithBooleanLiteralProperty({
            propertyName: streamCondition.streamConditionProperty,
            propertyValue: isStreaming,
        });
    }
    if (isReferenceObject(object)) {
        const schemaObject = context.resolveSchemaReference(object);
        return addStreamConditionPropertyToSchemaObject({
            schemaObject,
            streamCondition,
            isStreaming,
        });
    }
    return addStreamConditionPropertyToSchemaObject({
        schemaObject: object,
        streamCondition,
        isStreaming,
    });
}

function addStreamConditionPropertyToSchemaObject({
    schemaObject,
    streamCondition,
    isStreaming,
}: {
    schemaObject: OpenAPIV3.SchemaObject;
    streamCondition: StreamConditionEndpoint;
    isStreaming: boolean;
}): OpenAPIV3.SchemaObject {
    if (schemaObject.type === "object") {
        const properties = schemaObject.properties ?? {};
        properties[streamCondition.streamConditionProperty] = newBooleanLiteralProperty(isStreaming);
        return {
            ...schemaObject,
            properties,
        };
    }
    // If the schema object isn't an object, there's nothing we can do.
    return schemaObject;
}

function newSchemaObjectWithBooleanLiteralProperty({
    propertyName,
    propertyValue,
}: {
    propertyName: string;
    propertyValue: boolean;
}): OpenAPIV3.SchemaObject {
    return {
        type: "object",
        properties: {
            [propertyName]: newBooleanLiteralProperty(propertyValue),
        },
    };
}

function newBooleanLiteralProperty(value: boolean): OpenAPIV3.SchemaObject {
    const schemaObject = {
        type: "boolean",
    };
    return setExtension(schemaObject, FernOpenAPIExtension.BOOLEAN_LITERAL, value);
}
