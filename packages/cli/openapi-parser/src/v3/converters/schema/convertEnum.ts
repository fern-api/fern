import { VALID_NAME_REGEX } from "@fern-api/validator";
import { EnumValue, Schema } from "@fern-fern/openapi-ir-model/ir";
import { camelCase, upperFirst } from "lodash-es";

export function convertEnum({
    nameOverride,
    generatedName,
    enumVarNames,
    enumNames,
    enumValues,
    description,
    wrapAsNullable,
}: {
    nameOverride: string | undefined;
    generatedName: string;
    enumVarNames: string[] | undefined;
    enumNames: Record<string, string> | undefined;
    enumValues: string[];
    description: string | undefined;
    wrapAsNullable: boolean;
}): Schema {
    const strippedEnumVarNames = stripCommonPrefix(enumVarNames ?? []);
    const values = enumValues.map((value, index) => {
        const enumVarName = strippedEnumVarNames[index];
        const fernEnumName = enumNames?.[value];
        const valueIsValidName = VALID_NAME_REGEX.test(value);
        return {
            nameOverride: fernEnumName ?? enumVarName,
            generatedName: valueIsValidName ? value : generateEnumNameFromValue(value),
            value,
        };
    });
    return wrapEnum({
        wrapAsNullable,
        nameOverride,
        generatedName,
        values,
        description,
    });
}

export function wrapEnum({
    wrapAsNullable,
    nameOverride,
    generatedName,
    values,
    description,
}: {
    wrapAsNullable: boolean;
    nameOverride: string | undefined;
    generatedName: string;
    values: EnumValue[];
    description: string | undefined;
}): Schema {
    if (wrapAsNullable) {
        return Schema.nullable({
            value: Schema.enum({
                nameOverride,
                generatedName,
                values,
                description,
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

function stripCommonPrefix(names: string[]): string[] {
    if (names.length <= 1 || names[0] == null) {
        return names;
    }

    const nameZero = names[0];

    let i = 0;
    // while all words have the same character at position i, increment i
    while (nameZero[i] && names.every((name) => name[i] === nameZero[i])) {
        i++;
    }

    // prefix is the substring from the beginning to the last successfully checked i
    return names.map((name) => name.substring(i));
}
