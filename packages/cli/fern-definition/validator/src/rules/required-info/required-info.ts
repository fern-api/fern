import { Rule, OpenApiRuleContext, OpenApiRuleViolation } from "../../Rule";

export const RequiredInfoRule: Rule = {
    name: "required-info",
    description: "Validates that the OpenAPI document has required info object with title and version",
    validate: (context: OpenApiRuleContext): OpenApiRuleViolation[] => {
        const violations: OpenApiRuleViolation[] = [];
        const { document } = context;

        if (!document.info) {
            violations.push({
                severity: "fatal",
                message: "OpenAPI document must have an 'info' object",
                path: "/"
            });
            return violations;
        }

        if (!document.info.title || document.info.title.trim() === "") {
            violations.push({
                severity: "fatal",
                message: "Info object must have a non-empty 'title' field",
                path: "/info"
            });
        }

        if (!document.info.version || document.info.version.trim() === "") {
            violations.push({
                severity: "fatal",
                message: "Info object must have a non-empty 'version' field",
                path: "/info"
            });
        }

        return violations;
    }
};
