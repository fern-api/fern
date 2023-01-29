import { dirname, join, RelativeFilePath } from "@fern-api/fs-utils";
import chalk from "chalk";
import { Rule, RuleViolation } from "../../Rule";

export const ImportFileExistsRule: Rule = {
    name: "import-file-exists",
    create: ({ workspace }) => {
        const relativePaths = [
            ...Object.keys(workspace.serviceFiles),
            ...Object.keys(workspace.importedServiceFiles),
            ...Object.keys(workspace.packageMarkers),
        ];

        const absolutePaths = new Set<string>();
        relativePaths.forEach((relativeFilepath) => {
            const absolutePath = join(workspace.absolutePathToDefinition, RelativeFilePath.of(relativeFilepath));
            absolutePaths.add(absolutePath);
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
                    const serviceFilePresent = absolutePaths.has(importAbsoluteFilepath);
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
