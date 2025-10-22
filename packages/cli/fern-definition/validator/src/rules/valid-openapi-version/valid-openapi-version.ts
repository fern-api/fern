import { Rule, OpenApiRuleContext, OpenApiRuleViolation } from "../../Rule";

export const ValidOpenApiVersionRule: Rule = {
    name: "valid-openapi-version",
    description: "Validates that the OpenAPI version is 3.1.x",
    validate: (context: OpenApiRuleContext): OpenApiRuleViolation[] => {
        const violations: OpenApiRuleViolation[] = [];
        const { document } = context;

        if (!document.openapi) {
            violations.push({
                severity: "fatal",
                message: "OpenAPI document must have an 'openapi' field",
                path: "/"
            });
            return violations;
        }

        const version = document.openapi;
        if (!version.startsWith("3.1.")) {
            violations.push({
                severity: "error",
                message: `OpenAPI version must be 3.1.x, found: ${version}`,
                path: "/openapi"
            });
        }

        return violations;
    }
};
