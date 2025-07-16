import { EnumValue } from "@fern-fern/ir-sdk/api";

export function generateEnumName(enumValue: EnumValue): string {
    return enumValue.name.name.screamingSnakeCase.safeName;
}

export function generateEnumValue(enumValue: EnumValue): string {
    return enumValue.name.wireValue;
}

export function generateEnumNameFromValues(example: string, values: EnumValue[]): string | undefined {
    const enumValue = values.find((ev) => generateEnumValue(ev) === example);
    return enumValue != null ? generateEnumName(enumValue) : undefined;
}
