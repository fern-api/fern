import { SdkGroupName } from "@fern-fern/openapi-ir-model/commons";
import { EnumValue } from "@fern-fern/openapi-ir-model/finalIr";
import { SchemaWithExample } from "@fern-fern/openapi-ir-model/parseIr";
import { camelCase, upperFirst } from "lodash-es";
import { FernEnumConfig } from "../../extensions/getFernEnum";

const VALID_NAME_REGEX = new RegExp("^[a-zA-Z][a-zA-Z0-9_]*$");

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
        const valueIsValidName = VALID_NAME_REGEX.test(value);
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
    "==": "EQUAL_TO"
};

function generateEnumNameFromValue(value: string): string {
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

const NUMERIC_REGEX = /^(\d+)/;
function replaceStartingNumber(input: string): string | undefined {
    const matches = input.match(NUMERIC_REGEX);
    if (matches && matches[0] != null) {
        const numericPart = matches[0];
        const nonNumericPart = input.substring(numericPart.length);
        const parsedNumber = parseFloat(numericPart);
        if (!isNaN(parsedNumber) && isFinite(parsedNumber)) {
            const snakeCasedNumber = convertNumberToSnakeCase(parsedNumber);
            return nonNumericPart.length > 0 ? `${snakeCasedNumber}_${nonNumericPart}` : snakeCasedNumber;
        }
    }
    return undefined;
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

export function convertNumberToSnakeCase(number: number): string | undefined {
    const singleDigits = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine"];

    const teenNumbers = [
        "ten",
        "eleven",
        "twelve",
        "thirteen",
        "fourteen",
        "fifteen",
        "sixteen",
        "seventeen",
        "eighteen",
        "nineteen"
    ];

    const tensNumbers = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];

    if (number < 0 || number > 9999) {
        return undefined;
    }

    if (number < 10) {
        return singleDigits[number];
    }

    if (number < 20) {
        return teenNumbers[number - 10];
    }

    if (number < 100) {
        const tens = Math.floor(number / 10);
        const remainder = number % 10;

        if (remainder === 0) {
            return tensNumbers[tens];
        } else {
            return `${tensNumbers[tens]}_${singleDigits[remainder]}`;
        }
    }

    if (number < 1000) {
        const hundreds = Math.floor(number / 100);
        const remainder = number % 100;

        if (remainder === 0) {
            return `${singleDigits[hundreds]}_hundred`;
        } else {
            return `${singleDigits[hundreds]}_hundred_${convertNumberToSnakeCase(remainder)}`;
        }
    }

    const thousands = Math.floor(number / 1000);
    const remainder = number % 1000;

    if (remainder === 0) {
        return `${singleDigits[thousands]}_thousand`;
    } else {
        return `${singleDigits[thousands]}_thousand_${convertNumberToSnakeCase(remainder)}`;
    }
}
