import { Rule, RuleViolation } from "../../Rule.js";

export const NavigationConflicts: Rule = {
    name: "navigation-conflicts",
    create: () => {
        return {
            file: async ({ config }) => {
                const violations: RuleViolation[] = [];
                if (config.navigation != null && config.versions != null) {
                    violations.push({
                        severity: "fatal",
                        message:
                            "Cannot contain both navigation and versions. If you want versioned docs, use versions. Otherwise use navigation."
                    });
                }
                if (config.navigation != null && config.products != null) {
                    violations.push({
                        severity: "fatal",
                        message:
                            "Cannot contain both navigation and products. If you want multi-product docs, define navigation inside each product file. Otherwise use navigation."
                    });
                }
                return violations;
            }
        };
    }
};
