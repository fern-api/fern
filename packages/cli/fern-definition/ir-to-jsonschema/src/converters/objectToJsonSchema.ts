import { NameAndWireValueOrString, ObjectTypeDeclaration } from "@fern-api/ir-sdk";

function getWireValue(name: NameAndWireValueOrString): string {
    return typeof name === "string" ? name : name.wireValue;
}

import { JSONSchema4 } from "json-schema";

import { JsonSchemaConverterContext } from "../JsonSchemaConverterContext.js";
import { convertTypeReferenceToJsonSchema } from "./typeReferenceToJsonSchema.js";

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
        const propertyName = getWireValue(property.name);
        const propertySchema = convertTypeReferenceToJsonSchema({
            typeReference: property.valueType,
            context
        });
        return [propertyName, propertySchema];
    });

    const requiredProperties = allProperties
        .filter((property) => !context.isOptional(property.valueType))
        .map((property) => getWireValue(property.name));

    if (properties.length > 0) {
        schema.properties = Object.fromEntries(properties);
    }

    if (requiredProperties.length > 0) {
        schema.required = requiredProperties;
    }

    schema.additionalProperties = object.extraProperties;

    return schema;
}
