import { Availability, EnumValue, SchemaWithExample, SdkGroupName } from "@fern-api/openapi-ir-sdk";
import { camelCase, upperFirst } from "lodash-es";
import { FernEnumConfig } from "../openapi/v3/extensions/getFernEnum";
import { SchemaParserContext } from "./SchemaParserContext";
import { replaceStartingNumber } from "./utils/replaceStartingNumber";

export const VALID_ENUM_NAME_REGEX = /^[a-zA-Z][a-zA-Z0-9_]*$/;

export function convertEnum({
    nameOverride,
    generatedName,
    fernEnum,
    enumVarNames,
    enumValues,
    _default,
    description,
    availability,
    wrapAsNullable,
    groupName,
    context
}: {
    nameOverride: string | undefined;
    generatedName: string;
    fernEnum: FernEnumConfig | undefined;
    enumVarNames: string[] | undefined;
    enumValues: string[];
    _default: string | undefined;
    description: string | undefined;
    availability: Availability | undefined;
    wrapAsNullable: boolean;
    groupName: SdkGroupName | undefined;
    context: SchemaParserContext | undefined;
}): SchemaWithExample {
    const strippedEnumVarNames = stripCommonPrefix(enumVarNames ?? []);
    const uniqueValues = new Set(enumValues);
    const values = Array.from(uniqueValues).map((value, index): EnumValue => {
        const fernEnumValue = fernEnum?.[value];
        const enumVarName = strippedEnumVarNames[index];
        const valueIsValidName = VALID_ENUM_NAME_REGEX.test(value);
        let nameOverride = fernEnumValue?.name ?? enumVarName;
        const generatedName = valueIsValidName ? value : generateEnumNameFromValue(value);

        if (nameOverride != null && !VALID_ENUM_NAME_REGEX.test(nameOverride)) {
            context?.logger.warn(
                `Enum name override ${nameOverride} is not a valid name. Falling back on ${generatedName}.`
            );
            nameOverride = undefined;
        }

        return {
            nameOverride,
            generatedName,
            value,
            description: fernEnumValue?.description,
            // not supported as of now, due to lack of support from openapi
            availability: undefined,
            casing: {
                snake: fernEnumValue?.casing?.snake ?? undefined,
                pascal: fernEnumValue?.casing?.pascal ?? undefined,
                screamingSnake: fernEnumValue?.casing?.screamingSnake ?? undefined,
                camel: fernEnumValue?.casing?.camel ?? undefined
            }
        };
    });
    const _defaultEnumValue = _default != null ? values.find((value) => value.value === _default) : undefined;
    return wrapEnum({
        wrapAsNullable,
        nameOverride,
        generatedName,
        values,
        _default: _defaultEnumValue,
        description,
        availability,
        groupName
    });
}

export function wrapEnum({
    wrapAsNullable,
    nameOverride,
    generatedName,
    values,
    _default,
    description,
    availability,
    groupName
}: {
    wrapAsNullable: boolean;
    nameOverride: string | undefined;
    generatedName: string;
    values: EnumValue[];
    _default: EnumValue | undefined;
    description: string | undefined;
    availability: Availability | undefined;
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
                default: _default,
                availability: undefined,
                example: undefined,
                groupName
            }),
            description,
            availability,
            groupName
        });
    }
    return SchemaWithExample.enum({
        nameOverride,
        generatedName,
        values,
        description,
        availability,
        default: _default,
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
    '""': "EMPTY_STRING",
    "-": "HYPHEN",
    "|": "PIPE",
    ".": "DOT",
    "/": "SLASH"
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
