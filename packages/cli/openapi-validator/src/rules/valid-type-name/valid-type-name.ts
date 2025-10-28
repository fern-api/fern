import { Rule, RuleContext, RuleViolation } from "../../Rule";

const ALPHA_REGEX = /^[a-zA-Z]/;

export const ValidTypeNameRule: Rule = {
    name: "valid-type-name",
    description: "Validates that schema names begin with a letter",
    validate: (context: RuleContext): RuleViolation[] => {
        const { document, logger } = context;

        logger.debug(
            `[valid-type-name.ts:validate:12:9] Starting valid-type-name validation | ${JSON.stringify({
                file: "valid-type-name.ts",
                function: "validate",
                line: 12,
                column: 9,
                state: {
                    hasSchemas: !!document.components?.schemas
                }
            })}`
        );

        const violations: RuleViolation[] = [];

        if (!document.components?.schemas) {
            return violations;
        }

        for (const schemaName of Object.keys(document.components.schemas)) {
            if (!ALPHA_REGEX.test(schemaName)) {
                logger.debug(
                    `[valid-type-name.ts:validate:31:17] Invalid schema name found | ${JSON.stringify({
                        file: "valid-type-name.ts",
                        function: "validate",
                        line: 31,
                        column: 17,
                        state: { schemaName }
                    })}`
                );
                violations.push({
                    severity: "error",
                    message: `[valid-type-name] Schema name '${schemaName}' must begin with a letter`,
                    path: `/components/schemas/${schemaName}`
                });
            }
        }

        logger.debug(
            `[valid-type-name.ts:validate:46:9] Valid-type-name validation complete | ${JSON.stringify({
                file: "valid-type-name.ts",
                function: "validate",
                line: 46,
                column: 9,
                state: {
                    violationCount: violations.length
                }
            })}`
        );

        return violations;
    }
};
