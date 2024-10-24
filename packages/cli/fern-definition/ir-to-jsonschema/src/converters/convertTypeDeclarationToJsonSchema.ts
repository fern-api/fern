import { TypeDeclaration } from "@fern-api/ir-sdk";
import { JSONSchema4 } from "json-schema";
import { JsonSchemaConverterContext } from "../JsonSchemaConverterContext";
import { convertObjectToJsonSchema } from "./objectToJsonSchema";
import { convertEnumToJsonSchema } from "./enumToJsonSchema";
import { convertUnionToJsonSchema } from "./unionToJsonSchema";
import { convertUndiscriminatedUnionToJsonSchema } from "./undiscriminatedUnionToJsonSchema";
import { convertTypeReferenceToJsonSchema } from "./typeReferenceToJsonSchema";
import { assertNever } from "@fern-api/core-utils";

export declare namespace convertTypeDeclarationToJsonSchema {
    interface Args {
        typeDeclaration: TypeDeclaration;
        context: JsonSchemaConverterContext;
    }
}

export function convertTypeDeclarationToJsonSchema({
    typeDeclaration,
    context
}: convertTypeDeclarationToJsonSchema.Args): JSONSchema4 {
    switch (typeDeclaration.shape.type) {
        case "object":
            return convertObjectToJsonSchema({ object: typeDeclaration.shape, context });
        case "alias":
            return convertTypeReferenceToJsonSchema({ typeReference: typeDeclaration.shape.aliasOf, context });
        case "enum":
            return convertEnumToJsonSchema({ enum: typeDeclaration.shape, context });
        case "union":
            return convertUnionToJsonSchema({ union: typeDeclaration.shape, context });
        case "undiscriminatedUnion":
            return convertUndiscriminatedUnionToJsonSchema({ undiscriminatedUnion: typeDeclaration.shape, context });
        default:
            assertNever(typeDeclaration.shape);
    }
}
