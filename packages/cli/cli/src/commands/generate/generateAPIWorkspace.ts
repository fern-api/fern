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
import { AutomationRunOptions, runRemoteGenerationForAPIWorkspace } from "@fern-api/remote-workspace-runner";
import { CliError, TaskContext } from "@fern-api/task-context";
import { AbstractAPIWorkspace } from "@fern-api/workspace-loader";
import { FernFiddle } from "@fern-fern/fiddle-sdk";
import chalk from "chalk";

import { GROUP_CLI_OPTION } from "../../constants.js";
import { filterGenerators } from "./filterGenerators.js";
import { GenerationMode } from "./generateAPIWorkspaces.js";
import { resolveGroupAlias } from "./resolveGroupAlias.js";
import { resolveGroupNamesForGeneration } from "./resolveGroupNamesForGeneration.js";
import { buildAutomationTargeting, selectGeneratorsForAutomation } from "./selectGeneratorsForAutomation.js";
import { shouldSkipMissingGenerator } from "./shouldSkipMissingGenerator.js";

export async function generateWorkspace({
    organization,
    workspace,
    projectConfig,
    context,
    groupName,
    generatorName,
    generatorIndex,
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
    fernignorePath,
    skipFernignore,
    dynamicIrOnly,
    noReplay,
    retryRateLimited,
    requireEnvVars,
    automationMode,
    autoMerge,
    automation
}: {
    organization: string;
    workspace: AbstractAPIWorkspace<unknown>;
    projectConfig: fernConfigJson.ProjectConfig;
    context: TaskContext;
    version: string | undefined;
    groupName: string | undefined;
    generatorName: string | undefined;
    generatorIndex: number | undefined;
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
    skipFernignore: boolean;
    dynamicIrOnly: boolean;
    noReplay: boolean;
    retryRateLimited: boolean;
    requireEnvVars: boolean;
    automationMode?: boolean;
    autoMerge?: boolean;
    /**
     * When provided, this call runs in fan-out automation mode: iterate every group (ignoring
     * `default-group`), silently skip generators opted out of automation, and route per-generator
     * outcomes through the recorder so siblings keep running when one fails.
     */
    automation?: AutomationRunOptions;
}): Promise<void> {
    if (workspace.generatorsConfiguration == null) {
        context.logger.warn("This workspaces has no generators.yml");
        return;
    }

    if (workspace.generatorsConfiguration.groups.length === 0) {
        context.logger.warn(`This workspace has no groups specified in ${GENERATORS_CONFIGURATION_FILENAME}`);
        return;
    }

    const resolvedGroupNames = resolveGroupsOrFail({
        groupName,
        generatorsConfiguration: workspace.generatorsConfiguration,
        isAutomation: automation != null,
        context
    });

    const { ai, replay } = workspace.generatorsConfiguration;

    // Pre-check token for remote generation before starting any work
    if (!useLocalDocker && !token) {
        return context.failAndThrow("Please run fern login", undefined, { code: CliError.Code.AuthError });
    }

    // Resolve each group to its runnable state *before* opening the interactive subtask, so
    // config errors (missing group, bad lfs, custom images, reject-opted-out) still abort the
    // whole run rather than being swallowed as a "this subtask failed" signal. The per-group
    // interactive task only wraps actual generation work.
    const runnableGroups = resolvedGroupNames.flatMap((resolvedGroupName) => {
        const runnable = resolveRunnableGroup({
            resolvedGroupName,
            workspace,
            generatorIndex,
            generatorName,
            automation,
            lfsOverride,
            context,
            useLocalDocker,
            token
        });
        return runnable != null ? [{ resolvedGroupName, group: runnable }] : [];
    });

    // Run generation for each runnable group in parallel. Each becomes an interactive subtask
    // of the workspace task so per-generator tasks opened downstream nest beneath it.
    await Promise.all(
        runnableGroups.map(({ resolvedGroupName, group }) =>
            context.runInteractiveTask({ name: resolvedGroupName }, async (groupContext) => {
                if (useLocalDocker) {
                    await runLocalGenerationForWorkspace({
                        token,
                        projectConfig,
                        workspace,
                        generatorGroup: group,
                        version,
                        keepDocker,
                        context: groupContext,
                        runner,
                        absolutePathToPreview,
                        inspect,
                        ai,
                        replay,
                        noReplay,
                        validateWorkspace: true,
                        requireEnvVars,
                        skipFernignore,
                        automationMode,
                        autoMerge
                    });
                } else if (token != null) {
                    await runRemoteGenerationForAPIWorkspace({
                        projectConfig,
                        organization,
                        workspace,
                        context: groupContext,
                        generatorGroup: group,
                        version,
                        shouldLogS3Url,
                        token,
                        whitelabel: workspace.generatorsConfiguration?.whitelabel,
                        absolutePathToPreview,
                        mode,
                        fernignorePath,
                        skipFernignore,
                        dynamicIrOnly,
                        validateWorkspace: true,
                        retryRateLimited,
                        requireEnvVars,
                        automationMode,
                        autoMerge,
                        automation
                    });
                }
            })
        )
    );
}

