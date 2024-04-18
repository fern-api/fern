import { NamedFullExample } from "@fern-api/openapi-ir-sdk";
import { OpenAPIV3 } from "openapi-types";
import { getExtension } from "../../../../getExtension";
import { isReferenceObject } from "../../../../schema/utils/isReferenceObject";
import { AbstractOpenAPIV3ParserContext } from "../../AbstractOpenAPIV3ParserContext";
import { OpenAPIExtension } from "../../extensions/extensions";

export interface ApplicationJsonMediaObject {
    schema: OpenAPIV3.ReferenceObject | OpenAPIV3.SchemaObject;
    examples: NamedFullExample[];
}

export function getApplicationJsonSchemaMediaObject(
    media: Record<string, OpenAPIV3.MediaTypeObject>,
    context: AbstractOpenAPIV3ParserContext
): ApplicationJsonMediaObject | undefined {
    for (const contentType of Object.keys(media)) {
        if (contentType.includes("json")) {
            const mediaObject = media[contentType];
            if (mediaObject == null) {
                continue;
            }
            const schema = mediaObject.schema;

            if (schema != null) {
                return {
                    schema,
                    examples: getExamples(media, context)
                };
            }
        }
    }

    // prefer json before text/plain
    for (const contentType of Object.keys(media)) {
        if (contentType.includes("text/plain")) {
            const mediaObject = media[contentType];
            if (mediaObject == null) {
                continue;
            }
            const schema = mediaObject.schema;

            return {
                schema: schema ?? { type: "string" },
                examples: getExamples(mediaObject, context)
            };
        }
    }
    return undefined;
}

function getExamples(mediaObject: OpenAPIV3.MediaTypeObject, context: AbstractOpenAPIV3ParserContext) {
    const fullExamples: NamedFullExample[] = [];
    if (mediaObject.example != null) {
        fullExamples.push({ name: undefined, value: mediaObject.example });
    }
    const examples = getExtension<Record<string, OpenAPIV3.ExampleObject>>(mediaObject, OpenAPIExtension.EXAMPLES);
    if (examples != null && Object.keys(examples).length > 0) {
        fullExamples.push(
            ...Object.entries(examples).map(([name, value]) => {
                return { name: value.summary ?? name, value: value.value };
            })
        );
    }
    if (mediaObject.examples != null && Object.keys(mediaObject.examples).length > 0) {
        fullExamples.push(
            ...Object.entries(mediaObject.examples).map(([name, example]) => {
                const resolvedExample: OpenAPIV3.ExampleObject = isReferenceObject(example)
                    ? context.resolveExampleReference(example)
                    : example;
                return { name: resolvedExample.summary ?? name, value: resolvedExample.value };
            })
        );
    }
    return fullExamples;
}
