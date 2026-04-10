import { assertNever } from "@fern-api/core-utils";
import { TypeDeclaration } from "@fern-api/ir-sdk";
import { JSONSchema4 } from "json-schema";

import { JsonSchemaConverterContext } from "../JsonSchemaConverterContext.js";
import { convertEnumToJsonSchema } from "./enumToJsonSchema.js";
import { convertObjectToJsonSchema } from "./objectToJsonSchema.js";
import { convertTypeReferenceToJsonSchema } from "./typeReferenceToJsonSchema.js";
import { convertUndiscriminatedUnionToJsonSchema } from "./undiscriminatedUnionToJsonSchema.js";
import { convertUnionToJsonSchema } from "./unionToJsonSchema.js";

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
