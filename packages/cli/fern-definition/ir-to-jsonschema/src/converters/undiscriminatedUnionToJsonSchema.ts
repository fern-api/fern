import { JSONSchema4 } from "json-schema";

import { UndiscriminatedUnionTypeDeclaration } from "@fern-api/ir-sdk";

import { JsonSchemaConverterContext } from "../JsonSchemaConverterContext";
import { convertTypeReferenceToJsonSchema } from "./typeReferenceToJsonSchema";

export declare namespace convertUndiscriminatedUnionToJsonSchema {
    interface Args {
        undiscriminatedUnion: UndiscriminatedUnionTypeDeclaration;
        context: JsonSchemaConverterContext;
    }
}

export function convertUndiscriminatedUnionToJsonSchema({
    undiscriminatedUnion,
    context
}: convertUndiscriminatedUnionToJsonSchema.Args): JSONSchema4 {
    return {
        anyOf: undiscriminatedUnion.members.map((member) => {
            const jsonSchemaMember = convertTypeReferenceToJsonSchema({
                typeReference: member.type,
                context
            });
            if (member.docs) {
                jsonSchemaMember.description = member.docs;
            }
            return jsonSchemaMember;
        })
    };
}
