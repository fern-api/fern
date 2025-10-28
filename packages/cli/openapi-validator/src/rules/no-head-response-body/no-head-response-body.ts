import { OpenAPIV3_1 } from "openapi-types";
import { Rule, RuleContext, RuleViolation } from "../../Rule";

export const NoHeadResponseBodyRule: Rule = {
    name: "no-head-response-body",
    description: "HEAD requests should not have response bodies with content",
    validate: (context: RuleContext): RuleViolation[] => {
        const { document, logger } = context;

        logger.debug(
            `[no-head-response-body.ts:validate:11:9] Starting no-head-response-body validation | ${JSON.stringify({
                file: "no-head-response-body.ts",
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

            if (pathItemObj.head?.responses) {
                for (const [statusCode, response] of Object.entries(pathItemObj.head.responses)) {
                    if ("$ref" in response) {
                        continue;
                    }

                    const responseObj = response as OpenAPIV3_1.ResponseObject;
                    if (responseObj.content && Object.keys(responseObj.content).length > 0) {
                        logger.debug(
                            `[no-head-response-body.ts:validate:46:25] HEAD with response body found | ${JSON.stringify(
                                {
                                    file: "no-head-response-body.ts",
                                    function: "validate",
                                    line: 46,
                                    column: 25,
                                    state: { path, statusCode }
                                }
                            )}`
                        );
                        violations.push({
                            severity: "error",
                            message: `[no-head-response-body] HEAD operation at '${path}' should not have response body content for status ${statusCode}`,
                            path: `${path}/head/responses/${statusCode}/content`
                        });
                    }
                }
            }
        }

        logger.debug(
            `[no-head-response-body.ts:validate:64:9] No-head-response-body validation complete | ${JSON.stringify({
                file: "no-head-response-body.ts",
                function: "validate",
                line: 64,
                column: 9,
                state: {
                    violationCount: violations.length
                }
            })}`
        );

        return violations;
    }
};
