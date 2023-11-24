import { RawSchemas } from "@fern-api/yaml-schema";
import { RuleViolation } from "../../Rule";
import { getRuleViolationsForMisshapenExample } from "./getRuleViolationsForMisshapenExample";

export function validateEnumExample({
    rawEnum,
    example
}: {
    rawEnum: RawSchemas.EnumSchema;
    example: RawSchemas.ExampleTypeValueSchema;
}): RuleViolation[] {
    const wireValues = rawEnum.enum.map((enumValue) => (typeof enumValue === "string" ? enumValue : enumValue.value));
    const validEnumValuesLines = wireValues.map((wireValue) => `  - ${wireValue}`).join("\n");

    if (typeof example !== "string") {
        return getRuleViolationsForMisshapenExample(example, "a string");
    }

    if (wireValues.includes(example)) {
        return [];
    }

    return [
        {
            severity: "error",
            message: `"${example}" is not a valid example for this enum. Enum values are:\n` + validEnumValuesLines
        }
    ];
}
