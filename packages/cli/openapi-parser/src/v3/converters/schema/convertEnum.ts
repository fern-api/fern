import { EnumValue, Schema } from "@fern-fern/openapi-ir-model/ir";

export function convertEnum({
    schemaName,
    enumNames,
    enumValues,
    description,
    wrapAsOptional,
}: {
    schemaName: string | undefined;
    enumNames: Record<string, string> | undefined;
    enumValues: string[];
    description: string | undefined;
    wrapAsOptional: boolean;
}): Schema {
    const values = enumValues.map((value) => {
        return {
            name: enumNames != null ? enumNames[value] : undefined,
            value,
        };
    });
    return wrapEnum({
        wrapAsOptional,
        enumName: schemaName,
        values,
        description,
    });
}

export function wrapEnum({
    wrapAsOptional,
    enumName,
    values,
    description,
}: {
    wrapAsOptional: boolean;
    enumName: string | undefined;
    values: EnumValue[];
    description: string | undefined;
}): Schema {
    if (wrapAsOptional) {
        return Schema.optional({
            value: Schema.enum({
                name: enumName,
                values,
                description: undefined,
            }),
            description,
        });
    }
    return Schema.enum({
        name: enumName,
        values,
        description,
    });
}
