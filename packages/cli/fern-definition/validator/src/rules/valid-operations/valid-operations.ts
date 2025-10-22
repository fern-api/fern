import { Rule, OpenApiRuleContext, OpenApiRuleViolation } from "../../Rule";
import { OpenAPIV3_1 } from "openapi-types";

const HTTP_METHODS = ["get", "put", "post", "delete", "options", "head", "patch", "trace"];

export const ValidOperationsRule: Rule = {
    name: "valid-operations",
    description: "Validates operations have required fields and proper structure",
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
                if (!operation) {
                    return;
                }

                if (!operation.responses) {
                    violations.push({
                        severity: "fatal",
                        message: `Operation ${method.toUpperCase()} ${path} must have a 'responses' object`,
                        path: `/paths/${path}/${method}`
                    });
                }

                if (operation.operationId) {
                    if (operation.operationId.trim() === "") {
                        violations.push({
                            severity: "warning",
                            message: `Operation ${method.toUpperCase()} ${path} has an empty operationId`,
                            path: `/paths/${path}/${method}/operationId`
                        });
                    }
                }
            });
        });

        return violations;
    }
};
