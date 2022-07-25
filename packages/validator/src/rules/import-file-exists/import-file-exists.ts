import { doesPathExist } from "@fern-api/core-utils";
import chalk from "chalk";
import path from "path";
import { Rule, RuleViolation } from "../../Rule";

export const ImportFileExistsRule: Rule = {
    name: "imxport-file-exists",
    create: ({ workspace }) => {
        return {
            import: async ({ importKey, importPath }, { relativeFilePath }) => {
                const violations: RuleViolation[] = [];
                const importedFilePath = path.join(workspace.absolutePath, path.dirname(relativeFilePath), importPath);
                const fileExists = await doesPathExist(importedFilePath);
                if (!fileExists) {
                    violations.push({
                        severity: "error",
                        message: `Import ${chalk.bold(importKey)} points to non-existent path ${chalk.bold(
                            importPath
                        )}.`,
                    });
                }
                return violations;
            },
        };
    },
};
