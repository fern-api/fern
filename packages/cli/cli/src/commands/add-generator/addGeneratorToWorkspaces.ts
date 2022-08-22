import { loadRawGeneratorsConfiguration } from "@fern-api/generators-configuration";
import { getGeneratorInvocationFromSimpleName, SimpleGeneratorName } from "@fern-api/manage-generator";
import chalk from "chalk";
import { writeFile } from "fs/promises";
import produce from "immer";
import yaml from "js-yaml";
import { CliContext } from "../../cli-context/CliContext";
import { Project } from "../../loadProject";

export async function addGeneratorToWorkspaces(
    { workspaces }: Project,
    generatorName: SimpleGeneratorName,
    cliContext: CliContext
): Promise<void> {
    await Promise.all(
        workspaces.map(async (workspace) => {
            await cliContext.runTaskForWorkspace(workspace, async (context) => {
                const invocation = getGeneratorInvocationFromSimpleName({
                    simpleName: generatorName,
                });

                const generatorsConfiguration = await loadRawGeneratorsConfiguration({
                    absolutePathToWorkspace: workspace.absolutePathToWorkspace,
                });
                if (generatorsConfiguration.generators.some((generator) => generator.name === invocation.name)) {
                    context.logger.error(`${generatorName} is already installed.`);
                    context.fail();
                } else {
                    const newConfiguration = produce(generatorsConfiguration, (draft) => {
                        draft.generators.push(invocation);
                    });
                    await writeFile(
                        workspace.generatorsConfiguration.absolutePathToConfiguration,
                        yaml.dump(newConfiguration)
                    );
                    context.logger.info(chalk.green(`Added generator ${invocation.name}@${invocation.version}`));
                }
            });
        })
    );
}
