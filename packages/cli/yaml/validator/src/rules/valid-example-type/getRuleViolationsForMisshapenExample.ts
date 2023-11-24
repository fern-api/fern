import { RawSchemas } from "@fern-api/yaml-schema";
import { RuleViolation } from "../../Rule";

export function getRuleViolationsForMisshapenExample(
    example: RawSchemas.ExampleTypeReferenceSchema,
    expectedTypeIncludingArticle: string
): RuleViolation[] {
    return [
        {
            severity: "error",
            message: `Expected example to be ${expectedTypeIncludingArticle}. Example is: ${JSON.stringify(example)}`
        }
    ];
}
