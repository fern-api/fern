import { Rule, RuleViolation } from "../../Rule.js";

/**
 * Reports the files that `redirects` referenced but could not be read. Loading happens when the
 * docs configuration is loaded; the errors are reported here so that they are formatted like every
 * other docs violation.
 */
export const ValidRedirectsFilesRule: Rule = {
    name: "valid-redirects-files",
    create: () => {
        return {
            file: async ({ config }) => {
                const violations: RuleViolation[] = [];
                for (const error of config._redirectsFileErrors ?? []) {
                    violations.push({
                        severity: "error",
                        message: error
                    });
                }
                return violations;
            }
        };
    }
};
