import { Rule, RuleContext, RuleViolation } from "../../Rule";

export const RequiredPathsRule: Rule = {
    name: "required-paths",
    description: "Validates that the OpenAPI document has a paths object",
    validate: (context: RuleContext): RuleViolation[] => {
        const violations: RuleViolation[] = [];
        const { document } = context;

        if (!document.paths) {
            violations.push({
                severity: "error",
                message: "[required-paths] OpenAPI document should have a 'paths' object or 'webhooks' object",
                path: "/"
            });
        }

        return violations;
    }
};
