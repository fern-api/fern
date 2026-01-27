import { NamedFullExample } from "@fern-api/openapi-ir";
import * as Sampler from "openapi-sampler";
import { OpenAPIV3 } from "openapi-types";

import { getExtension } from "../../../../getExtension";
import { isReferenceObject } from "../../../../schema/utils/isReferenceObject";
import { AbstractOpenAPIV3ParserContext } from "../../AbstractOpenAPIV3ParserContext";
import { OpenAPIExtension } from "../../extensions/extensions";

export interface TextEventStreamObject {
    contentType?: string;
    schema: OpenAPIV3.ReferenceObject | OpenAPIV3.SchemaObject;
    examples: NamedFullExample[];
}

export function getTextEventStreamObject(
    media: Record<string, OpenAPIV3.MediaTypeObject>,
    context: AbstractOpenAPIV3ParserContext
): TextEventStreamObject | undefined {
    for (const contentType of Object.keys(media)) {
        // See swagger.io/docs/specification/media-types for reference on "*/*"
        if (contentType.includes("text/event-stream")) {
            const mediaObject = media[contentType];
            if (mediaObject == null) {
                continue;
            }
            // Check for itemSchema (OAS 3.2 standard for SSE) if schema is not present
            const mediaObjectWithItemSchema = mediaObject as OpenAPIV3.MediaTypeObject & {
                itemSchema?: OpenAPIV3.ReferenceObject | OpenAPIV3.SchemaObject;
            };
            const schema = mediaObject.schema ?? mediaObjectWithItemSchema.itemSchema;

            return {
                contentType,
                schema: schema ?? {},
                examples: getExamples(mediaObject, context)
            };
        }
    }

    return undefined;
}

/**
 * Checks if the response content has text/event-stream with itemSchema.
 * This is the OAS 3.2 standard for SSE endpoints.
 */
export function hasTextEventStreamWithItemSchema(media: Record<string, OpenAPIV3.MediaTypeObject>): boolean {
    for (const contentType of Object.keys(media)) {
        if (contentType.includes("text/event-stream")) {
            const mediaObject = media[contentType];
            if (mediaObject == null) {
                continue;
            }
            const mediaObjectWithItemSchema = mediaObject as OpenAPIV3.MediaTypeObject & {
                itemSchema?: OpenAPIV3.ReferenceObject | OpenAPIV3.SchemaObject;
            };
            if (mediaObjectWithItemSchema.itemSchema != null) {
                return true;
            }
        }
    }
    return false;
}

export interface ApplicationJsonMediaObject {
    contentType?: string;
    schema: OpenAPIV3.ReferenceObject | OpenAPIV3.SchemaObject;
    examples: NamedFullExample[];
}

export function isApplicationJsonMediaType(mediaType: string): boolean {
    // See swagger.io/docs/specification/media-types for reference on "*/*"
    return mediaType.includes("json") || mediaType === "*/*";
}

export function findApplicationJsonRequest({
    content,
    context
}: {
    content: Record<string, OpenAPIV3.MediaTypeObject>;
    context: AbstractOpenAPIV3ParserContext;
}): [string, OpenAPIV3.MediaTypeObject] | undefined {
    for (const [mediaType, mediaTypeObject] of Object.entries(content)) {
        const result = getApplicationJsonSchemaMediaObject({
            mediaType,
            mediaTypeObject,
            context
        });
        if (result != null) {
            return [mediaType, mediaTypeObject];
        }
    }

    return undefined;
}

export function getApplicationJsonSchemaMediaObject({
    mediaType,
    mediaTypeObject,
    context
}: {
    mediaType: string;
    mediaTypeObject: OpenAPIV3.MediaTypeObject;
    context: AbstractOpenAPIV3ParserContext;
}): ApplicationJsonMediaObject | undefined {
    // See swagger.io/docs/specification/media-types for reference on "*/*"
    if (!isApplicationJsonMediaType(mediaType)) {
        return undefined;
    }
    const schema = mediaTypeObject.schema;

    return {
        contentType: !mediaType.includes("*") ? mediaType : undefined,
        schema: schema ?? {},
        examples: getExamples(mediaTypeObject, context)
    };
}

export function getApplicationJsonSchemaMediaObjectFromContent({
    content,
    context
}: {
    content: Record<string, OpenAPIV3.MediaTypeObject>;
    context: AbstractOpenAPIV3ParserContext;
}): ApplicationJsonMediaObject | undefined {
    const request = findApplicationJsonRequest({ content, context });
    if (!request) {
        return undefined;
    }
    const [mediaType, mediaTypeObject] = request;
    return getApplicationJsonSchemaMediaObject({ mediaType, mediaTypeObject, context });
}

