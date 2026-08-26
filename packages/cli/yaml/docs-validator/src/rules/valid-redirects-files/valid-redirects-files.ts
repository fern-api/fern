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
                        // fatal so that generation fails: redirects that could not be read would
                        // otherwise be silently dropped from the published site
                        severity: "fatal",
                        message: error
                    });
                }
                return violations;
            }
        };
    }
};
