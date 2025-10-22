import { Logger } from "@fern-api/logger";
import { OpenAPIV3_1 } from "openapi-types";
import { ValidationViolation } from "./ValidationViolation";
import { OpenApiValidationOptions } from "./types";
import { getAllEnabledRules } from "./getAllRules";
import { Rule, OpenApiRuleContext, OpenApiRuleViolation } from "./Rule";

export function validateOpenApiDocument(
    document: OpenAPIV3_1.Document,
    logger: Logger,
    options: OpenApiValidationOptions = {}
): ValidationViolation[] {
    const rules = getAllEnabledRules().filter((rule) => rule.validate != null);
    const openApiViolations = runRulesOnDocument({ document, rules, logger, options });
    
    return openApiViolations.map((v) => ({
        severity: v.severity,
        message: v.message,
        relativeFilepath: "openapi.yml" as any,
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
}): OpenApiRuleViolation[] {
    const violations: OpenApiRuleViolation[] = [];
    const context: OpenApiRuleContext = { document, logger, options };

    for (const rule of rules) {
        if (rule.validate) {
            const ruleViolations = rule.validate(context);
            violations.push(...ruleViolations);
        }
    }

    return violations;
}
