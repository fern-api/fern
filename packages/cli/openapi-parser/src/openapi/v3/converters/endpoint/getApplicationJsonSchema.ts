import { NamedFullExample } from "@fern-api/openapi-ir-sdk";
import { OpenAPIV3 } from "openapi-types";
import { getExtension } from "../../../../getExtension";
import { isReferenceObject } from "../../../../schema/utils/isReferenceObject";
import { EXAMPLES_REFERENCE_PREFIX } from "../../AbstractOpenAPIV3ParserContext";
import { OpenAPIExtension } from "../../extensions/extensions";

export interface ApplicationJsonMediaObject {
    schema: OpenAPIV3.ReferenceObject | OpenAPIV3.SchemaObject;
    examples: NamedFullExample[];
}

export function getApplicationJsonSchemaMediaObject(
    media: Record<string, OpenAPIV3.MediaTypeObject>,
    components: OpenAPIV3.ComponentsObject | undefined
): ApplicationJsonMediaObject | undefined {
    for (const contentType of Object.keys(media)) {
        if (contentType.includes("json")) {
            const mediaObject = media[contentType];
            if (mediaObject == null) {
                continue;
            }
            const schema = mediaObject.schema;

            const fullExamples: NamedFullExample[] = [];
            if (mediaObject.example != null) {
                fullExamples.push({ name: undefined, value: mediaObject.example });
            }
            const examples = getExtension<Record<string, OpenAPIV3.ExampleObject>>(
                mediaObject,
                OpenAPIExtension.EXAMPLES
            );
            if (examples != null && Object.keys(examples).length > 0) {
                fullExamples.push(
                    ...Object.entries(examples).map(([name, value]) => {
                        return { name: value.summary ?? name, value: value.value };
                    })
                );
            }
            if (mediaObject.examples != null && Object.keys(mediaObject.examples).length > 0) {
                fullExamples.push(
                    ...Object.entries(mediaObject.examples).map(([name, value]) => {
                        if (isReferenceObject(value)) {
                            value = resolveExampleReference(value, components);
                        }
                        return { name: value.summary ?? name, value: value.value };
                    })
                );
            }

            if (schema != null) {
                return {
                    schema,
                    examples: fullExamples
                };
            }
        }
    }
    return undefined;
}

function resolveExampleReference(
    response: OpenAPIV3.ReferenceObject,
    components: OpenAPIV3.ComponentsObject | undefined
): OpenAPIV3.ExampleObject {
    if (components == null || components.examples == null || !response.$ref.startsWith(EXAMPLES_REFERENCE_PREFIX)) {
        throw new Error(`Failed to resolve ${response.$ref}`);
    }
    const parameterKey = response.$ref.substring(EXAMPLES_REFERENCE_PREFIX.length);
    const resolvedResponse = components.examples[parameterKey];
    if (resolvedResponse == null) {
        throw new Error(`${response.$ref} is undefined`);
    }
    if (isReferenceObject(resolvedResponse)) {
        return resolveExampleReference(resolvedResponse, components);
    }
    return resolvedResponse;
}