/**
 * Enhanced version of getApplicationJsonSchemaMediaObjectFromContent that uses enhanced example extraction
 */
export function getApplicationJsonSchemaMediaObjectFromContentEnhanced({
    content,
    context,
    config = {}
}: {
    content: Record<string, OpenAPIV3.MediaTypeObject>;
    context: AbstractOpenAPIV3ParserContext;
    config?: Partial<ExampleGenerationConfig>;
}): (ApplicationJsonMediaObject & { enhancedExamples: EnhancedNamedExample[] }) | undefined {
    const request = findApplicationJsonRequest({ content, context });
    if (!request) {
        return undefined;
    }
    const [mediaType, mediaTypeObject] = request;
    return getApplicationJsonSchemaMediaObjectEnhanced({ mediaType, mediaTypeObject, context, config });
}

export function getSchemaMediaObject(
    media: Record<string, OpenAPIV3.MediaTypeObject>,
    context: AbstractOpenAPIV3ParserContext
): ApplicationJsonMediaObject | undefined {
    for (const contentType of Object.keys(media)) {
        const mediaObject = media[contentType];
        if (mediaObject == null) {
            continue;
        }
        const schema = mediaObject.schema;

        return {
            schema: schema ?? {},
            examples: getExamples(mediaObject, context)
        };
    }

    return undefined;
}

/**
 * Enhanced version of getSchemaMediaObject that uses enhanced example extraction
 */
export function getSchemaMediaObjectEnhanced(
    media: Record<string, OpenAPIV3.MediaTypeObject>,
    context: AbstractOpenAPIV3ParserContext,
    config: Partial<ExampleGenerationConfig> = {}
): (ApplicationJsonMediaObject & { enhancedExamples: EnhancedNamedExample[] }) | undefined {
    for (const contentType of Object.keys(media)) {
        const mediaObject = media[contentType];
        if (mediaObject == null) {
            continue;
        }
        const schema = mediaObject.schema;

        // Use enhanced examples with response-specific configuration (comprehensive examples)
        const responseConfig: Partial<ExampleGenerationConfig> = {
            ...config,
            sampler: {
                skipNonRequired: false, // Responses should show comprehensive examples (all fields)
                skipReadOnly: false,
                ...config.sampler
            }
        };

        const enhancedExamples = getEnhancedExamples(mediaObject, context, responseConfig);

        return {
            schema: schema ?? {},
            examples: enhancedExamples.map((ex) => ({
                name: ex.name,
                value: ex.value,
                description: ex.description
            })), // Backward compatibility
            enhancedExamples
        };
    }

    return undefined;
}

export function getExamples(
    mediaObject: OpenAPIV3.MediaTypeObject,
    context: AbstractOpenAPIV3ParserContext
): NamedFullExample[] {
    const fullExamples: NamedFullExample[] = [];
    if (mediaObject.example != null) {
        fullExamples.push({ name: undefined, value: mediaObject.example, description: undefined });
    }
    const examples = getExtension<Record<string, OpenAPIV3.ExampleObject>>(mediaObject, OpenAPIExtension.EXAMPLES);
    if (examples != null && Object.keys(examples).length > 0) {
        fullExamples.push(
            ...Object.entries(examples).map(([name, value]) => {
                return { name: value.summary ?? name, value: value.value, description: value.description };
            })
        );
    }
    if (mediaObject.examples != null && Object.keys(mediaObject.examples).length > 0) {
        fullExamples.push(
            ...Object.entries(mediaObject.examples).map(([name, example]): NamedFullExample => {
                const resolvedExample: OpenAPIV3.ExampleObject = isReferenceObject(example)
                    ? context.resolveExampleReference(example)
                    : example;
                return {
                    name: resolvedExample.summary ?? name,
                    value: resolvedExample.value,
                    description: resolvedExample.description
                };
            })
        );
    }
    return fullExamples;
}

// ===== ENHANCED EXAMPLE EXTRACTION SYSTEM =====
// New alternative implementation with schema-level support and openapi-sampler integration

export interface EnhancedNamedExample extends NamedFullExample {
    source:
        | "x-fern-examples"
        | "media-examples"
        | "media-example"
        | "schema-examples"
        | "schema-example"
        | "sampler-generated";
    priority: number; // Lower = higher priority
    statusCodeHint?: number; // For matching logic
}

