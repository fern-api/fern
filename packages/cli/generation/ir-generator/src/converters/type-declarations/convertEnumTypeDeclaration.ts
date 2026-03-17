import { hasConvertibleSpecialChars, replaceSpecialCharsWithWords } from "@fern-api/core-utils";
import { RawSchemas } from "@fern-api/fern-definition-schema";
import { EnumTypeDeclaration, EnumValue } from "@fern-api/ir-sdk";

import { FernFileContext } from "../../FernFileContext.js";
import { convertDeclaration } from "../convertDeclaration.js";

const VALID_NAME_REGEX = /^[a-zA-Z][a-zA-Z0-9_]*$/;

export function convertEnumTypeDeclaration({
    _enum,
    file
}: {
    _enum: RawSchemas.EnumSchema;
    file: FernFileContext;
}): EnumTypeDeclaration {
    const values = _enum.enum.map((value) => {
        const rawName = getEnumName(value).name;
        const nameForCasing = getNameForCasing(rawName);
        return {
            ...convertDeclaration(value),
            name: file.casingsGenerator.generateNameAndWireValue({
                wireValue: typeof value === "string" ? value : value.value,
                name: rawName,
                opts: {
                    casingOverrides: typeof value !== "string" ? value.casing : undefined,
                    ...(nameForCasing != null ? { nameForCasing } : {})
                }
            })
        };
    });
    let defaultValue: EnumValue | undefined;
    if (_enum.default != null) {
        defaultValue = values.find((enumValue) => enumValue.name.wireValue === _enum.default);
        if (defaultValue == null) {
            throw new Error(`Default value ${_enum.default} not found in enum values`);
        }
    }
    return {
        default: defaultValue,
        values,
        forwardCompatible: _enum["forward-compatible"] || undefined
    };
}

export function getEnumNameFromEnumValue(
    enumValue: string,
    _enum: RawSchemas.EnumSchema
): {
    name: string;
    wasExplicitlySet: boolean;
} {
    const maybeEnumDefinition = _enum.enum.find((value) =>
        typeof value === "string" ? false : value.value === enumValue
    );

    return {
        name: typeof maybeEnumDefinition === "string" ? enumValue : (maybeEnumDefinition?.name ?? enumValue),
        wasExplicitlySet: false
    };
}

/**
 * Returns a preprocessed name for casing if the raw name contains special
 * characters that need word conversion. Returns undefined if no conversion
 * is needed (i.e., the name is already valid or only contains characters
 * that camelCase handles naturally).
 */
function getNameForCasing(name: string): string | undefined {
    if (VALID_NAME_REGEX.test(name)) {
        return undefined;
    }
    if (!hasConvertibleSpecialChars(name)) {
        return undefined;
    }
    return replaceSpecialCharsWithWords(name);
}

export function getEnumName(enumValue: string | RawSchemas.EnumValueSchema): {
    name: string;
    wasExplicitlySet: boolean;
} {
    if (typeof enumValue === "string") {
        return {
            name: enumValue,
            wasExplicitlySet: false
        };
    }

    if (enumValue.name == null) {
        return {
            name: enumValue.value,
            wasExplicitlySet: false
        };
    }

    return {
        name: enumValue.name,
        wasExplicitlySet: true
    };
}
