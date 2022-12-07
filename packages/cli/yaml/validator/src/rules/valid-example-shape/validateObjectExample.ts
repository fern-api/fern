import { RawSchemas } from "@fern-api/yaml-schema";
import { RuleViolation } from "../../Rule";

export function validateObjectExample(_args: {
    rawObject: RawSchemas.ObjectSchema;
    example: RawSchemas.TypeExampleSchema;
}): RuleViolation[] {
    return [];
}
