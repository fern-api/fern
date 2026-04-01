import { EnumTypeDeclaration } from "@fern-api/ir-sdk";
import { getWireValue } from "@fern-api/ir-utils";
import { JSONSchema4 } from "json-schema";

import { JsonSchemaConverterContext } from "../JsonSchemaConverterContext.js";

export declare namespace convertEnumToJsonSchema {
    interface Args {
        enum: EnumTypeDeclaration;
        context: JsonSchemaConverterContext;
    }
}

export function convertEnumToJsonSchema({ enum: enumDeclaration, context }: convertEnumToJsonSchema.Args): JSONSchema4 {
    return {
        type: "string",
        enum: enumDeclaration.values.map((value) => getWireValue(value.name))
    };
}
