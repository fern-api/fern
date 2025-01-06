import { writeFile } from "fs/promises";
import yaml from "js-yaml";

import { generatorsYml, loadGeneratorsConfiguration } from "@fern-api/configuration-loader";
import { Values, assertNever } from "@fern-api/core-utils";
import { Project } from "@fern-api/project-loader";

import { CliContext } from "../../cli-context/CliContext";

export const GenerationModeFilter = {
    GitHub: "github",
    Local: "local-file-system",
    PackageRegistry: "publish"
} as const;

export type GenerationModeFilter = Values<typeof GenerationModeFilter>;

export async function getGeneratorList({
    cliContext,
    generatorFilter,
    groupFilter,
    apiFilter,
    apiKeyFallback = "FERN_DEFAULT",
    project: { apiWorkspaces },
    outputLocation,
    excludedModes,
    includedModes
}: {
    cliContext: CliContext;
    generatorFilter: Set<string> | undefined;
    groupFilter: Set<string> | undefined;
    apiFilter: Set<string> | undefined;
    project: Project;
    apiKeyFallback: string | undefined;
    outputLocation: string | undefined;
    excludedModes: Set<GenerationModeFilter> | undefined;
    includedModes: Set<GenerationModeFilter> | undefined;
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
                const generatorsConfiguration = await loadGeneratorsConfiguration({
                    absolutePathToWorkspace: workspace.absoluteFilePath,
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
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    generators[apiName]![group.groupName] = group.generators
                        .filter((generator) => {
                            let include = true;
                            if (includedModes != null) {
                                include = isGeneratorInModeSet(generator, includedModes);
                            }
                            if (excludedModes != null) {
                                include = !isGeneratorInModeSet(generator, excludedModes);
                            }

                            return include;
                        })
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

function isGeneratorInModeSet(generator: generatorsYml.GeneratorInvocation, modes: Set<GenerationModeFilter>): boolean {
    let convertedMode: GenerationModeFilter;

    const outputModeType = generator.outputMode.type;
    switch (outputModeType) {
        case "downloadFiles":
            convertedMode = GenerationModeFilter.Local;
            break;
        case "github":
        case "githubV2":
            convertedMode = GenerationModeFilter.GitHub;
            break;
        case "publish":
        case "publishV2":
            convertedMode = GenerationModeFilter.PackageRegistry;
            break;
        default:
            assertNever(outputModeType);
    }

    return modes.has(convertedMode);
}
