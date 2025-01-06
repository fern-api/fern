import { JSONSchema4 } from "json-schema";

import { assertNever } from "@fern-api/core-utils";
import { PrimitiveTypeV1, TypeReference } from "@fern-api/ir-sdk";

import { JsonSchemaConverterContext } from "../JsonSchemaConverterContext";
import { convertContainerToJsonSchema } from "./containerToJsonSchema";
import { convertTypeDeclarationToJsonSchema } from "./convertTypeDeclarationToJsonSchema";

export declare namespace convertTypeReferenceToJsonSchema {
    interface Args {
        typeReference: TypeReference;
        context: JsonSchemaConverterContext;
    }

    interface Response {
        $ref: string;
        definitions: Record<string, JSONSchema4>;
    }
}

export function convertTypeReferenceToJsonSchema({
    typeReference,
    context
}: convertTypeReferenceToJsonSchema.Args): JSONSchema4 {
    switch (typeReference.type) {
        case "named": {
            const typeDeclaration = context.getTypeDeclarationForId({ typeId: typeReference.typeId });

            // Check if the type hasn't been defined yet and isn't currently being built
            // This prevents infinite recursion and ensures each type is only defined once
            if (
                !context.hasDefinition(typeReference.typeId) &&
                !context.isBuildingTypeDeclaration(typeReference.typeId)
            ) {
                context.buildingTypeDeclaration(typeReference.typeId);

                const schema = convertTypeDeclarationToJsonSchema({ typeDeclaration, context });
                // Register the schema definition
                context.registerDefinition(typeReference.typeId, schema);

                context.finishedBuildingTypeDeclaration(typeReference.typeId);
            }

            // Return a reference to the schema in the definitions
            return {
                $ref: `#/definitions/${context.getDefinitionKey(typeDeclaration)}`
            };
        }
        case "container":
            return convertContainerToJsonSchema({ container: typeReference.container, context });
        case "primitive":
            return convertPrimitiveTypeReferenceToJsonSchema(typeReference.primitive.v1);
        case "unknown":
            return {
                type: ["string", "number", "boolean", "object", "array", "null"]
            };
        default:
            assertNever(typeReference);
    }
}

function convertPrimitiveTypeReferenceToJsonSchema(primitive: PrimitiveTypeV1): JSONSchema4 {
    switch (primitive) {
        case PrimitiveTypeV1.String:
            return {
                type: "string"
            };
        case PrimitiveTypeV1.Integer:
            return {
                type: "integer"
            };
        case PrimitiveTypeV1.Long:
            return {
                type: "integer"
            };
        case PrimitiveTypeV1.Uint:
            return {
                type: "integer",
                minimum: 0
            };
        case PrimitiveTypeV1.Uint64:
            return {
                type: "integer",
                minimum: 0
            };
        case PrimitiveTypeV1.Float:
            return {
                type: "number"
            };
        case PrimitiveTypeV1.Double:
            return {
                type: "number"
            };
        case PrimitiveTypeV1.Boolean:
            return {
                type: "boolean"
            };
        case PrimitiveTypeV1.Date:
            return {
                type: "string",
                format: "date"
            };
        case PrimitiveTypeV1.DateTime:
            return {
                type: "string",
                format: "date-time"
            };
        case PrimitiveTypeV1.Uuid:
            return {
                type: "string",
                format: "uuid"
            };
        case PrimitiveTypeV1.Base64:
            return {
                type: "string",
                contentEncoding: "base64"
            };
        case PrimitiveTypeV1.BigInteger:
            return {
                type: "string",
                pattern: "^-?[0-9]+$"
            };
        default:
            assertNever(primitive);
    }
}
