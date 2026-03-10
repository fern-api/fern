import { EnumTypeDeclaration, NameAndWireValueOrString } from "@fern-api/ir-sdk";

function getWireValue(name: NameAndWireValueOrString): string {
    return typeof name === "string" ? name : name.wireValue;
}
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
