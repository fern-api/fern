import { Rule, OpenApiRuleContext, OpenApiRuleViolation } from "../../Rule";
import { OpenAPIV3_1 } from "openapi-types";

const HTTP_METHODS = ["get", "put", "post", "delete", "options", "head", "patch", "trace"];

export const ValidResponsesRule: Rule = {
    name: "valid-responses",
    description: "Validates responses have proper structure",
    validate: (context: OpenApiRuleContext): OpenApiRuleViolation[] => {
        const violations: OpenApiRuleViolation[] = [];
        const { document } = context;

        if (!document.paths) {
            return violations;
        }

        Object.entries(document.paths).forEach(([path, pathItem]) => {
            if (!pathItem || typeof pathItem === "string") {
                return;
            }

            HTTP_METHODS.forEach((method) => {
                const operation = (pathItem as any)[method] as OpenAPIV3_1.OperationObject | undefined;
                if (!operation || !operation.responses) {
                    return;
                }

                if (Object.keys(operation.responses).length === 0) {
                    violations.push({
                        severity: "error",
                        message: `Responses for ${method.toUpperCase()} ${path} must have at least one response`,
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
                            message: `Response ${statusCode} for ${method.toUpperCase()} ${path} should have a description`,
                            path: `/paths/${path}/${method}/responses/${statusCode}`
                        });
                    }
                });
            });
        });

        return violations;
    }
};
