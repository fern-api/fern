import { Rule, OpenApiRuleContext, OpenApiRuleViolation } from "../../Rule";

export const RequiredPathsRule: Rule = {
    name: "required-paths",
    description: "Validates that the OpenAPI document has a paths object",
    validate: (context: OpenApiRuleContext): OpenApiRuleViolation[] => {
        const violations: OpenApiRuleViolation[] = [];
        const { document } = context;

        if (!document.paths) {
            violations.push({
                severity: "error",
                message: "OpenAPI document should have a 'paths' object or 'webhooks' object",
                path: "/"
            });
        }

        return violations;
    }
};
