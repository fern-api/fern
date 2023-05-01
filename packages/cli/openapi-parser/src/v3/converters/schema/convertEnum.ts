import { EnumValue, Schema } from "@fern-fern/openapi-ir-model/ir";

export function convertEnum({
    nameOverride,
    generatedName,
    enumNames,
    enumValues,
    description,
    wrapAsOptional,
}: {
    nameOverride: string | undefined;
    generatedName: string;
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
        nameOverride,
        generatedName,
        values,
        description,
    });
}

export function wrapEnum({
    wrapAsOptional,
    nameOverride,
    generatedName,
    values,
    description,
}: {
    wrapAsOptional: boolean;
    nameOverride: string | undefined;
    generatedName: string;
    values: EnumValue[];
    description: string | undefined;
}): Schema {
    if (wrapAsOptional) {
        return Schema.optional({
            value: Schema.enum({
                nameOverride,
                generatedName,
                values,
                description: undefined,
            }),
            description,
        });
    }
    return Schema.enum({
        nameOverride,
        generatedName,
        values,
        description,
    });
}
