import { NamedFullExample } from "@fern-api/openapi-ir";
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
            const schema = mediaObject.schema;

            return {
                contentType,
                schema: schema ?? {},
                examples: getExamples(mediaObject, context)
            };
        }
    }

    return undefined;
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
