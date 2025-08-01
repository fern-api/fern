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

    // If the example starts with a literal backslash followed by a dollar sign, treat it as just "$" for the includes check
    let normalizedExample = example;
    if (typeof example === "string" && example.startsWith("\\$")) {
        normalizedExample = example.slice(1);
    }

    if (wireValues.includes(normalizedExample)) {
        return [];
    }

    return [
        {
            message: `"${example}" is not a valid example for this enum. Enum values are:\n` + validEnumValuesLines
        }
    ];
}