/**
 * Validates and narrows a group to the exact set of generators that should run. Throws via
 * `context.failAndThrow` on misconfiguration (missing group, invalid --generator targeting,
 * index-targeted generator opts out, custom images with remote generation, bad lfs override).
 *
 * Returns `null` when the group is silently skipped (empty-after-skip in automation fan-out).
 */
function resolveRunnableGroup({
    resolvedGroupName,
    workspace,
    generatorIndex,
    generatorName,
    automation,
    lfsOverride,
    context,
    useLocalDocker,
    token
}: {
    resolvedGroupName: string;
    workspace: AbstractAPIWorkspace<unknown>;
    generatorIndex: number | undefined;
    generatorName: string | undefined;
    automation: AutomationRunOptions | undefined;
    lfsOverride: string | undefined;
    context: TaskContext;
    useLocalDocker: boolean;
    token: FernToken | undefined;
}): generatorsYml.GeneratorGroup | null {
    let group = workspace.generatorsConfiguration?.groups.find(
        (otherGroup) => otherGroup.groupName === resolvedGroupName
    );
    if (group == null) {
        return context.failAndThrow(`Group '${resolvedGroupName}' does not exist.`, undefined, {
            code: CliError.Code.ConfigError
        });
    }

    const filterResult = filterGenerators({
        generators: group.generators,
        generatorIndex,
        generatorName,
        groupName: resolvedGroupName
    });
    if (!filterResult.ok) {
        if (shouldSkipMissingGenerator({ automation, generatorName, generatorIndex })) {
            return null;
        }
        return context.failAndThrow(filterResult.error, undefined, { code: CliError.Code.ConfigError });
    }
    let filteredGenerators = filterResult.generators;

    if (automation != null) {
        const selection = selectGeneratorsForAutomation({
            generators: filteredGenerators,
            rootAutorelease: workspace.generatorsConfiguration?.rawConfiguration.autorelease,
            targeting: buildAutomationTargeting({ generatorIndex, generatorName })
        });
        if (selection.type === "reject-opted-out") {
            return context.failAndThrow(
                `Generator '${selection.generatorName}' at index ${selection.index} in group '${resolvedGroupName}' is excluded from automation: ${selection.reason}. ` +
                    `Target by name instead to have opt-outs filtered silently, ` +
                    `drop the --generator flag to fan out across eligible generators, ` +
                    `or re-enable automation for this generator in generators.yml.`,
                undefined,
                { code: CliError.Code.ConfigError }
            );
        }
        if (selection.type === "empty-after-skip") {
            // Nothing to do in this group — leave silently; the recorder has no rows for it.
            return null;
        }
        filteredGenerators = selection.generators;
    }
    group = { ...group, generators: filteredGenerators };

    if (lfsOverride != null) {
        group = applyLfsOverride(group, lfsOverride, context);
    }

    if (!useLocalDocker && token != null) {
        // Block custom images for remote generation — only trusted images can run on Fiddle.
        const customImageGenerators = group.generators.filter((g) => g.containerImage != null);
        if (customImageGenerators.length > 0) {
            const names = customImageGenerators.map((g) => g.name).join(", ");
            return context.failAndThrow(
                `Custom image configurations are only supported with local generation (--local). ` +
                    `The following generators use custom images: ${names}`
            );
        }
    }

    return group;
}

