import { OpenAPIV3_1 } from "openapi-types";
import { Rule, RuleContext, RuleViolation } from "../../Rule";

const HTTP_METHODS = ["get", "put", "post", "delete", "options", "head", "patch", "trace"];

export const ValidExamplesRule: Rule = {
    name: "valid-examples",
    description: "Validates examples when validateExamples option is enabled",
    validate: (context: RuleContext): RuleViolation[] => {
        const violations: RuleViolation[] = [];
        const { document, options } = context;

        if (!options.validateExamples) {
            return violations;
        }

        const validateExample = (example: unknown, schemaType: string | undefined, path: string) => {
            if (example === undefined || example === null) {
                return;
            }

            if (schemaType === "string" && typeof example !== "string") {
                violations.push({
                    severity: "warning",
                    message: `[valid-examples] Example value type mismatch: expected string, got ${typeof example}`,
                    path
                });
            } else if (schemaType === "number" && typeof example !== "number") {
                violations.push({
                    severity: "warning",
                    message: `[valid-examples] Example value type mismatch: expected number, got ${typeof example}`,
                    path
                });
            } else if (schemaType === "integer" && (!Number.isInteger(example) || typeof example !== "number")) {
                violations.push({
                    severity: "warning",
                    message: `[valid-examples] Example value type mismatch: expected integer, got ${typeof example}`,
                    path
                });
            } else if (schemaType === "boolean" && typeof example !== "boolean") {
                violations.push({
                    severity: "warning",
                    message: `[valid-examples] Example value type mismatch: expected boolean, got ${typeof example}`,
                    path
                });
            } else if (schemaType === "array" && !Array.isArray(example)) {
                violations.push({
                    severity: "warning",
                    message: `[valid-examples] Example value type mismatch: expected array, got ${typeof example}`,
                    path
                });
            } else if (schemaType === "object" && (typeof example !== "object" || Array.isArray(example))) {
                violations.push({
                    severity: "warning",
                    message: `[valid-examples] Example value type mismatch: expected object, got ${typeof example}`,
                    path
                });
            }
        };

        if (document.components?.schemas) {
            Object.entries(document.components.schemas).forEach(([schemaName, schema]) => {
                if ("$ref" in schema) {
                    return;
                }

                const schemaObj = schema as OpenAPIV3_1.SchemaObject;
                if (schemaObj.example !== undefined) {
                    const type = Array.isArray(schemaObj.type) ? schemaObj.type[0] : schemaObj.type;
                    validateExample(schemaObj.example, type, `/components/schemas/${schemaName}/example`);
                }
            });
        }

        return violations;
    }
};
