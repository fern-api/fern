import { OpenAPIV3_1 } from "openapi-types";
import { Rule, RuleContext, RuleViolation } from "../../Rule";

export const NoDuplicateEnumValuesRule: Rule = {
    name: "no-duplicate-enum-values",
    description: "Enum values should be unique within each schema",
    validate: (context: RuleContext): RuleViolation[] => {
        const { document, logger } = context;

        logger.debug(
            `[no-duplicate-enum-values.ts:validate:11:9] Starting no-duplicate-enum-values validation | ${JSON.stringify(
                {
                    file: "no-duplicate-enum-values.ts",
                    function: "validate",
                    line: 11,
                    column: 9,
                    state: {
                        hasSchemas: !!document.components?.schemas
                    }
                }
            )}`
        );

        const violations: RuleViolation[] = [];

        if (!document.components?.schemas) {
            return violations;
        }

        for (const [schemaName, schema] of Object.entries(document.components.schemas)) {
            if ("$ref" in schema) {
                continue;
            }

            const schemaObj = schema as OpenAPIV3_1.SchemaObject;

            if (schemaObj.enum && Array.isArray(schemaObj.enum)) {
                const seen = new Set();
                const duplicates = new Set();

                for (const value of schemaObj.enum) {
                    const stringValue = JSON.stringify(value);
                    if (seen.has(stringValue)) {
                        duplicates.add(value);
                    }
                    seen.add(stringValue);
                }

                if (duplicates.size > 0) {
                    logger.debug(
                        `[no-duplicate-enum-values.ts:validate:50:21] Duplicate enum values found | ${JSON.stringify({
                            file: "no-duplicate-enum-values.ts",
                            function: "validate",
                            line: 50,
                            column: 21,
                            state: { schemaName, duplicates: Array.from(duplicates) }
                        })}`
                    );
                    violations.push({
                        severity: "error",
                        message: `[no-duplicate-enum-values] Schema '${schemaName}' has duplicate enum values: ${Array.from(duplicates).join(", ")}`,
                        path: `/components/schemas/${schemaName}/enum`
                    });
                }
            }

            if (schemaObj.properties) {
                for (const [propName, propSchema] of Object.entries(schemaObj.properties)) {
                    if (typeof propSchema === "object" && !("$ref" in propSchema)) {
                        const prop = propSchema as OpenAPIV3_1.SchemaObject;
                        if (prop.enum && Array.isArray(prop.enum)) {
                            const seen = new Set();
                            const duplicates = new Set();

                            for (const value of prop.enum) {
                                const stringValue = JSON.stringify(value);
                                if (seen.has(stringValue)) {
                                    duplicates.add(value);
                                }
                                seen.add(stringValue);
                            }

                            if (duplicates.size > 0) {
                                violations.push({
                                    severity: "error",
                                    message: `[no-duplicate-enum-values] Property '${propName}' in schema '${schemaName}' has duplicate enum values: ${Array.from(duplicates).join(", ")}`,
                                    path: `/components/schemas/${schemaName}/properties/${propName}/enum`
                                });
                            }
                        }
                    }
                }
            }
        }

        logger.debug(
            `[no-duplicate-enum-values.ts:validate:96:9] No-duplicate-enum-values validation complete | ${JSON.stringify(
                {
                    file: "no-duplicate-enum-values.ts",
                    function: "validate",
                    line: 96,
                    column: 9,
                    state: {
                        violationCount: violations.length
                    }
                }
            )}`
        );

        return violations;
    }
};
