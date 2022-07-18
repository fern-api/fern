import chalk from "chalk";
import { Rule, RuleViolation } from "../../Rule";

export const NoDuplicateIdsRule: Rule = {
    name: "no-duplicate-ids",
    create: () => {
        const names: Record<string, string> = {};
        return {
            id: (id, { relativeFilePath }) => {
                const name = typeof id === "string" ? id : id.name;
                const violations: RuleViolation[] = [];
                if (names[name] != null) {
                    const duplicateMessage =
                        names[name] === relativeFilePath
                            ? `Duplicate lives in same file ${relativeFilePath}`
                            : `Duplicate lives in another file ${relativeFilePath}`;
                    violations.push({
                        severity: "error",
                        message: `Found duplicated id: ${chalk.bold(name)}. ${duplicateMessage}`,
                    });
                } else {
                    names[name] = relativeFilePath;
                }
                return violations;
            },
        };
    },
};
