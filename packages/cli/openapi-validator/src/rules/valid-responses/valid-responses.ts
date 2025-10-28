import { OpenAPIV3_1 } from "openapi-types";
import { Rule, RuleContext, RuleViolation } from "../../Rule";

const HTTP_METHODS = ["get", "put", "post", "delete", "options", "head", "patch", "trace"];

export const ValidResponsesRule: Rule = {
    name: "valid-responses",
    description: "Validates responses have proper structure",
    validate: (context: RuleContext): RuleViolation[] => {
        const violations: RuleViolation[] = [];
        const { document } = context;

        if (!document.paths) {
            return violations;
        }

        Object.entries(document.paths).forEach(([path, pathItem]) => {
            if (!pathItem || typeof pathItem === "string") {
                return;
            }

            HTTP_METHODS.forEach((method) => {
                const operation = (pathItem as Record<string, unknown>)[method] as
                    | OpenAPIV3_1.OperationObject
                    | undefined;
                if (!operation || !operation.responses) {
                    return;
                }

                if (Object.keys(operation.responses).length === 0) {
                    violations.push({
                        severity: "error",
                        message: `[valid-responses] Responses for ${method.toUpperCase()} ${path} must have at least one response`,
                        path: `/paths/${path}/${method}/responses`
                    });
                }

                Object.entries(operation.responses).forEach(([statusCode, response]) => {
                    if ("$ref" in response) {
                        return;
                    }

                    const responseObj = response as OpenAPIV3_1.ResponseObject;

                    if (!responseObj.description) {
                        violations.push({
                            severity: "warning",
                            message: `[valid-responses] Response ${statusCode} for ${method.toUpperCase()} ${path} should have a description`,
                            path: `/paths/${path}/${method}/responses/${statusCode}`
                        });
                    }
                });
            });
        });

        return violations;
    }
};
