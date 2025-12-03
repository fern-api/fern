import { FernToken } from "@fern-api/auth";
import {
    DEFAULT_GROUP_GENERATORS_CONFIG_KEY,
    fernConfigJson,
    GENERATORS_CONFIGURATION_FILENAME,
    generatorsYml
} from "@fern-api/configuration-loader";
import { ContainerRunner } from "@fern-api/core-utils";
import { AbsoluteFilePath, cwd, join, RelativeFilePath, resolve } from "@fern-api/fs-utils";
import { runLocalGenerationForWorkspace } from "@fern-api/local-workspace-runner";
import { runRemoteGenerationForAPIWorkspace } from "@fern-api/remote-workspace-runner";
import { TaskContext } from "@fern-api/task-context";
import { AbstractAPIWorkspace } from "@fern-api/workspace-loader";
import { FernFiddle } from "@fern-fern/fiddle-sdk";

import { GROUP_CLI_OPTION } from "../../constants";
import { validateAPIWorkspaceAndLogIssues } from "../validate/validateAPIWorkspaceAndLogIssues";
import { GenerationMode } from "./generateAPIWorkspaces";

export async function generateWorkspace({
    organization,
    workspace,
    projectConfig,
    context,
    groupName,
    version,
    shouldLogS3Url,
    token,
    useLocalDocker,
    keepDocker,
    absolutePathToPreview,
    mode,
    runner,
    inspect,
    lfsOverride,
    fernignorePath
}: {
    organization: string;
    workspace: AbstractAPIWorkspace<unknown>;
    projectConfig: fernConfigJson.ProjectConfig;
    context: TaskContext;
    version: string | undefined;
    groupName: string | undefined;
    shouldLogS3Url: boolean;
    token: FernToken | undefined;
    useLocalDocker: boolean;
    keepDocker: boolean;
    absolutePathToPreview: AbsoluteFilePath | undefined;
    mode: GenerationMode | undefined;
    runner: ContainerRunner | undefined;
    inspect: boolean;
    lfsOverride: string | undefined;
    fernignorePath: string | undefined;
}): Promise<void> {
    if (workspace.generatorsConfiguration == null) {
        context.logger.warn("This workspaces has no generators.yml");
        return;
    }

    if (workspace.generatorsConfiguration.groups.length === 0) {
        context.logger.warn(`This workspace has no groups specified in ${GENERATORS_CONFIGURATION_FILENAME}`);
        return;
    }

    const groupNameOrDefault = groupName ?? workspace.generatorsConfiguration.defaultGroup;
    if (groupNameOrDefault == null) {
        return context.failAndThrow(
            `No group specified. Use the --${GROUP_CLI_OPTION} option, or set "${DEFAULT_GROUP_GENERATORS_CONFIG_KEY}" in ${GENERATORS_CONFIGURATION_FILENAME}`
        );
    }

    // Resolve group aliases - if the groupName is an alias, expand it to multiple groups
    const resolvedGroupNames = resolveGroupAlias(
        groupNameOrDefault,
        workspace.generatorsConfiguration.groupAliases,
        workspace.generatorsConfiguration.groups.map((g) => g.groupName),
        context
    );

    const { ai } = workspace.generatorsConfiguration;

    // Pre-check token for remote generation before starting any work
    if (!useLocalDocker && !token) {
        return context.failAndThrow("Please run fern login");
    }

    // Validate workspace once before running all groups
    await validateAPIWorkspaceAndLogIssues({
        workspace: await workspace.toFernWorkspace({ context }),
        context,
        logWarnings: false
    });

    // Run generation for all resolved groups in parallel
    await Promise.all(
        resolvedGroupNames.map(async (resolvedGroupName) => {
            let group = workspace.generatorsConfiguration?.groups.find(
                (otherGroup) => otherGroup.groupName === resolvedGroupName
            );
            if (group == null) {
                return context.failAndThrow(`Group '${resolvedGroupName}' does not exist.`);
            }

            // Apply lfs-override if specified
            if (lfsOverride != null) {
                group = applyLfsOverride(group, lfsOverride, context);
            }

            if (resolvedGroupNames.length > 1) {
                context.logger.info(`Running generation for group '${resolvedGroupName}'...`);
            }

            if (useLocalDocker) {
                await runLocalGenerationForWorkspace({
                    token,
                    projectConfig,
                    workspace,
                    generatorGroup: group,
                    version,
                    keepDocker,
                    context,
                    runner,
                    absolutePathToPreview,
                    inspect,
                    ai,
                    fernignorePath
                });
            } else if (token != null) {
                await runRemoteGenerationForAPIWorkspace({
                    projectConfig,
                    organization,
                    workspace,
                    context,
                    generatorGroup: group,
                    version,
                    shouldLogS3Url,
                    token,
                    whitelabel: workspace.generatorsConfiguration?.whitelabel,
                    absolutePathToPreview,
                    mode,
                    fernignorePath
                });
            }
        })
    );
}

