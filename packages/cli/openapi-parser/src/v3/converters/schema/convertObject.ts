import { Schema } from "@fern-fern/openapi-ir-model/ir";
import { OpenAPIV3 } from "openapi-types";
import { convertSchema } from "../convertSchemas";

export function convertObject({
    properties,
    objectName,
    description,
}: {
    properties: Record<string, OpenAPIV3.ReferenceObject | OpenAPIV3.SchemaObject>;
    objectName: string | undefined;
    description: string | undefined;
}): Schema {
    return Schema.object({
        description,
        properties: Object.entries(properties).map(([propertyName, propertySchema]) => {
            return {
                key: propertyName,
                schema: convertSchema(propertySchema),
                description: undefined,
            };
        }),
        name: objectName,
        allOf: [],
    });
}
