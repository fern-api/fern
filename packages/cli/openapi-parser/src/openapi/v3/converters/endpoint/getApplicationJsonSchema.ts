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

            return {
                schema: schema ?? {},
                examples: getExamples(mediaObject, context)
            };
        }
    }

    return undefined;
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

function getExamples(
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
