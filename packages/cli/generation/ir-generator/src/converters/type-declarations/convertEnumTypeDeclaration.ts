import { RawSchemas } from "@fern-api/fern-definition-schema";
import { EnumTypeDeclaration, EnumValue } from "@fern-api/ir-sdk";

import { FernFileContext } from "../../FernFileContext";
import { convertDeclaration } from "../convertDeclaration";

export function convertEnumTypeDeclaration({
    _enum,
    file
}: {
    _enum: RawSchemas.EnumSchema;
    file: FernFileContext;
}): EnumTypeDeclaration {
    const values = _enum.enum.map((value) => {
        return {
            ...convertDeclaration(value),
            name: file.casingsGenerator.generateNameAndWireValue({
                wireValue: typeof value === "string" ? value : value.value,
                name: getEnumName(value).name,
                opts: {
                    casingOverrides: typeof value !== "string" ? value.casing : undefined
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
        values
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
