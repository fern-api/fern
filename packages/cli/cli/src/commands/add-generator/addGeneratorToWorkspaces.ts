import { loadRawGeneratorsConfiguration } from "@fern-api/generators-configuration";
import { addGenerator, SimpleGeneratorName } from "@fern-api/manage-generator";
import { Project } from "@fern-api/project-loader";
import { TASK_FAILURE } from "@fern-api/task-context";
import chalk from "chalk";
import { writeFile } from "fs/promises";
import yaml from "js-yaml";
import { CliContext } from "../../cli-context/CliContext";

export async function addGeneratorToWorkspaces(
    { workspaces }: Project,
    generatorName: SimpleGeneratorName,
    cliContext: CliContext
): Promise<void> {
    await Promise.all(
        workspaces.map(async (workspace) => {
            await cliContext.runTaskForWorkspace(workspace, async (context) => {
                const generatorsConfiguration = await loadRawGeneratorsConfiguration({
                    absolutePathToWorkspace: workspace.absolutePathToWorkspace,
                });
                const newConfiguration = addGenerator({ generatorName, generatorsConfiguration, context });
                if (newConfiguration !== TASK_FAILURE) {
                    await writeFile(
                        workspace.generatorsConfiguration.absolutePathToConfiguration,
                        yaml.dump(newConfiguration)
                    );
                    context.logger.info(chalk.green(`Added ${generatorName} generator`));
                }
            });
        })
    );
}
