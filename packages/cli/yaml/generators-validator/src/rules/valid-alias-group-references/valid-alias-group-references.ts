import { Rule, RuleViolation } from "../../Rule";

export const ValidAliasGroupReferencesRule: Rule = {
    name: "valid-alias-group-references",
    create: async () => {
        return {
            generatorsYml: {
                file: async (contents) => {
                    const violations: RuleViolation[] = [];
                    const aliases = contents.aliases;
                    const groups = contents.groups ?? {};

                    if (aliases == null) {
                        return violations;
                    }

                    const definedGroupNames = new Set(Object.keys(groups));

                    for (const [aliasName, groupNames] of Object.entries(aliases)) {
                        if (!Array.isArray(groupNames)) {
                            continue;
                        }
                        for (const groupName of groupNames) {
                            if (!definedGroupNames.has(groupName)) {
                                violations.push({
                                    severity: "error",
                                    message: `Alias "${aliasName}" references unknown group "${groupName}". Available groups: ${[...definedGroupNames].join(", ") || "none"}`
                                });
                            }
                        }
                    }

                    return violations;
                }
            }
        };
    }
};
