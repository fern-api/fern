import { generatorsYml } from "@fern-api/configuration";
import { Project } from "@fern-api/project-loader";
import { TaskContext } from "@fern-api/task-context";
import { APIWorkspace } from "@fern-api/workspace-loader";
import chalk from "chalk";
import { writeFile } from "fs/promises";
import yaml from "js-yaml";
import { CliContext } from "../../cli-context/CliContext";

async function upgradeSpecificGroupGenerator({
    context,
    generator,
    group,
    generatorsConfiguration,
    workspace
}: {
    context: TaskContext;
    generator: string;
    group: string;
    generatorsConfiguration: generatorsYml.GeneratorsConfigurationSchema;
    workspace: APIWorkspace;
}) {
    const newConfiguration = await generatorsYml.upgradeGenerator({
        generatorName: generator,
        generatorsConfiguration,
        groupName: group,
        context
    });
    await writeFile(
        workspace.generatorsConfiguration?.absolutePathToConfiguration ??
            generatorsYml.getPathToGeneratorsConfiguration({
                absolutePathToWorkspace: workspace.absoluteFilepath
            }),
        yaml.dump(newConfiguration)
    );
    context.logger.info(chalk.green(`${generator} has been upgraded to latest in group: ${group}`));
}

export async function upgradeGenerator({
    cliContext,
    generator,
    group,
    project: { apiWorkspaces }
}: {
    cliContext: CliContext;
    generator: string | undefined;
    group: string | undefined;
    project: Project;
}): Promise<void> {
    await Promise.all(
        apiWorkspaces.map(async (workspace) => {
            await cliContext.runTaskForWorkspace(workspace, async (context) => {
                const generatorsConfiguration =
                    (await generatorsYml.loadRawGeneratorsConfiguration({
                        absolutePathToWorkspace: workspace.absoluteFilepath,
                        context
                    })) ?? {};
                if (generatorsConfiguration == null || generatorsConfiguration.groups == null) {
                    return;
                }
                if (generator != null && group != null) {
                    await upgradeSpecificGroupGenerator({
                        generator,
                        generatorsConfiguration,
                        group,
                        context,
                        workspace
                    });
                } else {
                    // loop through groups and generators
                    for (const [groupName, groupSchema] of Object.entries(generatorsConfiguration.groups)) {
                        for (const generatorSchema of groupSchema.generators) {
                            // If you've specified a generator, check if it's a match before upgrading
                            if (generator != null && generator !== generatorSchema.name) {
                                continue;
                            }

                            await upgradeSpecificGroupGenerator({
                                generator: generatorSchema.name,
                                group: groupName,
                                generatorsConfiguration,
                                context,
                                workspace
                            });
                        }
                    }
                }
            });
        })
    );
}
