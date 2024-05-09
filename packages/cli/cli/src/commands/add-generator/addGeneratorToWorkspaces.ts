import { generatorsYml } from "@fern-api/configuration";
import { Project } from "@fern-api/project-loader";
import chalk from "chalk";
import { writeFile } from "fs/promises";
import yaml from "js-yaml";
import { CliContext } from "../../cli-context/CliContext";

export async function addGeneratorToWorkspaces({
    project: { apiWorkspaces },
    generatorName,
    groupName,
    cliContext
}: {
    project: Project;
    generatorName: string;
    groupName: string | undefined;
    cliContext: CliContext;
}): Promise<void> {
    await Promise.all(
        apiWorkspaces.map(async (workspace) => {
            await cliContext.runTaskForWorkspace(workspace, async (context) => {
                const generatorsConfiguration =
                    (await generatorsYml.loadRawGeneratorsConfiguration({
                        absolutePathToWorkspace: workspace.absoluteFilepath,
                        context
                    })) ?? {};

                const newConfiguration = await generatorsYml.addGenerator({
                    generatorName,
                    generatorsConfiguration,
                    groupName,
                    context
                });

                await writeFile(
                    workspace.generatorsConfiguration?.absolutePathToConfiguration ??
                        generatorsYml.getPathToGeneratorsConfiguration({
                            absolutePathToWorkspace: workspace.absoluteFilepath
                        }),
                    yaml.dump(newConfiguration)
                );
                context.logger.info(chalk.green(`Added ${generatorName} generator`));
            });
        })
    );
}
