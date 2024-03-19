import { Type } from "@fern-api/ir-sdk";
import { RawSchemas } from "@fern-api/yaml-schema";
import { FernFileContext } from "../../FernFileContext";
import { convertDeclaration } from "../convertDeclaration";

export async function convertEnumTypeDeclaration({
    _enum,
    file
}: {
    _enum: RawSchemas.EnumSchema;
    file: FernFileContext;
}): Promise<Type> {
    return Type.enum({
        values: await Promise.all(
            _enum.enum.map(async (value) => {
                return {
                    ...(await convertDeclaration(value)),
                    name: file.casingsGenerator.generateNameAndWireValue({
                        wireValue: typeof value === "string" ? value : value.value,
                        name: getEnumName(value).name,
                        opts: {
                            casingOverrides: typeof value !== "string" ? value.casing : undefined
                        }
                    })
                };
            })
        )
    });
}

export function getEnumNameFromEnumValue(
    enumValue: string,
    _enum: RawSchemas.EnumSchema
): {
    name: string;
    wasExplicitlySet: boolean;
} {
    const maybeEnumDefintion = _enum.enum.find((value) =>
        typeof value === "string" ? false : value.value === enumValue
    );

    return {
        name: typeof maybeEnumDefintion === "string" ? enumValue : maybeEnumDefintion?.name ?? enumValue,
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
