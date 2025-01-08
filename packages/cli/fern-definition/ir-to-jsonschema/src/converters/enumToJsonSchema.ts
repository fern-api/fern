import { JSONSchema4 } from "json-schema";

import { EnumTypeDeclaration } from "@fern-api/ir-sdk";

import { JsonSchemaConverterContext } from "../JsonSchemaConverterContext";

export declare namespace convertEnumToJsonSchema {
    interface Args {
        enum: EnumTypeDeclaration;
        context: JsonSchemaConverterContext;
    }
}

export function convertEnumToJsonSchema({ enum: enumDeclaration, context }: convertEnumToJsonSchema.Args): JSONSchema4 {
    return {
        type: "string",
        enum: enumDeclaration.values.map((value) => value.name.wireValue)
    };
}
