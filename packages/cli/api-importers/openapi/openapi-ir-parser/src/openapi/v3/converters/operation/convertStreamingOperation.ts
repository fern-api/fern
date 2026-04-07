import { assertNever, MediaType } from "@fern-api/core-utils";
import { RawSchemas } from "@fern-api/fern-definition-schema";
import type { EndpointExample, EndpointWithExample } from "@fern-api/openapi-ir";
import type { OpenAPIV3 } from "openapi-types";

import { getExtension } from "../../../../getExtension.js";
import { isReferenceObject } from "../../../../schema/utils/isReferenceObject.js";
import type { AbstractOpenAPIV3ParserContext } from "../../AbstractOpenAPIV3ParserContext.js";
import { FernOpenAPIExtension } from "../../extensions/fernExtensions.js";
import type { FernStreamingExtension, StreamConditionEndpoint } from "../../extensions/getFernStreamingExtension.js";
import type { OperationContext } from "../contexts.js";
import { getApplicationJsonSchemaMediaObjectFromContent } from "../endpoint/getApplicationJsonSchema.js";
import { convertHttpOperation } from "./convertHttpOperation.js";

const STREAM_SUFFIX = "stream";

export interface StreamingEndpoints {
    streaming: EndpointWithExample[];
    nonStreaming: EndpointWithExample[];
}

