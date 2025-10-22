import type { Logger } from "@fern-api/logger";
import type { OpenAPIV3_1 } from "openapi-types";
import { getAllEnabledRules } from "./getAllRules";
import type { Rule, RuleContext, RuleViolation } from "./Rule";
import type { OpenApiValidationOptions } from "./types";

export interface ValidationViolation {
    severity: "fatal" | "error" | "warning";
    message: string;
    relativeFilepath: string;
    nodePath: string[];
}

export function validateOpenApiDocument(
    document: OpenAPIV3_1.Document,
    logger: Logger,
    options: OpenApiValidationOptions = {}
): ValidationViolation[] {
    logger.debug(
        `[validateOpenApiDocument.ts:validateOpenApiDocument:19:5] Starting validation | ${JSON.stringify({
            file: "validateOpenApiDocument.ts",
            function: "validateOpenApiDocument",
            line: 19,
            column: 5,
            state: {
                documentTitle: document.info?.title,
                documentVersion: document.info?.version,
                openApiVersion: document.openapi,
                pathCount: Object.keys(document.paths || {}).length,
                hasComponents: !!document.components
            }
        })}`
    );

    const rules = getAllEnabledRules();
    logger.debug(
        `[validateOpenApiDocument.ts:validateOpenApiDocument:37:5] Loaded rules | ${JSON.stringify({
            file: "validateOpenApiDocument.ts",
            function: "validateOpenApiDocument",
            line: 37,
            column: 5,
            state: {
                ruleCount: rules.length,
                ruleNames: rules.map((r) => r.name)
            }
        })}`
    );

    const openApiViolations = runRulesOnDocument({ document, rules, logger, options });
    logger.debug(
        `[validateOpenApiDocument.ts:validateOpenApiDocument:49:5] Validation complete | ${JSON.stringify({
            file: "validateOpenApiDocument.ts",
            function: "validateOpenApiDocument",
            line: 49,
            column: 5,
            state: {
                violationCount: openApiViolations.length,
                violationsBySeverity: {
                    fatal: openApiViolations.filter((v) => v.severity === "fatal").length,
                    error: openApiViolations.filter((v) => v.severity === "error").length,
                    warning: openApiViolations.filter((v) => v.severity === "warning").length
                }
            }
        })}`
    );

    return openApiViolations.map((v) => ({
        severity: v.severity,
        message: v.message,
        relativeFilepath: "openapi.yml",
        nodePath: v.path ? [v.path] : []
    }));
}

function runRulesOnDocument({
    document,
    rules,
    logger,
    options
}: {
    document: OpenAPIV3_1.Document;
    rules: Rule[];
    logger: Logger;
    options: OpenApiValidationOptions;
}): RuleViolation[] {
    logger.debug(
        `[validateOpenApiDocument.ts:runRulesOnDocument:86:5] Starting rule execution | ${JSON.stringify({
            file: "validateOpenApiDocument.ts",
            function: "runRulesOnDocument",
            line: 86,
            column: 5,
            state: {
                ruleCount: rules.length
            }
        })}`
    );

    const violations: RuleViolation[] = [];
    const context: RuleContext = { document, logger, options };

    for (const rule of rules) {
        logger.debug(
            `[validateOpenApiDocument.ts:runRulesOnDocument:102:9] Executing rule: ${rule.name} | ${JSON.stringify({
                file: "validateOpenApiDocument.ts",
                function: "runRulesOnDocument",
                line: 102,
                column: 9,
                state: {
                    ruleName: rule.name,
                    currentViolationCount: violations.length
                }
            })}`
        );

        const ruleViolations = rule.validate(context);
        
        logger.debug(
            `[validateOpenApiDocument.ts:runRulesOnDocument:114:9] Rule complete: ${rule.name} | ${JSON.stringify({
                file: "validateOpenApiDocument.ts",
                function: "runRulesOnDocument",
                line: 114,
                column: 9,
                state: {
                    ruleName: rule.name,
                    violationsFound: ruleViolations.length
                }
            })}`
        );

        violations.push(...ruleViolations);
    }

    logger.debug(
        `[validateOpenApiDocument.ts:runRulesOnDocument:128:5] All rules executed | ${JSON.stringify({
            file: "validateOpenApiDocument.ts",
            function: "runRulesOnDocument",
            line: 128,
            column: 5,
            state: {
                totalViolations: violations.length,
                rulesExecuted: rules.length
            }
        })}`
    );

    return violations;
}
