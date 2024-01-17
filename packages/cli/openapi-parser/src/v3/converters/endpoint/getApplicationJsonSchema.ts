import { NamedFullExample } from "@fern-fern/openapi-ir-model/parseIr";
import { OpenAPIV3 } from "openapi-types";
import { OpenAPIExtension } from "../../extensions/extensions";
import { getExtension } from "../../extensions/getExtension";

export const APPLICATION_JSON_CONTENT = "application/json";
export const APPLICATION_JSON_REGEX = /^application.*json$/;

export interface ApplicationJsonMediaObject {
    schema: OpenAPIV3.ReferenceObject | OpenAPIV3.SchemaObject;
    examples: NamedFullExample[];
}

export function getApplicationJsonSchemaMediaObject(
    media: Record<string, OpenAPIV3.MediaTypeObject>
): ApplicationJsonMediaObject | undefined {
    for (const contentType of Object.keys(media)) {
        if (contentType.includes(APPLICATION_JSON_CONTENT) || APPLICATION_JSON_REGEX.test(contentType)) {
            const mediaObject = media[contentType];
            if (mediaObject == null) {
                continue;
            }
            const schema = mediaObject.schema;

            const fullExamples: NamedFullExample[] = [];
            if (mediaObject.example != null) {
                fullExamples.push({ name: undefined, value: mediaObject.example });
            }
            const examples = getExtension<Record<string, unknown>>(mediaObject, OpenAPIExtension.EXAMPLES);
            if (examples != null && Object.keys(examples).length > 0) {
                fullExamples.push(
                    ...Object.entries(examples).map(([name, value]) => {
                        return { name, value };
                    })
                );
            }
            if (mediaObject.examples != null && Object.keys(mediaObject.examples).length > 0) {
                fullExamples.push(
                    ...Object.entries(mediaObject.examples).map(([name, value]) => {
                        return { name, value };
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
