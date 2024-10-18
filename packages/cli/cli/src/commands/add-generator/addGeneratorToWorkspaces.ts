import { AbstractAPIWorkspace } from "@fern-api/api-workspace-commons";
import { generatorsYml } from "@fern-api/configuration";
import { GeneratorInvocationOverride } from "@fern-api/configuration/src/generators-yml/addGenerator";
import { TaskContext } from "@fern-api/task-context";
import { Project } from "@fern-api/project-loader";
import chalk from "chalk";
import { writeFile } from "fs/promises";
import yaml from "js-yaml";
import { CliContext } from "../../cli-context/CliContext";

export async function addGeneratorToWorkspaces({
    project: { apiWorkspaces },
    generatorName,
    groupName,
    cliContext,
    invocation
}: {
    project: Project;
    generatorName: string;
    groupName: string | undefined;
    cliContext: CliContext;
    invocation?: GeneratorInvocationOverride;
}): Promise<void> {
    await Promise.all(
        apiWorkspaces.map(async (workspace) => {
            await cliContext.runTaskForWorkspace(workspace, async (context) => {
                await addGeneratorToWorkspace({
                    workspace,
                    generatorName,
                    groupName,
                    context,
                    invocation,
                    cliVersion: cliContext.environment.packageVersion
                });
                context.logger.info(chalk.green(`Added ${generatorName} generator`));
            });
        })
    );
}
export async function addGeneratorToWorkspace({
    workspace,
    generatorName,
    groupName,
    context,
    invocation,
    cliVersion
}: {
    workspace: AbstractAPIWorkspace<unknown>;
    generatorName: string;
    groupName: string | undefined;
    context: TaskContext;
    invocation?: GeneratorInvocationOverride;
    cliVersion: string;
}): Promise<void> {
    const generatorsConfiguration =
        (await generatorsYml.loadRawGeneratorsConfiguration({
            absolutePathToWorkspace: workspace.absoluteFilePath,
            context
        })) ?? {};

    const newConfiguration = await generatorsYml.addGenerator({
        generatorName,
        generatorsConfiguration,
        groupName,
        context,
        cliVersion,
        invocationOverride: invocation
    });

    await writeFile(
        workspace.generatorsConfiguration?.absolutePathToConfiguration ??
            generatorsYml.getPathToGeneratorsConfiguration({
                absolutePathToWorkspace: workspace.absoluteFilePath
            }),
        yaml.dump(newConfiguration)
    );
}
