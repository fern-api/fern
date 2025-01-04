import { JSONSchema4 } from "json-schema";

import { assertNever } from "@fern-api/core-utils";
import { UnionTypeDeclaration } from "@fern-api/ir-sdk";

import { JsonSchemaConverterContext } from "../JsonSchemaConverterContext";
import { convertTypeDeclarationToJsonSchema } from "./convertTypeDeclarationToJsonSchema";
import { convertTypeReferenceToJsonSchema } from "./typeReferenceToJsonSchema";

export declare namespace convertUnionToJsonSchema {
    interface Args {
        union: UnionTypeDeclaration;
        context: JsonSchemaConverterContext;
    }
}

export function convertUnionToJsonSchema({ union, context }: convertUnionToJsonSchema.Args): JSONSchema4 {
    const discriminant = union.discriminant.wireValue;
    return {
        type: "object",
        properties: {
            [discriminant]: {
                type: "string",
                enum: union.types.map((member) => member.discriminantValue.wireValue)
            }
        },
        required: [discriminant],
        oneOf: union.types.map((member) => {
            let properties: Record<string, JSONSchema4> = {};
            let required: string[] = [];
            switch (member.shape.propertiesType) {
                case "samePropertiesAsObject": {
                    const typeDeclaration = context.getTypeDeclarationForId({ typeId: member.shape.typeId });
                    const jsonSchema = convertTypeDeclarationToJsonSchema({
                        typeDeclaration,
                        context
                    });
                    properties = jsonSchema.properties ?? {};
                    required = Array.isArray(jsonSchema.required) ? jsonSchema.required : [];
                    break;
                }
                case "singleProperty":
                    properties.value = convertTypeReferenceToJsonSchema({
                        typeReference: member.shape.type,
                        context
                    });
                    break;
                case "noProperties":
                    // No additional properties or required fields
                    break;
                default:
                    assertNever(member.shape);
            }
            return {
                properties: {
                    [discriminant]: { const: member.discriminantValue.wireValue },
                    ...properties
                },
                required: [discriminant, ...required]
            };
        })
    };
}
