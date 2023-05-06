import { dirname, join, RelativeFilePath } from "@fern-api/fs-utils";
import { getAllDefinitionFiles } from "@fern-api/workspace-loader";
import chalk from "chalk";
import { Rule, RuleViolation } from "../../Rule";

export const ImportFileExistsRule: Rule = {
    name: "import-file-exists",
    create: ({ workspace }) => {
        const relativePaths = Object.keys(getAllDefinitionFiles(workspace.definition));

        const absolutePaths = new Set<string>();
        relativePaths.forEach((relativeFilepath) => {
            const absolutePath = join(workspace.absoluteFilepath, RelativeFilePath.of(relativeFilepath));
            absolutePaths.add(absolutePath);
        });

        return {
            definitionFile: {
                import: async ({ importedAs, importPath }, { relativeFilepath }) => {
                    const violations: RuleViolation[] = [];
                    const importAbsoluteFilepath = join(
                        workspace.definition.absoluteFilepath,
                        dirname(relativeFilepath),
                        RelativeFilePath.of(importPath)
                    );
                    const isDefinitionFilePresent = absolutePaths.has(importAbsoluteFilepath);
                    if (!isDefinitionFilePresent) {
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
