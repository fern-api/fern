import { FernIrV39 as FernIr } from "@fern-fern/ir-sdk";
export function generateEnumName(enumValue: FernIr.EnumValue): string {
    return enumValue.name.name.screamingSnakeCase.safeName;
}

export function generateEnumValue(enumValue: FernIr.EnumValue): string {
    return enumValue.name.wireValue;
}

export function generateEnumNameFromValues(example: string, values: FernIr.EnumValue[]): string | undefined {
    const enumValue = values.find((ev) => generateEnumValue(ev) === example);
    return enumValue != null ? generateEnumName(enumValue) : undefined;
}
