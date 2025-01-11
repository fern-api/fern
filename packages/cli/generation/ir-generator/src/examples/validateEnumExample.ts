import { RawSchemas } from "@fern-api/fern-definition-schema";

import { ExampleViolation } from "./exampleViolation";
import { getViolationsForMisshapenExample } from "./getViolationsForMisshapenExample";

export function validateEnumExample({
    rawEnum,
    example,
    breadcrumbs
}: {
    rawEnum: RawSchemas.EnumSchema;
    example: RawSchemas.ExampleTypeValueSchema;
    breadcrumbs: string[];
}): ExampleViolation[] {
    const wireValues = rawEnum.enum.map((enumValue) => (typeof enumValue === "string" ? enumValue : enumValue.value));
    const validEnumValuesLines = wireValues.map((wireValue) => `  - ${wireValue}`).join("\n");

    if (typeof example !== "string") {
        return getViolationsForMisshapenExample(example, "a string");
    }

    if (wireValues.includes(example)) {
        return [];
    }

    return [
        {
            message: `"${example}" is not a valid example for this enum. Enum values are:\n` + validEnumValuesLines
        }
    ];
}
