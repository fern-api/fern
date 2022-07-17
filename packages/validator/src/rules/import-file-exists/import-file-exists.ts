import chalk from "chalk";
import { lstat } from "fs/promises";
import path from "path";
import { Rule, RuleViolation } from "../../Rule";

export const ImportFileExistsRule: Rule = {
    name: "imxport-file-exists",
    create: async () => {
        return {
            import: async ({ importKey, importPath }, { absoluteFilePath }) => {
                const violations: RuleViolation[] = [];
                const importedFilePath = path.join(absoluteFilePath, importPath);
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

async function doesPathExist(filepath: string): Promise<boolean> {
    try {
        await lstat(filepath);
        return true;
    } catch {
        return false;
    }
}
