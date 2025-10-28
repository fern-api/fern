import { Rule, RuleContext, RuleViolation } from "../../Rule";

export const ValidPathItemsRule: Rule = {
    name: "valid-path-items",
    description: "Validates path items are properly formatted",
    validate: (context: RuleContext): RuleViolation[] => {
        const violations: RuleViolation[] = [];
        const { document } = context;

        if (!document.paths) {
            return violations;
        }

        Object.entries(document.paths).forEach(([path, pathItem]) => {
            if (!path.startsWith("/")) {
                violations.push({
                    severity: "error",
                    message: `[valid-path-items] Path '${path}' must start with a forward slash`,
                    path: `/paths/${path}`
                });
            }

            const pathParamRegex = /\{([^}]+)\}/g;
            const matches = path.match(pathParamRegex);
            if (matches) {
                matches.forEach((match) => {
                    const paramName = match.slice(1, -1);
                    if (paramName.includes("{") || paramName.includes("}")) {
                        violations.push({
                            severity: "error",
                            message: `[valid-path-items] Path parameter '${paramName}' in path '${path}' contains invalid characters`,
                            path: `/paths/${path}`
                        });
                    }
                });
            }
        });

        return violations;
    }
};
