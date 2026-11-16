import { relative } from "@fern-api/fs-utils";
import { Rule, RuleViolation } from "../../Rule.js";
import { collectIfRoles } from "./collect-if-roles.js";

export const AllRolesMustBeDeclaredRule: Rule = {
    name: "all-roles-must-be-declared",
    create: (context) => {
        const declaredRoles = context.workspace.config.roles;
        return {
            permissions: (permissions) => {
                return getUndeclaredRoles([...(permissions.viewers ?? [])], declaredRoles).map(
                    (usedRole): RuleViolation => ({
                        severity: "fatal",
                        // TODO: add a link to the docs
                        message: `Role "${usedRole}" is used but not declared at the top level of the docs.yml file.`
                    })
                );
            },
            markdownPage: ({ content, absoluteFilepath }) => {
                const undeclaredRoles = getUndeclaredRoles(collectIfRoles(content), declaredRoles);
                if (undeclaredRoles.length === 0) {
                    return [];
                }
                const relativeFilepath = relative(context.workspace.absoluteFilePath, absoluteFilepath);
                return undeclaredRoles.map(
                    (role): RuleViolation => ({
                        severity: "fatal",
                        relativeFilepath,
                        message: `Role "${role}" is used in an <If> component but not declared at the top level of the docs.yml file.`
                    })
                );
            }
        };
    }
};

export function getUndeclaredRoles(
    usedRoles: readonly string[],
    declaredRoles: readonly string[] | undefined
): string[] {
    return usedRoles.filter((role) => declaredRoles == null || !declaredRoles.includes(role));
}
