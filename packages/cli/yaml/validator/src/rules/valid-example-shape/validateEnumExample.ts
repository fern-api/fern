import { RawSchemas } from "@fern-api/yaml-schema";
import { RuleViolation } from "../../Rule";

export function validateEnumExample({
    rawEnum,
    example,
}: {
    rawEnum: RawSchemas.EnumSchema;
    example: RawSchemas.TypeExampleSchema;
}): RuleViolation[] {
    const wireValues = rawEnum.enum.map((enumValue) => (typeof enumValue === "string" ? enumValue : enumValue.value));
    if (wireValues.includes(example)) {
        return [];
    }

    const validEnumValuesStr = wireValues.map((wireValue) => `"${wireValue}"`).join(", ");

    if (typeof example !== "string") {
        return [
            {
                severity: "error",
                message: `This example is not valid. Enum values are: ${validEnumValuesStr}.`,
            },
        ];
    }

    return [
        {
            severity: "error",
            message: `"${example}" is not a valid example for this enum. Enum values are: ${validEnumValuesStr}.`,
        },
    ];
}
