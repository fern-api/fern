import { generatorsYml, loadGeneratorsConfiguration } from "@fern-api/configuration-loader";
import { Project } from "@fern-api/project-loader";

import { CliContext } from "../../cli-context/CliContext";

export async function getGeneratorMetadata({
    cliContext,
    generatorFilter,
    groupFilter,
    apiFilter,
    project: { apiWorkspaces }
}: {
    cliContext: CliContext;
    generatorFilter: string;
    groupFilter: string;
    apiFilter: string | undefined;
    project: Project;
}): Promise<generatorsYml.GeneratorInvocation | undefined> {
    let maybeGenerator: generatorsYml.GeneratorInvocation | undefined;
    await Promise.all(
        apiWorkspaces.map(async (workspace) => {
            await cliContext.runTaskForWorkspace(workspace, async (context) => {
                // If the current API workspace is not in the specified APIs, skip it
                if (apiFilter != null && (workspace.workspaceName == null || apiFilter !== workspace.workspaceName)) {
                    return;
                }

                // If there are no groups in the configuration, skip this workspace
                const generatorsConfiguration = await loadGeneratorsConfiguration({
                    absolutePathToWorkspace: workspace.absoluteFilePath,
                    context
                });
                if (generatorsConfiguration == null || generatorsConfiguration.groups == null) {
                    return;
                }

                for (const group of generatorsConfiguration.groups) {
                    // If the current group is not in the specified groups, skip it
                    if (groupFilter !== group.groupName) {
                        continue;
                    }

                    // Log version of generator to stdout
                    for (const generator of group.generators) {
                        if (generatorFilter === generator.name) {
                            maybeGenerator = generator;
                        }
                    }
                }
            });
        })
    );

    return maybeGenerator;
}
