import { OpenAPIV3_1 } from "openapi-types";
import { Rule, RuleContext, RuleViolation } from "../../Rule";

export const ValidSchemasRule: Rule = {
    name: "valid-schemas",
    description: "Validates schemas in components have proper structure",
    validate: (context: RuleContext): RuleViolation[] => {
        const violations: RuleViolation[] = [];
        const { document } = context;

        if (!document.components || !document.components.schemas) {
            return violations;
        }

        Object.entries(document.components.schemas).forEach(([schemaName, schema]) => {
            if ("$ref" in schema) {
                return;
            }

            const schemaObj = schema as OpenAPIV3_1.SchemaObject;

            if (schemaObj.type === "object" && schemaObj.properties) {
                Object.entries(schemaObj.properties).forEach(([propName, propSchema]) => {
                    if (typeof propSchema === "object" && !("$ref" in propSchema)) {
                        const prop = propSchema as OpenAPIV3_1.SchemaObject;
                        if (
                            prop.type === undefined &&
                            prop.allOf === undefined &&
                            prop.oneOf === undefined &&
                            prop.anyOf === undefined
                        ) {
                            violations.push({
                                severity: "warning",
                                message: `[valid-schemas] Property '${propName}' in schema '${schemaName}' has no type or composition keyword`,
                                path: `/components/schemas/${schemaName}/properties/${propName}`
                            });
                        }
                    }
                });
            }

            if (schemaObj.enum && Array.isArray(schemaObj.enum)) {
                if (schemaObj.enum.length === 0) {
                    violations.push({
                        severity: "warning",
                        message: `[valid-schemas] Schema '${schemaName}' has an empty enum array`,
                        path: `/components/schemas/${schemaName}/enum`
                    });
                }

                const uniqueValues = new Set(schemaObj.enum);
                if (uniqueValues.size !== schemaObj.enum.length) {
                    violations.push({
                        severity: "error",
                        message: `[valid-schemas] Schema '${schemaName}' has duplicate values in enum`,
                        path: `/components/schemas/${schemaName}/enum`
                    });
                }
            }
        });

        return violations;
    }
};
