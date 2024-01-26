import { SdkGroupName } from "@fern-fern/openapi-ir-model/commons";
import { EnumValue } from "@fern-fern/openapi-ir-model/finalIr";
import { SchemaWithExample } from "@fern-fern/openapi-ir-model/parseIr";
import { camelCase, upperFirst } from "lodash-es";
import { FernEnumConfig } from "../../extensions/getFernEnum";
import { replaceStartingNumber } from "../../utils/replaceStartingNumber";

export const VALID_ENUM_NAME_REGEX = /^[a-zA-Z][a-zA-Z0-9_]*$/;

export function convertEnum({
    nameOverride,
    generatedName,
    fernEnum,
    enumVarNames,
    enumValues,
    description,
    wrapAsNullable,
    groupName
}: {
    nameOverride: string | undefined;
    generatedName: string;
    fernEnum: FernEnumConfig | undefined;
    enumVarNames: string[] | undefined;
    enumValues: string[];
    description: string | undefined;
    wrapAsNullable: boolean;
    groupName: SdkGroupName | undefined;
}): SchemaWithExample {
    const strippedEnumVarNames = stripCommonPrefix(enumVarNames ?? []);
    const uniqueValues = new Set(enumValues);
    const values = Array.from(uniqueValues).map((value, index) => {
        const fernEnumValue = fernEnum?.[value];
        const enumVarName = strippedEnumVarNames[index];
        const valueIsValidName = VALID_ENUM_NAME_REGEX.test(value);
        return {
            nameOverride: fernEnumValue?.name ?? enumVarName,
            generatedName: valueIsValidName ? value : generateEnumNameFromValue(value),
            value,
            description: fernEnumValue?.description
        };
    });
    return wrapEnum({
        wrapAsNullable,
        nameOverride,
        generatedName,
        values,
        description,
        groupName
    });
}

export function wrapEnum({
    wrapAsNullable,
    nameOverride,
    generatedName,
    values,
    description,
    groupName
}: {
    wrapAsNullable: boolean;
    nameOverride: string | undefined;
    generatedName: string;
    values: EnumValue[];
    description: string | undefined;
    groupName: SdkGroupName | undefined;
}): SchemaWithExample {
    if (wrapAsNullable) {
        return SchemaWithExample.nullable({
            nameOverride,
            generatedName,
            value: SchemaWithExample.enum({
                nameOverride,
                generatedName,
                values,
                description,
                example: undefined,
                groupName
            }),
            description,
            groupName
        });
    }
    return SchemaWithExample.enum({
        nameOverride,
        generatedName,
        values,
        description,
        example: undefined,
        groupName
    });
}

const HARDCODED_ENUM_NAMES: Record<string, string> = {
    "<": "LESS_THAN",
    ">": "GREATER_THAN",
    ">=": "GREATER_THAN_OR_EQUAL_TO",
    "<=": "LESS_THAN_OR_EQUAL_TO",
    "!=": "NOT_EQUALS",
    "=": "EQUAL_TO",
    "==": "EQUAL_TO",
    "*": "ALL",
    "": "EMPTY",
    '""': "EMPTY_STRING"
};

export function generateEnumNameFromValue(value: string): string {
    const maybeParsedNumber = replaceStartingNumber(value);
    const maybeHardcodedEnumName = HARDCODED_ENUM_NAMES[value];
    if (maybeParsedNumber != null) {
        return upperFirst(camelCase(maybeParsedNumber));
    } else if (maybeHardcodedEnumName != null) {
        return maybeHardcodedEnumName;
    } else {
        if (value.toLowerCase() === "n/a") {
            return "NOT_APPLICABLE";
        }
        return upperFirst(camelCase(value));
    }
}

function stripCommonPrefix(names: string[]): string[] {
    if (names.length <= 1 || names[0] == null) {
        return names;
    }

    const nameZero = names[0];

    let i = 0;
    // while all words have the same character at position i, increment i
    while (nameZero[i] != null && names.every((name) => name[i] === nameZero[i])) {
        i++;
    }

    // prefix is the substring from the beginning to the last successfully checked i
    return names.map((name) => name.substring(i));
}
