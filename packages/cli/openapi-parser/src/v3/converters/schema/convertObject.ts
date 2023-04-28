import { ObjectProperty, ReferencedSchema, Schema } from "@fern-fern/openapi-ir-model/ir";
import { OpenAPIV3 } from "openapi-types";
import { isReferenceObject } from "../../isReferenceObject";
import { OpenAPIV3ParserContext } from "../../OpenAPIV3ParserContext";
import { convertSchema, convertToReferencedSchema } from "../convertSchemas";

export function convertObject({
    properties,
    objectName,
    description,
    required,
    wrapAsOptional,
    allOf,
    context,
}: {
    properties: Record<string, OpenAPIV3.ReferenceObject | OpenAPIV3.SchemaObject>;
    objectName: string | undefined;
    description: string | undefined;
    required: string[] | undefined;
    wrapAsOptional: boolean;
    allOf: (OpenAPIV3.ReferenceObject | OpenAPIV3.SchemaObject)[];
    context: OpenAPIV3ParserContext;
}): Schema {
    let propertiesToConvert = { ...properties };
    const referencedAllOf: ReferencedSchema[] = [];
    for (const allOfElement of allOf) {
        if (isReferenceObject(allOfElement)) {
            referencedAllOf.push(convertToReferencedSchema(allOfElement));
        } else {
            if (allOfElement.properties != null) {
                propertiesToConvert = { ...allOfElement.properties, ...propertiesToConvert };
            }
        }
    }

    const convertedProperties = Object.entries(propertiesToConvert).map(([propertyName, propertySchema]) => {
        const isRequired = required != null && required.includes(propertyName);
        const schema = convertSchema(propertySchema, !isRequired, context);
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
        allOf: referencedAllOf,
    });
}

export function wrapObject({
    wrapAsOptional,
    objectName,
    properties,
    description,
    allOf,
}: {
    wrapAsOptional: boolean;
    objectName: string | undefined;
    properties: ObjectProperty[];
    description: string | undefined;
    allOf: ReferencedSchema[];
}): Schema {
    if (wrapAsOptional) {
        return Schema.optional({
            value: Schema.object({
                description: undefined,
                properties,
                name: objectName,
                allOf,
            }),
            description,
        });
    }
    return Schema.object({
        description,
        properties,
        name: objectName,
        allOf,
    });
}
