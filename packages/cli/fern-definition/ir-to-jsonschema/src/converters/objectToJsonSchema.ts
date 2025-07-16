import { JSONSchema4 } from "json-schema";

import { ObjectTypeDeclaration } from "@fern-api/ir-sdk";

import { JsonSchemaConverterContext } from "../JsonSchemaConverterContext";
import { convertTypeReferenceToJsonSchema } from "./typeReferenceToJsonSchema";

export declare namespace convertObjectToJsonSchema {
    interface Args {
        object: ObjectTypeDeclaration;
        context: JsonSchemaConverterContext;
    }
}

export function convertObjectToJsonSchema({ object, context }: convertObjectToJsonSchema.Args): JSONSchema4 {
    const schema: JSONSchema4 = {
        type: "object"
    };

    const allProperties = [...(object.extendedProperties ?? []), ...object.properties];

    const properties = allProperties.map((property) => {
        const propertyName = property.name.wireValue;
        const propertySchema = convertTypeReferenceToJsonSchema({
            typeReference: property.valueType,
            context
        });
        return [propertyName, propertySchema];
    });

    const requiredProperties = allProperties
        .filter((property) => !context.isOptional(property.valueType))
        .map((property) => property.name.wireValue);

    if (properties.length > 0) {
        schema.properties = Object.fromEntries(properties);
    }

    if (requiredProperties.length > 0) {
        schema.required = requiredProperties;
    }

    schema.additionalProperties = object.extraProperties;

    return schema;
}
