import { Rule, RuleViolation } from "../../Rule";

export const ValidEndpointPathRule: Rule = {
    name: "valid-endpoint-path",
    create: () => {
        return {
            definitionFile: {
                httpEndpoint: ({ endpoint }) => {
                    if (endpoint.path === "") {
                        return [];
                    }

                    const violations: RuleViolation[] = [];

                    if (!endpoint.path.startsWith("/")) {
                        violations.push({
                            severity: "fatal",
                            message: "Path must start with a slash."
                        });
                    }

                    return violations;
                }
            }
        };
    }
};