export interface ExampleGenerationConfig {
    limits: {
        maxAutoGeneratedExamples: number; // Default: 3, applies ONLY to sampler-generated examples
        respectUserExamples: boolean; // Default: true, always show ALL user examples
    };
    matching: {
        enableNameMatching: boolean; // Default: true
        enableSemanticMatching: boolean; // Default: true
    };
    sampler: {
        skipNonRequired?: boolean; // true for requests, false for responses
        skipReadOnly?: boolean;
        skipWriteOnly?: boolean;
    };
}

export const DEFAULT_EXAMPLE_CONFIG: ExampleGenerationConfig = {
    limits: {
        maxAutoGeneratedExamples: 3,
        respectUserExamples: true
    },
    matching: {
        enableNameMatching: true,
        enableSemanticMatching: true
    },
    sampler: {}
};

/**
 * Enhanced example extraction with schema-level support and openapi-sampler integration.
 * This is an alternative to getExamples() that can be enabled via configuration.
 */
export function getEnhancedExamples(
    mediaObject: OpenAPIV3.MediaTypeObject,
    context: AbstractOpenAPIV3ParserContext,
    config: Partial<ExampleGenerationConfig> = {}
): EnhancedNamedExample[] {
    const finalConfig = { ...DEFAULT_EXAMPLE_CONFIG, ...config };
    const enhancedExamples: EnhancedNamedExample[] = [];

    // Priority 1: x-fern-examples (highest priority) - already handled elsewhere in codebase
    const fernExamples = getExtension<Record<string, OpenAPIV3.ExampleObject>>(mediaObject, OpenAPIExtension.EXAMPLES);
    if (fernExamples != null && Object.keys(fernExamples).length > 0) {
        enhancedExamples.push(
            ...Object.entries(fernExamples).map(
                ([name, value]): EnhancedNamedExample => ({
                    name: value.summary ?? name,
                    value: value.value,
                    description: value.description,
                    source: "x-fern-examples",
                    priority: 1
                })
            )
        );
    }

    // Priority 2: examples in media type (explicitly named)
    if (mediaObject.examples != null && Object.keys(mediaObject.examples).length > 0) {
        enhancedExamples.push(
            ...Object.entries(mediaObject.examples).map(([name, example]): EnhancedNamedExample => {
                const resolvedExample: OpenAPIV3.ExampleObject = isReferenceObject(example)
                    ? context.resolveExampleReference(example)
                    : example;
                return {
                    name: resolvedExample.summary ?? name,
                    value: resolvedExample.value,
                    description: resolvedExample.description,
                    source: "media-examples",
                    priority: 2
                };
            })
        );
    }

    // Priority 3: example in media type (single unnamed)
    if (mediaObject.example != null) {
        enhancedExamples.push({
            name: "Default Example",
            value: mediaObject.example,
            description: undefined,
            source: "media-example",
            priority: 3
        });
    }

    // Priority 4: Schema-level examples (NEW - currently ignored by original getExamples)
    const schemaExamples = extractSchemaLevelExamples(mediaObject.schema, context);
    enhancedExamples.push(...schemaExamples.map((example) => ({ ...example, priority: 4 })));

    // Priority 5: openapi-sampler generated base examples (replaces current autogeneration)
    if (mediaObject.schema != null) {
        const baseExamples = generateBaseExamples(mediaObject.schema, context, finalConfig.sampler);
        enhancedExamples.push(...baseExamples);
    }

    // Apply bounded generation limits
    return applyExampleLimits(enhancedExamples, finalConfig);
}

/**
 * Extract examples from schema level (schema.example and schema.examples)
 * This is the key missing functionality in the original getExamples()
 */
function extractSchemaLevelExamples(
    schema: OpenAPIV3.ReferenceObject | OpenAPIV3.SchemaObject | undefined,
    context: AbstractOpenAPIV3ParserContext
): Omit<EnhancedNamedExample, "priority">[] {
    if (!schema) {
        return [];
    }

    const examples: Omit<EnhancedNamedExample, "priority">[] = [];

    // Resolve schema reference if needed
    const resolvedSchema = isReferenceObject(schema) ? context.resolveSchemaReference(schema) : schema;

    // Extract schema.examples (named examples) - Check if it exists as an extension or property
    const schemaWithExamples = resolvedSchema as OpenAPIV3.SchemaObject & { examples?: any[] };
    if (schemaWithExamples.examples != null && Array.isArray(schemaWithExamples.examples)) {
        examples.push(
            ...schemaWithExamples.examples.map(
                (example: any, index: number): Omit<EnhancedNamedExample, "priority"> => ({
                    name: `Schema Example ${index + 1}`,
                    value: example,
                    description: undefined,
                    source: "schema-examples"
                })
            )
        );
    }

    // Extract schema.example (single unnamed example)
    if (resolvedSchema.example != null) {
        examples.push({
            name: "Schema Example",
            value: resolvedSchema.example,
            description: undefined,
            source: "schema-example"
        });
    }

    return examples;
}

