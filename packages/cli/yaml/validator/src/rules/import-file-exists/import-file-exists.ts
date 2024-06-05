import { dirname, join, RelativeFilePath } from "@fern-api/fs-utils";
import { getAllDefinitionFiles } from "@fern-api/workspace-loader";
import chalk from "chalk";
import { Rule, RuleViolation } from "../../Rule";

export const ImportFileExistsRule: Rule = {
    name: "import-file-exists",
    create: async ({ workspace }) => {
        const workspaceDefinition = await workspace.getDefinition();
        const relativePaths = Object.keys(getAllDefinitionFiles(workspaceDefinition));

        const absolutePaths = new Set<string>();
        relativePaths.forEach((relativeFilepath) => {
            const absolutePath = join(workspaceDefinition.absoluteFilepath, RelativeFilePath.of(relativeFilepath));
            absolutePaths.add(absolutePath);
        });

        return {
            definitionFile: {
                import: async ({ importedAs, importPath }, { relativeFilepath }) => {
                    const violations: RuleViolation[] = [];
                    const importAbsoluteFilepath = join(
                        workspaceDefinition.absoluteFilepath,
                        dirname(relativeFilepath),
                        RelativeFilePath.of(importPath)
                    );
                    const isDefinitionFilePresent = absolutePaths.has(importAbsoluteFilepath);
                    if (!isDefinitionFilePresent) {
                        violations.push({
                            severity: "error",
                            message: `Import ${chalk.bold(importedAs)} points to non-existent path ${chalk.bold(
                                importPath
                            )}.`
                        });
                    }
                    return violations;
                }
            }
        };
    }
};
