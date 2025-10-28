import { OpenAPIV3_1 } from "openapi-types";
import { Rule, RuleContext, RuleViolation } from "../../Rule";

const HTTP_METHODS = ["get", "put", "post", "delete", "options", "head", "patch", "trace"];

export const ValidParametersRule: Rule = {
    name: "valid-parameters",
    description: "Validates parameters have required fields",
    validate: (context: RuleContext): RuleViolation[] => {
        const violations: RuleViolation[] = [];
        const { document } = context;

        if (!document.paths) {
            return violations;
        }

        const validateParameters = (
            parameters: (OpenAPIV3_1.ParameterObject | OpenAPIV3_1.ReferenceObject)[] | undefined,
            basePath: string
        ) => {
            if (!parameters) {
                return;
            }

            parameters.forEach((param, index) => {
                if ("$ref" in param) {
                    return;
                }

                const parameter = param as OpenAPIV3_1.ParameterObject;

                if (!parameter.name || parameter.name.trim() === "") {
                    violations.push({
                        severity: "fatal",
                        message: "[valid-parameters] Parameter must have a non-empty 'name' field",
                        path: `${basePath}/parameters/${index}`
                    });
                }

                if (!parameter.in) {
                    violations.push({
                        severity: "fatal",
                        message: `[valid-parameters] Parameter '${parameter.name}' must have an 'in' field`,
                        path: `${basePath}/parameters/${index}`
                    });
                } else if (!["query", "header", "path", "cookie"].includes(parameter.in)) {
                    violations.push({
                        severity: "error",
                        message: `[valid-parameters] Parameter '${parameter.name}' has invalid 'in' value: ${parameter.in}`,
                        path: `${basePath}/parameters/${index}/in`
                    });
                }

                if (parameter.in === "path" && !parameter.required) {
                    violations.push({
                        severity: "error",
                        message: `[valid-parameters] Path parameter '${parameter.name}' must have required: true`,
                        path: `${basePath}/parameters/${index}`
                    });
                }

                if (!parameter.schema && !parameter.content) {
                    violations.push({
                        severity: "error",
                        message: `[valid-parameters] Parameter '${parameter.name}' must have either 'schema' or 'content'`,
                        path: `${basePath}/parameters/${index}`
                    });
                }
            });
        };

        Object.entries(document.paths).forEach(([path, pathItem]) => {
            if (!pathItem || typeof pathItem === "string") {
                return;
            }

            validateParameters(pathItem.parameters, `/paths/${path}`);

            HTTP_METHODS.forEach((method) => {
                const operation = (pathItem as Record<string, unknown>)[method] as
                    | OpenAPIV3_1.OperationObject
                    | undefined;
                if (operation) {
                    validateParameters(operation.parameters, `/paths/${path}/${method}`);
                }
            });
        });

        return violations;
    }
};
