import { Rule, RuleViolation } from "../../Rule";

export const AllAudiencesMustBeDeclaredRule: Rule = {
    name: "all-audiences-must-be-declared",
    create: (context) => {
        const declaredAudiences = context.workspace.config.audiences;
        return {
            audience: (audience) => {
                const usedAudiences = typeof audience === "string" ? [audience] : audience;

                const violations: RuleViolation[] = [];
                for (const usedAudience of usedAudiences) {
                    if (declaredAudiences == null || !declaredAudiences.includes(usedAudience)) {
                        violations.push({
                            severity: "error",
                            // TODO: add a link to the docs
                            message: `Audience "${usedAudience}" is used but not declared at the top level of the docs.yml file.`
                        });
                    }
                }
                return violations;
            }
        };
    }
};
