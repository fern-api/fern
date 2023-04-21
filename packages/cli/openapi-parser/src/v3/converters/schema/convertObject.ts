import { ObjectProperty, Schema } from "@fern-fern/openapi-ir-model/ir";
import { OpenAPIV3 } from "openapi-types";
import { convertSchema } from "../convertSchemas";

export function convertObject({
    properties,
    objectName,
    description,
    required,
    wrapAsOptional,
}: {
    properties: Record<string, OpenAPIV3.ReferenceObject | OpenAPIV3.SchemaObject>;
    objectName: string | undefined;
    description: string | undefined;
    required: string[] | undefined;
    wrapAsOptional: boolean;
}): Schema {
    const convertedProperties = Object.entries(properties).map(([propertyName, propertySchema]) => {
        const isRequired = required != null && required.includes(propertyName);
        const schema = convertSchema(propertySchema, !isRequired);
        return {
            key: propertyName,
            schema,
        };
    });
    return wrapObject({
        wrapAsOptional,
        objectName,
        properties: convertedProperties,
        description,
    });
}

export function wrapObject({
    wrapAsOptional,
    objectName,
    properties,
    description,
}: {
    wrapAsOptional: boolean;
    objectName: string | undefined;
    properties: ObjectProperty[];
    description: string | undefined;
}): Schema {
    if (wrapAsOptional) {
        return Schema.optional({
            value: Schema.object({
                description: undefined,
                properties,
                name: objectName,
                allOf: [],
            }),
            description,
        });
    }
    return Schema.object({
        description,
        properties,
        name: objectName,
        allOf: [],
    });
}
