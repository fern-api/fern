import { Rule, RuleViolation } from "../../Rule";

export const ValidBasePathRule: Rule = {
    name: "valid-base-path",
    create: () => {
        return {
            rootApiFile: {
                file: (rootApiFile) => {
                    if (rootApiFile["base-path"] != null) {
                        return validateBasePath(rootApiFile["base-path"]);
                    } else {
                        return [];
                    }
                }
            },
            definitionFile: {
                httpService: (service) => {
                    return validateBasePath(service["base-path"]);
                }
            }
        };
    }
};

function validateBasePath(basePath: string): RuleViolation[] {
    if (basePath === "/" || basePath.length === 0) {
        return [];
    }

    const violations: RuleViolation[] = [];

    if (!basePath.startsWith("/")) {
        violations.push({
            severity: "fatal",
            message: "base-path must be empty or start with a slash."
        });
    }

    return violations;
}
