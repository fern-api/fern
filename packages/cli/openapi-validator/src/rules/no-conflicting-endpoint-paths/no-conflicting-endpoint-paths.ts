import { Rule, RuleContext, RuleViolation } from "../../Rule";

export const NoConflictingEndpointPathsRule: Rule = {
    name: "no-conflicting-endpoint-paths",
    description: "Path templates should not conflict with each other",
    validate: (context: RuleContext): RuleViolation[] => {
        const { document, logger } = context;

        logger.debug(
            `[no-conflicting-endpoint-paths.ts:validate:11:9] Starting no-conflicting-endpoint-paths validation | ${JSON.stringify(
                {
                    file: "no-conflicting-endpoint-paths.ts",
                    function: "validate",
                    line: 11,
                    column: 9,
                    state: {
                        pathCount: Object.keys(document.paths || {}).length
                    }
                }
            )}`
        );

        const violations: RuleViolation[] = [];

        if (!document.paths) {
            return violations;
        }

        const paths = Object.keys(document.paths);
        const normalizedPaths = new Map<string, string[]>();

        for (const path of paths) {
            const normalized = path.replace(/\{[^}]+\}/g, "{param}");
            const existing = normalizedPaths.get(normalized);
            if (existing) {
                existing.push(path);
            } else {
                normalizedPaths.set(normalized, [path]);
            }
        }

        for (const [normalized, originalPaths] of normalizedPaths.entries()) {
            if (originalPaths.length > 1) {
                logger.debug(
                    `[no-conflicting-endpoint-paths.ts:validate:46:17] Conflicting paths found | ${JSON.stringify({
                        file: "no-conflicting-endpoint-paths.ts",
                        function: "validate",
                        line: 46,
                        column: 17,
                        state: { normalized, conflictingPaths: originalPaths }
                    })}`
                );
                violations.push({
                    severity: "error",
                    message: `[no-conflicting-endpoint-paths] Conflicting path templates detected: ${originalPaths.join(", ")}. These paths would match the same URLs.`,
                    path: `/paths`
                });
            }
        }

        logger.debug(
            `[no-conflicting-endpoint-paths.ts:validate:61:9] No-conflicting-endpoint-paths validation complete | ${JSON.stringify(
                {
                    file: "no-conflicting-endpoint-paths.ts",
                    function: "validate",
                    line: 61,
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
