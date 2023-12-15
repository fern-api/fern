import { OpenAPIV3 } from "openapi-types";

export const APPLICATION_JSON_CONTENT = "application/json";
export const APPLICATION_JSON_REGEX = /^application.*json$/;

export function getApplicationJsonSchemaFromMedia(
    media: Record<string, OpenAPIV3.MediaTypeObject>
): OpenAPIV3.ReferenceObject | OpenAPIV3.SchemaObject | undefined {
    for (const contentType of Object.keys(media)) {
        if (contentType.includes(APPLICATION_JSON_CONTENT) || APPLICATION_JSON_REGEX.test(contentType)) {
            const schema = getSchemaForContentType({
                contentType,
                media
            });
            if (schema != null) {
                return schema;
            }
        }
    }
    return undefined;
}

function getSchemaForContentType({
    contentType,
    media
}: {
    contentType: string;
    media: Record<string, OpenAPIV3.MediaTypeObject>;
}): OpenAPIV3.ReferenceObject | OpenAPIV3.SchemaObject | undefined {
    return media[contentType]?.schema;
}
