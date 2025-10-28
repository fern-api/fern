import { OpenAPIV3_1 } from "openapi-types";
import { Rule, RuleContext, RuleViolation } from "../../Rule";

export const NoDuplicateFieldNamesRule: Rule = {
    name: "no-duplicate-field-names",
    description: "Validates that object schemas do not have duplicate property names",
    validate: (context: RuleContext): RuleViolation[] => {
        const { document, logger } = context;

        logger.debug(
            `[no-duplicate-field-names.ts:validate:11:9] Starting no-duplicate-field-names validation | ${JSON.stringify(
                {
                    file: "no-duplicate-field-names.ts",
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

            if (schemaObj.properties) {
                const propertyNames = Object.keys(schemaObj.properties);
                const seen = new Set<string>();
                const duplicates = new Set<string>();

                for (const propName of propertyNames) {
                    const lowerName = propName.toLowerCase();
                    if (seen.has(lowerName)) {
                        duplicates.add(propName);
                    }
                    seen.add(lowerName);
                }

                if (duplicates.size > 0) {
                    logger.debug(
                        `[no-duplicate-field-names.ts:validate:50:21] Duplicate property names found | ${JSON.stringify(
                            {
                                file: "no-duplicate-field-names.ts",
                                function: "validate",
                                line: 50,
                                column: 21,
                                state: { schemaName, duplicates: Array.from(duplicates) }
                            }
                        )}`
                    );
                    violations.push({
                        severity: "error",
                        message: `[no-duplicate-field-names] Schema '${schemaName}' has duplicate property names (case-insensitive): ${Array.from(duplicates).join(", ")}`,
                        path: `/components/schemas/${schemaName}/properties`
                    });
                }
            }

            if (schemaObj.oneOf) {
                const discriminatorProp = schemaObj.discriminator?.propertyName;
                if (discriminatorProp) {
                    for (let i = 0; i < schemaObj.oneOf.length; i++) {
                        const variant = schemaObj.oneOf[i];
                        if (!variant || "$ref" in variant) {
                            continue;
                        }
                        const variantObj = variant as OpenAPIV3_1.SchemaObject;
                        if (variantObj.properties && discriminatorProp in variantObj.properties) {
                            violations.push({
                                severity: "error",
                                message: `[no-duplicate-field-names] Discriminator property '${discriminatorProp}' conflicts with property in oneOf variant ${i} of schema '${schemaName}'`,
                                path: `/components/schemas/${schemaName}/oneOf/${i}`
                            });
                        }
                    }
                }
            }
        }

        logger.debug(
            `[no-duplicate-field-names.ts:validate:91:9] No-duplicate-field-names validation complete | ${JSON.stringify(
                {
                    file: "no-duplicate-field-names.ts",
                    function: "validate",
                    line: 91,
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
