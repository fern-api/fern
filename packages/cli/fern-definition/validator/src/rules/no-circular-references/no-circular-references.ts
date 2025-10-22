import { Rule, OpenApiRuleContext, OpenApiRuleViolation } from "../../Rule";
import { OpenAPIV3_1 } from "openapi-types";

export const NoCircularReferencesRule: Rule = {
    name: "no-circular-references",
    description: "Detects circular references in schemas",
    validate: (context: OpenApiRuleContext): OpenApiRuleViolation[] => {
        const violations: OpenApiRuleViolation[] = [];
        const { document } = context;

        if (!document.components || !document.components.schemas) {
            return violations;
        }

        const visited = new Set<string>();
        const recursionStack = new Set<string>();

        const detectCircular = (schemaName: string, path: string[]): boolean => {
            if (recursionStack.has(schemaName)) {
                violations.push({
                    severity: "error",
                    message: `Circular reference detected: ${path.join(" -> ")} -> ${schemaName}`,
                    path: `/components/schemas/${schemaName}`
                });
                return true;
            }

            if (visited.has(schemaName)) {
                return false;
            }

            visited.add(schemaName);
            recursionStack.add(schemaName);

            const schema = document.components!.schemas![schemaName];
            if (!schema || "$ref" in schema) {
                recursionStack.delete(schemaName);
                return false;
            }

            const schemaObj = schema as OpenAPIV3_1.SchemaObject;

            const checkRefs = (obj: any) => {
                if (!obj || typeof obj !== "object") {
                    return;
                }

                if ("$ref" in obj) {
                    const ref = obj.$ref as string;
                    if (ref.startsWith("#/components/schemas/")) {
                        const refSchemaName = ref.split("/").pop()!;
                        detectCircular(refSchemaName, [...path, schemaName]);
                    }
                    return;
                }

                if (Array.isArray(obj)) {
                    obj.forEach(checkRefs);
                } else {
                    Object.values(obj).forEach(checkRefs);
                }
            };

            checkRefs(schemaObj);

            recursionStack.delete(schemaName);
            return false;
        };

        Object.keys(document.components.schemas).forEach((schemaName) => {
            if (!visited.has(schemaName)) {
                detectCircular(schemaName, []);
            }
        });

        return violations;
    }
};
