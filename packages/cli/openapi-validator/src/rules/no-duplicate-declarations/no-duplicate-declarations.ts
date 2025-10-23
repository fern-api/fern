import { Rule, RuleContext, RuleViolation } from "../../Rule";

export const NoDuplicateDeclarationsRule: Rule = {
    name: "no-duplicate-declarations",
    description: "Stubbed from fern-definition validator; not yet implemented or not applicable to OpenAPI",
    DISABLE_RULE: true,
    validate: (_context: RuleContext): RuleViolation[] => {
        return [];
    }
};