/**
 * Resolves the list of group names to run against, throwing a helpful `failAndThrow` for any
 * misconfiguration (missing group, unknown alias, alias pointing at a non-existent group).
 *
 * Composes two pure helpers:
 *   - `resolveGroupNamesForGeneration` — decides between fan-out / targeted / missing-group.
 *   - `resolveGroupAlias` — expands an alias to its targets, validating each.
 *
 * The helpers themselves are pure and live in their own modules; this wrapper owns the
 * error-message rendering and the throw.
 */
function resolveGroupsOrFail({
    groupName,
    generatorsConfiguration,
    isAutomation,
    context
}: {
    groupName: string | undefined;
    generatorsConfiguration: generatorsYml.GeneratorsConfiguration;
    isAutomation: boolean;
    context: TaskContext;
}): string[] {
    const resolution = resolveGroupNamesForGeneration({ groupName, generatorsConfiguration, isAutomation });
    if (resolution.type === "fan-out") {
        return resolution.groupNames;
    }
    if (resolution.type === "missing-group") {
        const longestGroupName = Math.max(...resolution.availableGroupNames.map((name) => name.length));
        const currentArgs = process.argv.slice(2).join(" ");
        const suggestions = resolution.availableGroupNames
            .map((name) => {
                const suggestedCommand = `fern ${currentArgs} --${GROUP_CLI_OPTION} ${name}`;
                return ` › ${chalk.bold(name.padEnd(longestGroupName))}  ${chalk.dim(suggestedCommand)}`;
            })
            .join("\n");
        context.failAndThrow(
            `No group specified. Use the --${GROUP_CLI_OPTION} option, or set "${DEFAULT_GROUP_GENERATORS_CONFIG_KEY}" in ${GENERATORS_CONFIGURATION_FILENAME}:\n${suggestions}`,
            undefined,
            { code: CliError.Code.NetworkError }
        );
        return []; // unreachable — failAndThrow throws
    }

    // resolution.type === "targeted"
    if (resolution.fromDefaultGroup) {
        context.logger.info(
            chalk.dim(`Using default group '${resolution.groupName}' from ${GENERATORS_CONFIGURATION_FILENAME}`)
        );
    }
    const aliasResult = resolveGroupAlias({
        name: resolution.groupName,
        groupAliases: generatorsConfiguration.groupAliases,
        availableGroupNames: generatorsConfiguration.groups.map((g) => g.groupName)
    });
    if (aliasResult.type === "alias-references-missing-group") {
        context.failAndThrow(
            `Group alias '${aliasResult.alias}' references non-existent group '${aliasResult.missingGroupName}'. ` +
                `Available groups: ${aliasResult.availableGroupNames.join(", ")}`,
            undefined,
            { code: CliError.Code.NetworkError }
        );
        return [];
    }
    if (aliasResult.type === "unknown") {
        const aliasesSuffix =
            aliasResult.availableAliasNames.length > 0
                ? `. Available aliases: ${aliasResult.availableAliasNames.join(", ")}`
                : "";
        context.failAndThrow(
            `'${aliasResult.name}' is not a valid group or alias. ` +
                `Available groups: ${aliasResult.availableGroupNames.join(", ")}${aliasesSuffix}`,
            undefined,
            { code: CliError.Code.NetworkError }
        );
        return [];
    }
    return aliasResult.groupNames;
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
