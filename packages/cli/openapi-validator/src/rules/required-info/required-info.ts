import { Rule, RuleContext, RuleViolation } from "../../Rule";

export const RequiredInfoRule: Rule = {
    name: "required-info",
    description: "Validates that the OpenAPI document has required info object with title and version",
    validate: (context: RuleContext): RuleViolation[] => {
        const { document, logger } = context;

        logger.debug(
            `[required-info.ts:validate:7:9] Starting required-info validation | ${JSON.stringify({
                file: "required-info.ts",
                function: "validate",
                line: 7,
                column: 9,
                state: {
                    hasInfo: !!document.info,
                    infoTitle: document.info?.title,
                    infoVersion: document.info?.version
                }
            })}`
        );

        const violations: RuleViolation[] = [];

        if (!document.info) {
            logger.debug(
                `[required-info.ts:validate:25:13] Missing info object | ${JSON.stringify({
                    file: "required-info.ts",
                    function: "validate",
                    line: 25,
                    column: 13,
                    state: { violation: "fatal - missing info object" }
                })}`
            );
            violations.push({
                severity: "fatal",
                message: "[required-info] OpenAPI document must have an 'info' object",
                path: "/"
            });
            return violations;
        }

        if (!document.info.title || document.info.title.trim() === "") {
            logger.debug(
                `[required-info.ts:validate:42:13] Missing or empty title | ${JSON.stringify({
                    file: "required-info.ts",
                    function: "validate",
                    line: 42,
                    column: 13,
                    state: { title: document.info.title, violation: "fatal - missing or empty title" }
                })}`
            );
            violations.push({
                severity: "fatal",
                message: "[required-info] Info object must have a non-empty 'title' field",
                path: "/info"
            });
        }

        if (!document.info.version || document.info.version.trim() === "") {
            logger.debug(
                `[required-info.ts:validate:58:13] Missing or empty version | ${JSON.stringify({
                    file: "required-info.ts",
                    function: "validate",
                    line: 58,
                    column: 13,
                    state: { version: document.info.version, violation: "fatal - missing or empty version" }
                })}`
            );
            violations.push({
                severity: "fatal",
                message: "[required-info] Info object must have a non-empty 'version' field",
                path: "/info"
            });
        }

        logger.debug(
            `[required-info.ts:validate:72:9] Required-info validation complete | ${JSON.stringify({
                file: "required-info.ts",
                function: "validate",
                line: 72,
                column: 9,
                state: {
                    violationCount: violations.length
                }
            })}`
        );

        return violations;
    }
};
