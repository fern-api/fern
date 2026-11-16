import { relative } from "@fern-api/fs-utils";
import { Rule, RuleViolation } from "../../Rule.js";
import { collectIfRoles } from "./collect-if-roles.js";

export const AllRolesMustBeDeclaredRule: Rule = {
    name: "all-roles-must-be-declared",
    create: (context) => {
        const declaredRoles = context.workspace.config.roles;
        const isDeclared = (role: string) => declaredRoles != null && declaredRoles.includes(role);
        return {
            permissions: (permissions) => {
                const usedRoles = [...(permissions.viewers ?? [])];

                const violations: RuleViolation[] = [];
                for (const usedRole of usedRoles) {
                    if (!isDeclared(usedRole)) {
                        violations.push({
                            severity: "fatal",
                            // TODO: add a link to the docs
                            message: `Role "${usedRole}" is used but not declared at the top level of the docs.yml file.`
                        });
                    }
                }
                return violations;
            },
            markdownPage: ({ content, absoluteFilepath }) => {
                const undeclaredRoles = collectIfRoles(content).filter((role) => !isDeclared(role));
                if (undeclaredRoles.length === 0) {
                    return [];
                }
                const relativeFilepath = relative(context.workspace.absoluteFilePath, absoluteFilepath);
                return undeclaredRoles.map((role) => ({
                    severity: "fatal",
                    relativeFilepath,
                    message: `Role "${role}" is used in an <If> component but not declared at the top level of the docs.yml file.`
                }));
            }
        };
    }
};
