import { Schema } from "@fern-fern/openapi-ir-model/ir";
import { OpenAPIV3 } from "openapi-types";
import { convertSchema } from "../convertSchemas";

export function convertObject({
    properties,
    objectName,
    description,
    required,
}: {
    properties: Record<string, OpenAPIV3.ReferenceObject | OpenAPIV3.SchemaObject>;
    objectName: string | undefined;
    description: string | undefined;
    required: string[] | undefined;
}): Schema {
    return Schema.object({
        description,
        properties: Object.entries(properties).map(([propertyName, propertySchema]) => {
            const schema = convertSchema(propertySchema);
            const isRequired = required != null && required.includes(propertyName);
            return {
                key: propertyName,
                schema: isRequired
                    ? schema
                    : Schema.optional({
                          value: schema,
                      }),
                description: undefined,
            };
        }),
        name: objectName,
        allOf: [],
    });
}
