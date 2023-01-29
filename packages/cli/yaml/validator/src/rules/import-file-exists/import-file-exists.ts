import { dirname, join, RelativeFilePath } from "@fern-api/fs-utils";
import chalk from "chalk";
import { Rule, RuleViolation } from "../../Rule";

export const ImportFileExistsRule: Rule = {
    name: "import-file-exists",
    create: ({ workspace }) => {
        const absoluteServiceFilePaths = Object.keys(workspace.serviceFiles).map((relativeFilepath) => {
            return join(workspace.absolutePathToDefinition, RelativeFilePath.of(relativeFilepath));
        });
        return {
            serviceFile: {
                import: async ({ importedAs, importPath }, { relativeFilepath }) => {
                    const violations: RuleViolation[] = [];
                    const importAbsoluteFilepath = join(
                        workspace.absolutePathToDefinition,
                        dirname(relativeFilepath),
                        RelativeFilePath.of(importPath)
                    );
                    const serviceFilePresent = absoluteServiceFilePaths.includes(importAbsoluteFilepath);
                    if (!serviceFilePresent) {
                        violations.push({
                            severity: "error",
                            message: `Import ${chalk.bold(importedAs)} points to non-existent path ${chalk.bold(
                                importPath
                            )}.`,
                        });
                    }
                    return violations;
                },
            },
        };
    },
};
