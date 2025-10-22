import { Rule, OpenApiRuleContext, OpenApiRuleViolation } from "../../Rule";
import { OpenAPIV3_1 } from "openapi-types";

export const ValidServerUrlsRule: Rule = {
    name: "valid-server-urls",
    description: "Validates server URLs are properly formatted",
    validate: (context: OpenApiRuleContext): OpenApiRuleViolation[] => {
        const violations: OpenApiRuleViolation[] = [];
        const { document } = context;

        if (!document.servers || document.servers.length === 0) {
            return violations;
        }

        document.servers.forEach((server: OpenAPIV3_1.ServerObject, index: number) => {
            if (!server.url) {
                violations.push({
                    severity: "error",
                    message: `Server at index ${index} must have a 'url' field`,
                    path: `/servers/${index}`
                });
                return;
            }

            if (server.url.trim() === "") {
                violations.push({
                    severity: "error",
                    message: `Server URL at index ${index} cannot be empty`,
                    path: `/servers/${index}/url`
                });
            }

            if (server.variables) {
                Object.entries(server.variables).forEach(([varName, varObj]) => {
                    if (!varObj.default) {
                        violations.push({
                            severity: "error",
                            message: `Server variable '${varName}' must have a 'default' value`,
                            path: `/servers/${index}/variables/${varName}`
                        });
                    }
                });
            }
        });

        return violations;
    }
};