/**
 * Resolves a group name or alias to a list of group names.
 * If the name is an alias, returns the list of groups it maps to.
 * If the name is a direct group name, returns it as a single-element array.
 * Validates that all resolved group names exist.
 */
function resolveGroupAlias(
    groupNameOrAlias: string,
    groupAliases: Record<string, string[]>,
    availableGroups: string[],
    context: TaskContext
): string[] {
    // Check if it's an alias
    const aliasGroups = groupAliases[groupNameOrAlias];
    if (aliasGroups != null) {
        // Validate that all groups in the alias exist
        for (const groupName of aliasGroups) {
            if (!availableGroups.includes(groupName)) {
                context.failAndThrow(
                    `Group alias '${groupNameOrAlias}' references non-existent group '${groupName}'. ` +
                        `Available groups: ${availableGroups.join(", ")}`
                );
            }
        }
        return aliasGroups;
    }

    // Check if it's a direct group name
    if (availableGroups.includes(groupNameOrAlias)) {
        return [groupNameOrAlias];
    }

    // Neither an alias nor a group - fail with helpful message
    const availableAliases = Object.keys(groupAliases);
    const suggestions = [...availableGroups, ...availableAliases];
    context.failAndThrow(
        `'${groupNameOrAlias}' is not a valid group or alias. ` +
            `Available groups: ${availableGroups.join(", ")}` +
            (availableAliases.length > 0 ? `. Available aliases: ${availableAliases.join(", ")}` : "")
    );
    return []; // unreachable, but TypeScript needs this
}

function applyLfsOverride(
    group: generatorsYml.GeneratorGroup,
    lfsOverridePath: string,
    context: TaskContext
): generatorsYml.GeneratorGroup {
    const baseAbsolutePath = AbsoluteFilePath.of(resolve(cwd(), lfsOverridePath));

    // Count generators and track languages for duplicate handling
    const languageCount: Record<string, number> = {};
    const modifiedGenerators: generatorsYml.GeneratorInvocation[] = [];

    for (const generator of group.generators) {
        const language = generator.language ?? getLanguageFromGeneratorName(generator.name);

        let outputPath: AbsoluteFilePath;

        if (group.generators.length === 1) {
            // Single generator: use the provided path directly
            outputPath = baseAbsolutePath;
        } else {
            // Multiple generators: create subdirectories
            const languageDir = language || "unknown";

            if (languageCount[languageDir] == null) {
                languageCount[languageDir] = 0;
            }
            languageCount[languageDir]++;

            const dirName =
                languageCount[languageDir] === 1 ? languageDir : `${languageDir}-${languageCount[languageDir]}`;

            outputPath = join(baseAbsolutePath, RelativeFilePath.of(dirName));
        }

        // Create a new generator with local-file-system output mode
        const modifiedGenerator: generatorsYml.GeneratorInvocation = {
            ...generator,
            outputMode: FernFiddle.remoteGen.OutputMode.downloadFiles({}),
            absolutePathToLocalOutput: outputPath
        };

        modifiedGenerators.push(modifiedGenerator);

        context.logger.info(
            `Overriding output for generator '${generator.name}' to local-file-system at: ${outputPath}`
        );
    }

    return {
        ...group,
        generators: modifiedGenerators
    };
}

function getLanguageFromGeneratorName(generatorName: string): string {
    // Try to extract language from common generator naming patterns
    if (generatorName.includes("typescript") || generatorName.includes("ts")) {
        return "typescript";
    }
    if (generatorName.includes("python") || generatorName.includes("py")) {
        return "python";
    }
    if (generatorName.includes("java")) {
        return "java";
    }
    if (generatorName.includes("go")) {
        return "go";
    }
    if (generatorName.includes("ruby")) {
        return "ruby";
    }
    if (generatorName.includes("csharp") || generatorName.includes("c#")) {
        return "csharp";
    }
    if (generatorName.includes("swift")) {
        return "swift";
    }
    if (generatorName.includes("php")) {
        return "php";
    }
    if (generatorName.includes("rust")) {
        return "rust";
    }
    // If we can't determine the language, use the generator name itself
    return generatorName.replace(/[^a-zA-Z0-9]/g, "-").toLowerCase();
}
