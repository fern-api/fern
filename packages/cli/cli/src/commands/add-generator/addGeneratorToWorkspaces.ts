import { loadRawGeneratorsConfiguration } from "@fern-api/generators-configuration";
import { addDocsToWorkspace } from "@fern-api/manage-docs-configuration";
import { addGenerator } from "@fern-api/manage-generator";
import { Project } from "@fern-api/project-loader";
import chalk from "chalk";
import { writeFile } from "fs/promises";
import yaml from "js-yaml";
import { CliContext } from "../../cli-context/CliContext";

export async function addGeneratorToWorkspaces({
    project: { workspaces, config },
    generatorName,
    groupName,
    cliContext,
}: {
    project: Project;
    generatorName: string;
    groupName: string | undefined;
    cliContext: CliContext;
}): Promise<void> {
    await Promise.all(
        workspaces.map(async (workspace) => {
            await cliContext.runTaskForWorkspace(workspace, async (context) => {
                if (generatorName === "docs") {
                    await addDocsToWorkspace({
                        organization: config.organization,
                        workspace,
                        groupName,
                        context,
                    });
                    return;
                }

                const generatorsConfiguration = await loadRawGeneratorsConfiguration({
                    absolutePathToWorkspace: workspace.absoluteFilepath,
                    context,
                });

                const newConfiguration = addGenerator({ generatorName, generatorsConfiguration, groupName, context });
                await writeFile(
                    workspace.generatorsConfiguration.absolutePathToConfiguration,
                    yaml.dump(newConfiguration)
                );
                context.logger.info(chalk.green(`Added ${generatorName} generator`));
            });
        })
    );
}
