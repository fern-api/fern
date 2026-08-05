import { Rule, RuleViolation } from "../../Rule.js";

/**
 * `collapsed` and `flattened: true` are mutually exclusive on an API reference.
 *
 * `flattened: true` hoists the API reference's contents into its parent, so the
 * reference has no heading/group of its own left to collapse — a `collapsed`
 * value on the same entry is therefore meaningless. Surface a readable error
 * instead of silently ignoring one of the two.
 */
export const NoCollapsedFlattenedApiReferenceRule: Rule = {
    name: "no-collapsed-flattened-api-reference",
    create: () => {
        return {
            apiSection: ({ config }) => {
                const violations: RuleViolation[] = [];
                if (config.collapsed != null && config.flattened === true) {
                    violations.push({
                        severity: "error",
                        message:
                            "An API reference cannot set both `collapsed` and `flattened: true`. " +
                            "`flattened: true` hoists the API reference's contents into its parent, so there is " +
                            "no API reference group left to collapse. Remove `collapsed` to keep the API " +
                            "reference flattened, or remove `flattened` to render it as its own collapsible group."
                    });
                }
                return violations;
            }
        };
    }
};
