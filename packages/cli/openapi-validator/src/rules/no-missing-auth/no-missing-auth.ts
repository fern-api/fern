import { Rule, RuleContext, RuleViolation } from "../../Rule";

export const NoMissingAuthRule: Rule = {
    name: "no-missing-auth",
    description: "Stubbed from fern-definition validator; not yet implemented or not applicable to OpenAPI",
    DISABLE_RULE: true,
    validate: (_context: RuleContext): RuleViolation[] => {
        return [];
    }
};