export function convertStreamingOperation({
    operationContext,
    context,
    streamingExtension
}: {
    operationContext: OperationContext;
    context: AbstractOpenAPIV3ParserContext;
    streamingExtension: FernStreamingExtension;
}): StreamingEndpoints {
    switch (streamingExtension.type) {
        case "stream": {
            const streamingOperations = convertHttpOperation({
                operationContext,
                context,
                streamFormat: streamingExtension.format,
                streamTerminator: streamingExtension.terminator,
                source: context.source
            });
            return {
                streaming: streamingOperations,
                nonStreaming: []
            };
        }
        case "streamCondition": {
            const streamingRequestBody = getRequestBody({
                context,
                operation: operationContext.operation,
                streamingExtension,
                isStreaming: true
            });
            const streamingResponses = getResponses({
                operation: operationContext.operation,
                response: streamingExtension.responseStream
            });
            // Auto-disambiguate the streaming request name when the request body is a $ref
            // to a named schema that has x-fern-type-name. Without this, both streaming and
            // non-streaming variants would resolve to the same nameOverride (e.g., "ChatRequest"),
            // causing duplicate declaration errors. We only need this when x-fern-type-name is
            // present because without it, the generatedName values are already differentiated
            // by breadcrumbs in convertHttpOperation.
            const autoStreamRequestName = (() => {
                if (streamingExtension.streamRequestName != null) {
                    return streamingExtension.streamRequestName;
                }
                if (streamingRequestBody?.schemaReference != null) {
                    const resolvedSchema = context.resolveSchemaReference(streamingRequestBody.schemaReference);
                    const typeName = getExtension<string>(resolvedSchema, FernOpenAPIExtension.TYPE_NAME);
                    if (typeName != null) {
                        return `${typeName}Streaming`;
                    }
                }
                return undefined;
            })();

            const streamingOperations = convertHttpOperation({
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
                streamTerminator: streamingExtension.terminator,
                suffix: STREAM_SUFFIX,
                source: context.source,
                streamRequestNameOverride: autoStreamRequestName
            });
            streamingOperations.forEach((streamingOperation) => {
                streamingOperation.examples = streamingOperation.examples.filter(
                    (example) => isStreamingExample(example, context) !== false
                );
            });

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
            const nonStreamingOperations = convertHttpOperation({
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
            nonStreamingOperations.forEach((nonStreamingOperation) => {
                nonStreamingOperation.examples = nonStreamingOperation.examples.filter(
                    (example) => isStreamingExample(example, context) !== true
                );
            });

            return {
                streaming: streamingOperations,
                nonStreaming: nonStreamingOperations
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

    const jsonMediaObject = getApplicationJsonSchemaMediaObjectFromContent({
        content: resolvedRequestBody.content,
        context
    });

    if (jsonMediaObject == null) {
        return undefined;
    }

    const resolvedRequestBodySchema = isReferenceObject(jsonMediaObject.schema)
        ? context.resolveSchemaReference(jsonMediaObject.schema)
        : jsonMediaObject.schema;

    if (resolvedRequestBodySchema.allOf == null && resolvedRequestBodySchema.properties == null) {
        return undefined; // not an object
    }

    let streamingProperty = resolvedRequestBodySchema.properties?.[streamingExtension.streamConditionProperty];
    if (streamingProperty != null && isReferenceObject(streamingProperty)) {
        streamingProperty = undefined;
    }

    const requestBodySchemaWithLiteralProperty: OpenAPIV3.SchemaObject = {
        ...resolvedRequestBodySchema,
        properties: {
            ...resolvedRequestBodySchema.properties,
            [streamingExtension.streamConditionProperty]: {
                ...(streamingProperty ?? {}),
                type: "boolean",
                "x-fern-boolean-literal": isStreaming
                // biome-ignore lint/suspicious/noExplicitAny: allow explicit any
            } as any
        },
        // Set to undefined because we inline both the streaming and non-streaming request schemas
        // and title would cause conflicting names
        title: undefined,
        required: [...(resolvedRequestBodySchema.required ?? []), streamingExtension.streamConditionProperty]
    };

    // Strip the streamConditionProperty from allOf-inherited base schemas inside oneOf variants.
    // When the request body is a discriminated union (oneOf) whose variants inherit the stream
    // condition field from a shared base schema via allOf, the literal pinned at the top level
    // would conflict with the inherited boolean in each variant. We create copies of the allOf
    // entries with the property removed so the original schemas in the context stay untouched.
    if (requestBodySchemaWithLiteralProperty.oneOf != null) {
        requestBodySchemaWithLiteralProperty.oneOf = requestBodySchemaWithLiteralProperty.oneOf.map((variant) => {
            if (isReferenceObject(variant)) {
                const resolvedVariant = context.resolveSchemaReference(variant);
                if (resolvedVariant.allOf == null) {
                    return variant;
                }
                return stripStreamConditionPropertyFromAllOf({
                    schema: resolvedVariant,
                    streamConditionProperty: streamingExtension.streamConditionProperty,
                    context
                });
            }
            if (variant.allOf == null) {
                return variant;
            }
            return stripStreamConditionPropertyFromAllOf({
                schema: variant,
                streamConditionProperty: streamingExtension.streamConditionProperty,
                context
            });
        });
    }

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

/**
 * Returns a copy of the schema with the streamConditionProperty removed from any
 * allOf entries that contain it. Only copies are modified — the original schemas
 * stored in the parser context are never mutated.
 */
function stripStreamConditionPropertyFromAllOf({
    schema,
    streamConditionProperty,
    context
}: {
    schema: OpenAPIV3.SchemaObject;
    streamConditionProperty: string;
    context: AbstractOpenAPIV3ParserContext;
}): OpenAPIV3.SchemaObject {
    if (schema.allOf == null) {
        return schema;
    }

    let modified = false;
    const newAllOf = schema.allOf.map((entry) => {
        const resolved = isReferenceObject(entry) ? context.resolveSchemaReference(entry) : entry;
        if (resolved.properties?.[streamConditionProperty] == null) {
            return entry;
        }
        modified = true;
        const { [streamConditionProperty]: _, ...remainingProperties } = resolved.properties;
        const filteredRequired = resolved.required?.filter((r) => r !== streamConditionProperty);
        return {
            ...resolved,
            properties: remainingProperties,
            ...(filteredRequired != null ? { required: filteredRequired } : {})
        };
    });

    if (!modified) {
        return schema;
    }

    return {
        ...schema,
        allOf: newAllOf
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
