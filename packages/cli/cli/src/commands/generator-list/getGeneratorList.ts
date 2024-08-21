import { generatorsYml } from "@fern-api/configuration";
import { Project } from "@fern-api/project-loader";
import { writeFile } from "fs/promises";
import yaml from "js-yaml";
import { CliContext } from "../../cli-context/CliContext";

export async function getGeneratorList({
    cliContext,
    generatorFilter,
    groupFilter,
    apiFilter,
    apiKeyFallback = "FERN_DEFAULT",
    project: { apiWorkspaces },
    outputLocation
}: {
    cliContext: CliContext;
    generatorFilter: Set<string> | undefined;
    groupFilter: Set<string> | undefined;
    apiFilter: Set<string> | undefined;
    project: Project;
    apiKeyFallback: string | undefined;
    outputLocation: string | undefined;
}): Promise<void> {
    const generators: Record<string, Record<string, string[]>> = {};
    await Promise.all(
        apiWorkspaces.map(async (workspace) => {
            await cliContext.runTaskForWorkspace(workspace, async (context) => {
                // If the current API workspace is not in the specified APIs, skip it
                if (apiFilter != null && (workspace.workspaceName == null || !apiFilter.has(workspace.workspaceName))) {
                    return;
                }

                // If there are no groups in the configuration, skip this workspace
                const generatorsConfiguration = await generatorsYml.loadGeneratorsConfiguration({
                    absolutePathToWorkspace: workspace.absoluteFilepath,
                    context
                });
                if (generatorsConfiguration == null || generatorsConfiguration.groups == null) {
                    return;
                }

                const apiName = workspace.workspaceName ?? apiKeyFallback;
                generators[apiName] = {};

                for (const group of generatorsConfiguration.groups) {
                    // If the current group is not in the specified groups, skip it
                    if (groupFilter != null && !groupFilter.has(group.groupName)) {
                        continue;
                    }

                    // If the current generator is not in the specified generators, skip it
                    generators[apiName]![group.groupName] = group.generators
                        .filter((generator) => generatorFilter == null || generatorFilter.has(generator.name))
                        .map((generator) => generator.name);
                }
            });
        })
    );

    const generatorsListYaml = yaml.dump(generators);
    if (outputLocation == null) {
        process.stdout.write(generatorsListYaml);
        return;
    }

    try {
        await writeFile(outputLocation, generatorsListYaml);
    } catch (error) {
        cliContext.failAndThrow(`Could not write file to the specified location: ${outputLocation}`, error);
    }
}
