import { Rule, RuleViolation } from "../../Rule";

export const ValidBasePathRule: Rule = {
    name: "valid-base-path",
    create: () => {
        return {
            serviceFile: {
                httpService: (service) => {
                    if (service["base-path"] === "/" || service["base-path"].length === 0) {
                        return [];
                    }

                    const violations: RuleViolation[] = [];

                    if (!service["base-path"].startsWith("/")) {
                        violations.push({
                            severity: "error",
                            message: "base-path must be empty or start with a slash.",
                        });
                    }

                    if (service["base-path"].endsWith("/")) {
                        violations.push({
                            severity: "error",
                            message: "base-path cannot end with a slash.",
                        });
                    }

                    return violations;
                },
            },
        };
    },
};
