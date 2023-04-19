import { Schema } from "@fern-fern/openapi-ir-model/ir";

export function convertEnum({
    schemaName,
    enumNames,
    enumValues,
    description,
}: {
    schemaName: string | undefined;
    enumNames: Record<string, string> | undefined;
    enumValues: string[];
    description: string | undefined;
}): Schema {
    return Schema.enum({
        name: schemaName,
        values: enumValues.map((value) => {
            return {
                name: enumNames != null ? enumNames[value] : undefined,
                value,
            };
        }),
        description,
    });
}
