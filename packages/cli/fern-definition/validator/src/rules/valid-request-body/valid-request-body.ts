import { Rule, OpenApiRuleContext, OpenApiRuleViolation } from "../../Rule";
import { OpenAPIV3_1 } from "openapi-types";

const HTTP_METHODS = ["get", "put", "post", "delete", "options", "head", "patch", "trace"];

export const ValidRequestBodyRule: Rule = {
    name: "valid-request-body",
    description: "Validates request bodies have required content",
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
                if (!operation || !operation.requestBody) {
                    return;
                }

                if ("$ref" in operation.requestBody) {
                    return;
                }

                const requestBody = operation.requestBody as OpenAPIV3_1.RequestBodyObject;

                if (!requestBody.content || Object.keys(requestBody.content).length === 0) {
                    violations.push({
                        severity: "error",
                        message: `Request body for ${method.toUpperCase()} ${path} must have 'content' with at least one media type`,
                        path: `/paths/${path}/${method}/requestBody`
                    });
                }
            });
        });

        return violations;
    }
};
