import { OpenAPIV3_1 } from "openapi-types";
import { Rule, RuleContext, RuleViolation } from "../../Rule";

export const ValidServerUrlsRule: Rule = {
    name: "valid-server-urls",
    description: "Validates server URLs are properly formatted",
    validate: (context: RuleContext): RuleViolation[] => {
        const violations: RuleViolation[] = [];
        const { document } = context;

        if (!document.servers || document.servers.length === 0) {
            return violations;
        }

        document.servers.forEach((server: OpenAPIV3_1.ServerObject, index: number) => {
            if (!server.url) {
                violations.push({
                    severity: "error",
                    message: `[valid-server-urls] Server at index ${index} must have a 'url' field`,
                    path: `/servers/${index}`
                });
                return;
            }

            if (server.url.trim() === "") {
                violations.push({
                    severity: "error",
                    message: `[valid-server-urls] Server URL at index ${index} cannot be empty`,
                    path: `/servers/${index}/url`
                });
            }

            if (server.variables) {
                Object.entries(server.variables).forEach(([varName, varObj]) => {
                    if (!varObj.default) {
                        violations.push({
                            severity: "error",
                            message: `[valid-server-urls] Server variable '${varName}' must have a 'default' value`,
                            path: `/servers/${index}/variables/${varName}`
                        });
                    }
                });
            }
        });

        return violations;
    }
};
