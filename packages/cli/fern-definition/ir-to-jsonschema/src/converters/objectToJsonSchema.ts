import { ObjectTypeDeclaration } from "@fern-api/ir-sdk";
import { JSONSchema4 } from "json-schema";
import { JsonSchemaConverterContext } from "../JsonSchemaConverterContext";
import { convertTypeReferenceToJsonSchema } from "./typeReferenceToJsonSchema";

export declare namespace convertObjectToJsonSchema {
    interface Args {
        object: ObjectTypeDeclaration;
        context: JsonSchemaConverterContext;
    }
}

export function convertObjectToJsonSchema({ object, context }: convertObjectToJsonSchema.Args): JSONSchema4 {
    const properties = object.properties.map((property) => {
        const propertyName = property.name.wireValue;
        const propertySchema = convertTypeReferenceToJsonSchema({
            typeReference: property.valueType,
            context
        });
        return [propertyName, propertySchema];
    });

    const requiredProperties = object.properties
        .filter((property) => !context.isOptional(property.valueType))
        .map((property) => property.name.wireValue);

    return {
        type: "object",
        properties: Object.fromEntries(properties),
        required: requiredProperties.length > 0 ? requiredProperties : undefined
    };
}
