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
    const hasAnyValueDocs = enumDeclaration.values.some((value) => value.docs != null && value.docs.length > 0);

    if (!hasAnyValueDocs) {
        return {
            type: "string",
            enum: enumDeclaration.values.map((value) => getWireValue(value.name))
        };
    }

    // Emit each value as a `const` entry under `oneOf` so we can attach per-value
    // hover docs via `description`. This is standard JSON Schema (unlike the
    // `enumDescriptions` extension) and is recognized by the YAML language
    // server, JSON Schema validators, and IDE autocomplete.
    return {
        type: "string",
        oneOf: enumDeclaration.values.map((value) => {
            const entry: JSONSchema4 = { const: getWireValue(value.name) };
            if (value.docs != null && value.docs.length > 0) {
                entry.description = value.docs;
            }
            return entry;
        })
    };
}
