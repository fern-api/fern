import { Rule, RuleContext, RuleViolation } from "../../Rule";

export const NoComplexQueryParamsRule: Rule = {
    name: "no-complex-query-params",
    description: "Stubbed from fern-definition validator; not yet implemented or not applicable to OpenAPI",
    DISABLE_RULE: true,
    validate: (_context: RuleContext): RuleViolation[] => {
        return [];
    }
};
