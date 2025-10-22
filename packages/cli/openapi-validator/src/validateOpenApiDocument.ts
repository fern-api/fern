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
    const rules = getAllEnabledRules();
    const openApiViolations = runRulesOnDocument({ document, rules, logger, options });

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
    const violations: RuleViolation[] = [];
    const context: RuleContext = { document, logger, options };

    for (const rule of rules) {
        const ruleViolations = rule.validate(context);
        violations.push(...ruleViolations);
    }

    return violations;
}