/**
 * Generate base examples using openapi-sampler
 * This replaces the current hardcoded "string" defaults with intelligent generation
 */
function generateBaseExamples(
    schema: OpenAPIV3.ReferenceObject | OpenAPIV3.SchemaObject,
    context: AbstractOpenAPIV3ParserContext,
    samplerConfig: ExampleGenerationConfig["sampler"]
): EnhancedNamedExample[] {
    try {
        // Resolve schema reference if needed
        const resolvedSchema = isReferenceObject(schema) ? context.resolveSchemaReference(schema) : schema;

        // Generate example using openapi-sampler (with type assertion for compatibility)
        const generatedExample = Sampler.sample(resolvedSchema as any, {
            skipNonRequired: samplerConfig.skipNonRequired ?? false,
            skipReadOnly: samplerConfig.skipReadOnly ?? false,
            skipWriteOnly: samplerConfig.skipWriteOnly ?? false
        });

        return [
            {
                name: "Base Example",
                value: generatedExample,
                description: "Auto-generated example using openapi-sampler",
                source: "sampler-generated",
                priority: 5
            }
        ];
    } catch (error) {
        // Fallback if sampler fails
        console.warn("openapi-sampler failed, falling back to simple example:", error);
        return [
            {
                name: "Simple Example",
                value: generateSimpleFallbackExample(schema, context),
                description: "Fallback example",
                source: "sampler-generated",
                priority: 5
            }
        ];
    }
}

/**
 * Simple fallback example generation when openapi-sampler fails
 */
function generateSimpleFallbackExample(
    schema: OpenAPIV3.ReferenceObject | OpenAPIV3.SchemaObject,
    context: AbstractOpenAPIV3ParserContext
): any {
    const resolvedSchema = isReferenceObject(schema) ? context.resolveSchemaReference(schema) : schema;

    switch (resolvedSchema.type) {
        case "string":
            return "example_string";
        case "number":
            return 123;
        case "integer":
            return 123;
        case "boolean":
            return true;
        case "array":
            return [];
        case "object":
            return {};
        default:
            return "example_value";
    }
}

/**
 * Apply example limits according to configuration
 * Always respect ALL user examples, only limit auto-generated examples
 */
function applyExampleLimits(examples: EnhancedNamedExample[], config: ExampleGenerationConfig): EnhancedNamedExample[] {
    // Sort by priority (lower number = higher priority)
    const sorted = [...examples].sort((a, b) => a.priority - b.priority);

    if (!config.limits.respectUserExamples) {
        // If user examples are not respected, apply global limit
        return sorted.slice(0, config.limits.maxAutoGeneratedExamples);
    }

    // Separate user examples from auto-generated examples
    const userExamples = sorted.filter((ex) => ex.source !== "sampler-generated");
    const autoGeneratedExamples = sorted.filter((ex) => ex.source === "sampler-generated");

    // Always include ALL user examples, limit only auto-generated ones
    const limitedAutoGenerated = autoGeneratedExamples.slice(0, config.limits.maxAutoGeneratedExamples);

    return [...userExamples, ...limitedAutoGenerated];
}

/**
 * Enhanced version of getApplicationJsonSchemaMediaObject that uses the new example extraction
 */
export function getApplicationJsonSchemaMediaObjectEnhanced({
    mediaType,
    mediaTypeObject,
    context,
    config = {}
}: {
    mediaType: string;
    mediaTypeObject: OpenAPIV3.MediaTypeObject;
    context: AbstractOpenAPIV3ParserContext;
    config?: Partial<ExampleGenerationConfig>;
}): (ApplicationJsonMediaObject & { enhancedExamples: EnhancedNamedExample[] }) | undefined {
    // See swagger.io/docs/specification/media-types for reference on "*/*"
    if (!isApplicationJsonMediaType(mediaType)) {
        return undefined;
    }
    const schema = mediaTypeObject.schema;

    const enhancedExamples = getEnhancedExamples(mediaTypeObject, context, config);

    return {
        contentType: !mediaType.includes("*") ? mediaType : undefined,
        schema: schema ?? {},
        examples: enhancedExamples.map((ex) => ({
            name: ex.name,
            value: ex.value,
            description: ex.description
        })), // Backward compatibility
        enhancedExamples
    };
}
