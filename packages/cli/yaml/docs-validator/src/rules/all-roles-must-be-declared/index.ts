import { Rule, RuleViolation } from "../../Rule";

export const AllRolesMustBeDeclaredRule: Rule = {
    name: "all-roles-must-be-declared",
    create: (context) => {
        const declaredRoles = context.workspace.config.roles;
        return {
            permissions: (permissions) => {
                const usedRoles = [...(permissions.viewers ?? [])];

                const violations: RuleViolation[] = [];
                for (const usedRole of usedRoles) {
                    if (declaredRoles == null || !declaredRoles.includes(usedRole)) {
                        violations.push({
                            severity: "fatal",
                            // TODO: add a link to the docs
                            message: `Role "${usedRole}" is used but not declared at the top level of the docs.yml file.`
                        });
                    }
                }
                return violations;
            }
        };
    }
};
