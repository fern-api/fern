import { Rule, RuleViolation } from "../../Rule";

export const ValidEndpointPathRule: Rule = {
    name: "valid-endpoint-path",
    create: () => {
        return {
            serviceFile: {
                httpEndpoint: ({ endpoint }) => {
                    if (endpoint.path === "") {
                        return [];
                    }

                    const violations: RuleViolation[] = [];

                    if (!endpoint.path.startsWith("/")) {
                        violations.push({
                            severity: "error",
                            message: "path must be the empty string, or start with a slash.",
                        });
                    }

                    if (endpoint.path.endsWith("/")) {
                        violations.push({
                            severity: "error",
                            message: "path cannot end with a slash.",
                        });
                    }

                    return violations;
                },
            },
        };
    },
};
