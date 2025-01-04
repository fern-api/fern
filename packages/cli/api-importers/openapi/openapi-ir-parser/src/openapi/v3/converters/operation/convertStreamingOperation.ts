import { OpenAPIV3 } from "openapi-types";

import { MediaType, assertNever } from "@fern-api/core-utils";
import { RawSchemas } from "@fern-api/fern-definition-schema";
import { EndpointExample, EndpointWithExample } from "@fern-api/openapi-ir";

import { getSchemaIdFromReference } from "../../../../schema/convertSchemas";
import { isReferenceObject } from "../../../../schema/utils/isReferenceObject";
import { AbstractOpenAPIV3ParserContext } from "../../AbstractOpenAPIV3ParserContext";
import { FernStreamingExtension, StreamConditionEndpoint } from "../../extensions/getFernStreamingExtension";
import { OperationContext } from "../contexts";
import { getApplicationJsonSchemaMediaObject } from "../endpoint/getApplicationJsonSchema";
import { convertHttpOperation } from "./convertHttpOperation";

const STREAM_SUFFIX = "stream";

export interface StreamingEndpoints {
    streaming: EndpointWithExample;
    nonStreaming: EndpointWithExample | undefined;
}

export function convertStreamingOperation({
    operationContext,
    context,
    streamingExtension
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
                streamFormat: streamingExtension.format,
                source: context.source
            });
            return {
                streaming: streamingOperation,
                nonStreaming: undefined
            };
        }
        case "streamCondition": {
            const streamingRequestBody = getRequestBody({
                context,
                operation: operationContext.operation,
                streamingExtension,
                isStreaming: true
            });
            if (streamingRequestBody?.schemaReference != null) {
                const schemaId = getSchemaIdFromReference(streamingRequestBody.schemaReference);
                if (schemaId != null) {
                    context.excludeSchema(schemaId);
                }
            }
            const streamingResponses = getResponses({
                operation: operationContext.operation,
                response: streamingExtension.responseStream
            });
            const streamingOperation = convertHttpOperation({
                operationContext: {
                    ...operationContext,
                    sdkMethodName:
                        operationContext.sdkMethodName != null
                            ? {
                                  groupName: operationContext.sdkMethodName.groupName,
                                  methodName: operationContext.sdkMethodName.methodName + "_" + STREAM_SUFFIX
                              }
                            : undefined,
                    operation: {
                        ...operationContext.operation,
                        description: streamingExtension.streamDescription ?? operationContext.operation.description,
                        requestBody: streamingRequestBody?.requestBody,
                        responses: streamingResponses
                    },
                    baseBreadcrumbs: [...operationContext.baseBreadcrumbs, STREAM_SUFFIX]
                },
                context,
                streamFormat: streamingExtension.format,
                suffix: STREAM_SUFFIX,
                source: context.source
            });
            streamingOperation.examples = streamingOperation.examples.filter(
                (example) => isStreamingExample(example, context) !== false
            );

            const nonStreamingRequestBody = getRequestBody({
                context,
                operation: operationContext.operation,
                streamingExtension,
                isStreaming: false
            });
            const nonStreamingResponses = getResponses({
                operation: operationContext.operation,
                response: streamingExtension.response
            });
            const nonStreamingOperation = convertHttpOperation({
                streamFormat: undefined,
                operationContext: {
                    ...operationContext,
                    operation: {
                        ...operationContext.operation,
                        requestBody: nonStreamingRequestBody?.requestBody,
                        responses: nonStreamingResponses
                    }
                },
                context,
                source: context.source
            });
            nonStreamingOperation.examples = nonStreamingOperation.examples.filter(
                (example) => isStreamingExample(example, context) !== true
            );

            return {
                streaming: streamingOperation,
                nonStreaming: nonStreamingOperation
            };
        }
        default:
            assertNever(streamingExtension);
    }
}

interface RequestBody {
    requestBody: OpenAPIV3.RequestBodyObject;
    schemaReference: OpenAPIV3.ReferenceObject | undefined;
}

function getRequestBody({
    context,
    operation,
    streamingExtension,
    isStreaming
}: {
    context: AbstractOpenAPIV3ParserContext;
    operation: OpenAPIV3.OperationObject;
    streamingExtension: StreamConditionEndpoint;
    isStreaming: boolean;
}): RequestBody | undefined {
    if (operation.requestBody == null) {
        return undefined;
    }

    const resolvedRequestBody = isReferenceObject(operation.requestBody)
        ? context.resolveRequestBodyReference(operation.requestBody)
        : operation.requestBody;

    const jsonMediaObject = getApplicationJsonSchemaMediaObject(resolvedRequestBody.content, context);

    if (jsonMediaObject == null) {
        return undefined;
    }

    const resolvedRequstBodySchema = isReferenceObject(jsonMediaObject.schema)
        ? context.resolveSchemaReference(jsonMediaObject.schema)
        : jsonMediaObject.schema;

    if (resolvedRequstBodySchema.allOf == null && resolvedRequstBodySchema.properties == null) {
        return undefined; // not an object
    }

    let streamingProperty = resolvedRequstBodySchema.properties?.[streamingExtension.streamConditionProperty];
    if (streamingProperty != null && isReferenceObject(streamingProperty)) {
        streamingProperty = undefined;
    }

    const requestBodySchemaWithLiteralProperty: OpenAPIV3.SchemaObject = {
        ...resolvedRequstBodySchema,
        properties: {
            ...resolvedRequstBodySchema.properties,
            [streamingExtension.streamConditionProperty]: {
                type: "boolean",
                "x-fern-boolean-literal": isStreaming,
                ...(streamingProperty ?? {})
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } as any
        },
        // Set to undefined because we inline both the streaming and non-streaming request schemas
        // and title would cause conflicting names
        title: undefined,
        required: [...(resolvedRequstBodySchema.required ?? []), streamingExtension.streamConditionProperty]
    };

    return {
        requestBody: {
            content: {
                [MediaType.APPLICATION_JSON]: {
                    schema: requestBodySchemaWithLiteralProperty
                }
            }
        },
        schemaReference: isReferenceObject(jsonMediaObject.schema) ? jsonMediaObject.schema : undefined
    };
}

function getResponses({
    operation,
    response
}: {
    operation: OpenAPIV3.OperationObject;
    response: OpenAPIV3.ReferenceObject | OpenAPIV3.SchemaObject;
}): OpenAPIV3.ResponsesObject {
    return {
        ...operation.responses,
        "200": {
            description: "",
            content: {
                [MediaType.APPLICATION_JSON]: {
                    schema: response
                }
            }
        } as OpenAPIV3.ResponseObject
    };
}

// this only checks if the response is a stream.
// TODO: check if the request passes the stream-condition
export function isStreamingExample(
    example: EndpointExample,
    context: AbstractOpenAPIV3ParserContext
): boolean | undefined {
    return example._visit({
        unknown: (unknownExample) => {
            const maybeFernExample = RawSchemas.serialization.ExampleEndpointCallSchema.parse(unknownExample);
            if (!maybeFernExample.ok) {
                return undefined;
            }

            if (maybeFernExample.value.response == null) {
                return undefined;
            }

            return (maybeFernExample.value.response as { stream?: unknown }).stream != null;
        },
        full: () => undefined,
        _other: () => undefined
    });
}
