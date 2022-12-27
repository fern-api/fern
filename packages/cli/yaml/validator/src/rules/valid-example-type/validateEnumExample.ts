import { RawSchemas } from "@fern-api/yaml-schema";
import { RuleViolation } from "../../Rule";

export function validateEnumExample({
    rawEnum,
    example,
}: {
    rawEnum: RawSchemas.EnumSchema;
    example: RawSchemas.ExampleTypeValueSchema;
}): RuleViolation[] {
    const wireValues = rawEnum.enum.map((enumValue) => (typeof enumValue === "string" ? enumValue : enumValue.value));
    if (wireValues.includes(example)) {
        return [];
    }

    const validEnumValuesLines = wireValues.map((wireValue) => `  - ${wireValue}`).join("\n");

    if (typeof example !== "string") {
        return [
            {
                severity: "error",
                message:
                    `This example is not valid. Example is: ${JSON.stringify(example)}. Enum values are:\n` +
                    validEnumValuesLines,
            },
        ];
    }

    return [
        {
            severity: "error",
            message: `"${example}" is not a valid example for this enum. Enum values are:\n` + validEnumValuesLines,
        },
    ];
}
