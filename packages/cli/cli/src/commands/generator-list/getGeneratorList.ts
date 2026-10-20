import {
    addDefaultDockerOrgIfNotPresent,
    generatorsYml,
    loadGeneratorsConfiguration
} from "@fern-api/configuration-loader";
import { assertNever, Values } from "@fern-api/core-utils";
import { Project } from "@fern-api/project-loader";
import { isApiSelected } from "@fern-api/project-structure";
import { CliError } from "@fern-api/task-context";
import type { SdkConfigV1OutputConfig } from "@postman/sdk-config/sdk-config/v1";
import { writeFile } from "fs/promises";
import yaml from "js-yaml";
import { CliContext } from "../../cli-context/CliContext.js";
import { loadSdkConfigTargets } from "./loadSdkConfigTargets.js";

export const GenerationModeFilter = {
    GitHub: "github",
    Local: "local-file-system",
    PackageRegistry: "publish"
} as const;

export type GenerationModeFilter = Values<typeof GenerationModeFilter>;

interface GeneratorListApiEntry {
    /** Legacy generator names by group, from generators.yml or generators.legacy.yml. */
    groups: Record<string, string[]>;
    /** SDK Config targets by target id, from sdk-config.yml. */
    targets: Record<string, GeneratorListTarget>;
}

interface GeneratorListTarget {
    language: string;
    generator?: string;
    version: string;
}

export async function getGeneratorList({
    cliContext,
    generatorFilter,
    groupFilter,
    targetFilter,
    apiFilter,
    apiKeyFallback = "FERN_DEFAULT",
    project,
    outputLocation,
    excludedModes,
    includedModes
}: {
    cliContext: CliContext;
    generatorFilter: Set<string> | undefined;
    groupFilter: Set<string> | undefined;
    targetFilter: Set<string> | undefined;
    apiFilter: Set<string> | undefined;
    project: Project;
    apiKeyFallback: string | undefined;
    outputLocation: string | undefined;
    excludedModes: Set<GenerationModeFilter> | undefined;
    includedModes: Set<GenerationModeFilter> | undefined;
}): Promise<void> {
    const requestedApis = apiFilter == null ? undefined : [...apiFilter];
    const isSelectedApi = (workspaceName: string | undefined): boolean => isApiSelected(workspaceName, requestedApis);
    // Normalize the generator filter to add default Docker org prefix if not present
    const normalizedGeneratorFilter =
        generatorFilter != null ? new Set([...generatorFilter].map(addDefaultDockerOrgIfNotPresent)) : undefined;
    // --groups selects only legacy groups and --targets only SDK Config targets, unless both are passed
    const includeGroups = groupFilter != null || targetFilter == null;
    const includeTargets = targetFilter != null || groupFilter == null;

    // Indexed by workspace so the output order does not depend on which load finishes first
    const legacyGroupsByWorkspace: Array<generatorsYml.GeneratorGroup[] | undefined> = project.apiWorkspaces.map(
        () => undefined
    );
    await Promise.all(
        project.apiWorkspaces.map(async (workspace, index) => {
            if (!isSelectedApi(workspace.workspaceName)) {
                return;
            }
            await cliContext.runTaskForWorkspace(workspace, async (context) => {
                const generatorsConfiguration = await loadGeneratorsConfiguration({
                    absolutePathToWorkspace: workspace.absoluteFilePath,
                    context
                });
                legacyGroupsByWorkspace[index] = generatorsConfiguration?.groups;
            });
        })
    );
    const sdkConfigSources = await loadSdkConfigTargets({ project, cliContext, isSelectedApi });

    const generators: Record<string, GeneratorListApiEntry> = {};
    const getApiEntry = (workspaceName: string | undefined): GeneratorListApiEntry => {
        const apiName = workspaceName ?? apiKeyFallback;
        const entry = generators[apiName] ?? { groups: {}, targets: {} };
        generators[apiName] = entry;
        return entry;
    };

    project.apiWorkspaces.forEach((workspace, index) => {
        const groups = legacyGroupsByWorkspace[index];
        // If there are no groups in the configuration, skip this workspace
        if (groups == null) {
            return;
        }
        const entry = getApiEntry(workspace.workspaceName);
        if (!includeGroups) {
            return;
        }
        for (const group of groups) {
            // If the current group is not in the specified groups, skip it
            if (groupFilter != null && !groupFilter.has(group.groupName)) {
                continue;
            }
            entry.groups[group.groupName] = group.generators
                .filter((generator) =>
                    isIncludedByModes(getGeneratorInvocationMode(generator), includedModes, excludedModes)
                )
                .filter(
                    (generator) => normalizedGeneratorFilter == null || normalizedGeneratorFilter.has(generator.name)
                )
                .map((generator) => generator.name);
        }
    });

    for (const source of sdkConfigSources) {
        const entry = getApiEntry(source.workspaceName);
        if (!includeTargets) {
            continue;
        }
        for (const target of source.targets) {
            // A language selects every target that uses it; an id such as `java-1` selects one
            if (targetFilter != null && !targetFilter.has(target.id) && !targetFilter.has(target.language)) {
                continue;
            }
            if (
                normalizedGeneratorFilter != null &&
                (target.generator == null || !normalizedGeneratorFilter.has(target.generator))
            ) {
                continue;
            }
            if (!isIncludedByModes(getSdkConfigOutputMode(target.output), includedModes, excludedModes)) {
                continue;
            }
            entry.targets[target.id] = {
                language: target.language,
                ...(target.generator != null ? { generator: target.generator } : {}),
                version: target.version
            };
        }
    }

    const generatorsListYaml = yaml.dump(generators);
    if (outputLocation == null) {
        process.stdout.write(generatorsListYaml);
        return;
    }

    try {
        await writeFile(outputLocation, generatorsListYaml);
    } catch (error) {
        cliContext.failAndThrow(`Could not write file to the specified location: ${outputLocation}`, error, {
            code: CliError.Code.ConfigError
        });
    }
}

/** An exclusion, when given, decides on its own: it overrides --include-mode rather than narrowing it. */
function isIncludedByModes(
    mode: GenerationModeFilter,
    includedModes: Set<GenerationModeFilter> | undefined,
    excludedModes: Set<GenerationModeFilter> | undefined
): boolean {
    if (excludedModes != null) {
        return !excludedModes.has(mode);
    }
    if (includedModes != null) {
        return includedModes.has(mode);
    }
    return true;
}

function getGeneratorInvocationMode(generator: generatorsYml.GeneratorInvocation): GenerationModeFilter {
    const outputModeType = generator.outputMode.type;
    switch (outputModeType) {
        case "downloadFiles":
            return GenerationModeFilter.Local;
        case "github":
        case "githubV2":
            return GenerationModeFilter.GitHub;
        case "publish":
        case "publishV2":
            return GenerationModeFilter.PackageRegistry;
        default:
            assertNever(outputModeType);
    }
}

/**
 * Maps SDK Config delivery onto the legacy output modes. GitHub delivery stays `github` even when it also publishes,
 * matching a legacy github output with publish settings; files or zip delivery that publishes is a direct publish.
 */
function getSdkConfigOutputMode(output: SdkConfigV1OutputConfig | undefined): GenerationModeFilter {
    // `fern generate` downloads a target without output, the same as files delivery
    if (output == null) {
        return GenerationModeFilter.Local;
    }
    switch (output.delivery) {
        case "github":
            return GenerationModeFilter.GitHub;
        case "files":
        case "zip":
            return output.publish != null ? GenerationModeFilter.PackageRegistry : GenerationModeFilter.Local;
        default:
            assertNever(output);
    }
}
