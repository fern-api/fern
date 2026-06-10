import { Rule, RuleViolation } from "../../Rule.js";

export const NoConflictingFeedbackConfigRule: Rule = {
    name: "no-conflicting-feedback-config",
    create: () => {
        return {
            file: async ({ config }) => {
                const violations: RuleViolation[] = [];

                if (config.feedback != null && config.layout?.hideFeedback != null) {
                    violations.push({
                        severity: "error",
                        message:
                            "Cannot use 'layout.hide-feedback' alongside the 'feedback' object. Please move 'hide-feedback' into the 'feedback' object instead."
                    });
                }

                return violations;
            }
        };
    }
};
