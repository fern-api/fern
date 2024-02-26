import { NamedFullExample } from "@fern-api/openapi-ir-sdk";
import { OpenAPIV3 } from "openapi-types";
import { getExtension } from "../../../../getExtension";
import { isReferenceObject } from "../../../../schema/utils/isReferenceObject";
import { OpenAPIExtension } from "../../extensions/extensions";

export interface ApplicationJsonMediaObject {
    schema: OpenAPIV3.ReferenceObject | OpenAPIV3.SchemaObject;
    examples: NamedFullExample[];
}

export function getApplicationJsonSchemaMediaObject(
    media: Record<string, OpenAPIV3.MediaTypeObject>
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
                            return { name: undefined, value: undefined };
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
