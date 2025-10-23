import { Rule, RuleContext, RuleViolation } from "../../Rule";

export const NoObjectSinglePropertyKeyRule: Rule = {
    name: "no-object-single-property-key",
    description: "Stubbed from fern-definition validator; not yet implemented or not applicable to OpenAPI",
    DISABLE_RULE: true,
    validate: (_context: RuleContext): RuleViolation[] => {
        return [];
    }
};
