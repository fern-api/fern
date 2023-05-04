import { VALID_NAME_REGEX } from "@fern-api/validator";
import { EnumValue, Schema } from "@fern-fern/openapi-ir-model/ir";
import { camelCase, upperFirst } from "lodash-es";

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
        const valueIsValidName = VALID_NAME_REGEX.test(value);
        return {
            nameOverride: enumNames != null ? enumNames[value] : undefined,
            generatedName: valueIsValidName ? value : generateEnumNameFromValue(value),
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

function generateEnumNameFromValue(value: string): string {
    return upperFirst(camelCase(value));
}
