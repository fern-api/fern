import { FernToken } from "@fern-api/auth";
import { fernConfigJson, GENERATORS_CONFIGURATION_FILENAME, generatorsYml } from "@fern-api/configuration-loader";
import { ContainerRunner } from "@fern-api/core-utils";
import { AbsoluteFilePath, cwd, join, RelativeFilePath, resolve } from "@fern-api/fs-utils";
import { runLocalGenerationForWorkspace } from "@fern-api/local-workspace-runner";
import {
    AutomationRunOptions,
    findGeneratorLineNumber,
    GeneratorOccurrenceTracker,
    getOutputRepoUrl,
    runRemoteGenerationForAPIWorkspace
} from "@fern-api/remote-workspace-runner";
import { CliError, TaskContext } from "@fern-api/task-context";
import { AbstractAPIWorkspace } from "@fern-api/workspace-loader";
import { FernFiddle } from "@fern-fern/fiddle-sdk";

import { isTelemetryDisabled } from "../../telemetry/isTelemetryDisabled.js";
import { filterGenerators } from "./filterGenerators.js";
import { GenerationMode } from "./generateAPIWorkspaces.js";
import { buildAutomationTargeting, selectGeneratorsForAutomation } from "./selectGeneratorsForAutomation.js";
import { shouldSkipMissingGenerator } from "./shouldSkipMissingGenerator.js";

export async function generateWorkspace({
    organization,
    workspace,
    projectConfig,
    context,
    resolvedGroupNames,
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
    skipIfNoDiff,
    automation
}: {
    organization: string;
    workspace: AbstractAPIWorkspace<unknown>;
    projectConfig: fernConfigJson.ProjectConfig;
    context: TaskContext;
    version: string | undefined;
    /**
     * The resolved group names to run for this workspace, already validated and alias-expanded
     * by the pre-flight pass in {@link generateAPIWorkspaces}. Must be non-empty.
     */
    resolvedGroupNames: string[];
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
    skipIfNoDiff?: boolean;
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

    const { ai, replay } = workspace.generatorsConfiguration;

    // Pre-check token for remote generation before starting any work
    if (!useLocalDocker && !token) {
        return context.failAndThrow("Please run fern login", undefined, { code: CliError.Code.AuthError });
    }

    // One tracker per workspace so duplicate generator names in the same generators.yml get
    // distinct occurrence indices. We stamp every generator with its declaration-order index
    // here so later `lookup` calls return the correct index regardless of whether the skip
    // pass or the run pass consumes it first.
    const occurrenceTracker = new GeneratorOccurrenceTracker();
    for (const group of workspace.generatorsConfiguration.groups) {
        occurrenceTracker.recordOccurrences(group.generators);
    }
    const generatorsYmlAbsolutePath = workspace.generatorsConfiguration.absolutePathToConfiguration;

    // Resolve each group to its runnable state *before* opening the interactive subtask, so
    // config errors (missing group, bad lfs, custom images, reject-opted-out) still abort the
    // whole run rather than being swallowed as a "this subtask failed" signal. The per-group
    // interactive task only wraps actual generation work.
    // Async because `resolveRunnableGroup` now reads `generators.yml` off disk (via
    // `findGeneratorLineNumber`) to compute recordSkipped line anchors. Sequential resolution
    // is intentional — the config errors inside must still abort the whole run deterministically,
    // before any generation work starts.
    const runnableGroups: Array<{ resolvedGroupName: string; group: generatorsYml.GeneratorGroup }> = [];
    for (const resolvedGroupName of resolvedGroupNames) {
        const runnable = await resolveRunnableGroup({
            resolvedGroupName,
            workspace,
            generatorIndex,
            generatorName,
            automation,
            lfsOverride,
            context,
            useLocalDocker,
            token,
            occurrenceTracker,
            generatorsYmlAbsolutePath
        });
        if (runnable != null) {
            runnableGroups.push({ resolvedGroupName, group: runnable });
        }
    }

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
                        autoMerge,
                        skipIfNoDiff,
                        disableTelemetry: isTelemetryDisabled()
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
                        automation,
                        occurrenceTracker,
                        skipIfNoDiff
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
async function resolveRunnableGroup({
    resolvedGroupName,
    workspace,
    generatorIndex,
    generatorName,
    automation,
    lfsOverride,
    context,
    useLocalDocker,
    token,
    occurrenceTracker,
    generatorsYmlAbsolutePath
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
    occurrenceTracker: GeneratorOccurrenceTracker;
    generatorsYmlAbsolutePath: AbsoluteFilePath;
}): Promise<generatorsYml.GeneratorGroup | null> {
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
        // Record every opted-out generator (both on the happy path and when nothing is left
        // to run) so the automation step summary shows a row for it. The tracker was primed
        // in declaration order at the top of the workspace, so lookup resolves to the correct
        // line regardless of whether a sibling ran or was skipped.
        for (const skipped of selection.skipped) {
            automation.recorder.recordSkipped({
                apiName: workspace.workspaceName,
                groupName: resolvedGroupName,
                generatorName: skipped.generator.name,
                reason: skipped.reason,
                outputRepoUrl: getOutputRepoUrl(skipped.generator),
                generatorsYmlAbsolutePath,
                generatorsYmlLineNumber: await findGeneratorLineNumber(
                    generatorsYmlAbsolutePath,
                    skipped.generator.name,
                    occurrenceTracker.lookup(skipped.generator)
                )
            });
        }
        if (selection.type === "empty-after-skip") {
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
