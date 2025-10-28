import { Rule, RuleContext, RuleViolation } from "../../Rule";

export const ValidEndpointPathRule: Rule = {
    name: "valid-endpoint-path",
    description: "Validates that endpoint paths start with a slash",
    validate: (context: RuleContext): RuleViolation[] => {
        const { document, logger } = context;

        logger.debug(
            `[valid-endpoint-path.ts:validate:10:9] Starting valid-endpoint-path validation | ${JSON.stringify({
                file: "valid-endpoint-path.ts",
                function: "validate",
                line: 10,
                column: 9,
                state: {
                    pathCount: Object.keys(document.paths || {}).length
                }
            })}`
        );

        const violations: RuleViolation[] = [];

        if (!document.paths) {
            return violations;
        }

        for (const path of Object.keys(document.paths)) {
            if (path !== "" && !path.startsWith("/")) {
                logger.debug(
                    `[valid-endpoint-path.ts:validate:29:17] Invalid path found | ${JSON.stringify({
                        file: "valid-endpoint-path.ts",
                        function: "validate",
                        line: 29,
                        column: 17,
                        state: { path }
                    })}`
                );
                violations.push({
                    severity: "error",
                    message: `[valid-endpoint-path] Path '${path}' must start with a slash`,
                    path: `/paths/${path}`
                });
            }
        }

        logger.debug(
            `[valid-endpoint-path.ts:validate:45:9] Valid-endpoint-path validation complete | ${JSON.stringify({
                file: "valid-endpoint-path.ts",
                function: "validate",
                line: 45,
                column: 9,
                state: {
                    violationCount: violations.length
                }
            })}`
        );

        return violations;
    }
};
