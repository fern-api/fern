import { OpenAPIV3_1 } from "openapi-types";
import { Rule, RuleContext, RuleViolation } from "../../Rule";

export const NoGetRequestBodyRule: Rule = {
    name: "no-get-request-body",
    description: "GET and HEAD requests should not have request bodies",
    validate: (context: RuleContext): RuleViolation[] => {
        const { document, logger } = context;

        logger.debug(
            `[no-get-request-body.ts:validate:11:9] Starting no-get-request-body validation | ${JSON.stringify({
                file: "no-get-request-body.ts",
                function: "validate",
                line: 11,
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

        for (const [path, pathItem] of Object.entries(document.paths)) {
            if (!pathItem || "$ref" in pathItem) {
                continue;
            }

            const pathItemObj = pathItem as OpenAPIV3_1.PathItemObject;

            if (pathItemObj.get?.requestBody) {
                logger.debug(
                    `[no-get-request-body.ts:validate:38:17] GET with request body found | ${JSON.stringify({
                        file: "no-get-request-body.ts",
                        function: "validate",
                        line: 38,
                        column: 17,
                        state: { path, method: "GET" }
                    })}`
                );
                violations.push({
                    severity: "error",
                    message: `[no-get-request-body] GET operation at '${path}' should not have a request body`,
                    path: `${path}/get/requestBody`
                });
            }

            if (pathItemObj.head?.requestBody) {
                logger.debug(
                    `[no-get-request-body.ts:validate:55:17] HEAD with request body found | ${JSON.stringify({
                        file: "no-get-request-body.ts",
                        function: "validate",
                        line: 55,
                        column: 17,
                        state: { path, method: "HEAD" }
                    })}`
                );
                violations.push({
                    severity: "error",
                    message: `[no-get-request-body] HEAD operation at '${path}' should not have a request body`,
                    path: `${path}/head/requestBody`
                });
            }
        }

        logger.debug(
            `[no-get-request-body.ts:validate:71:9] No-get-request-body validation complete | ${JSON.stringify({
                file: "no-get-request-body.ts",
                function: "validate",
                line: 71,
                column: 9,
                state: {
                    violationCount: violations.length
                }
            })}`
        );

        return violations;
    }
};
