import { validateAPIWorkspaceAndLogIssues } from "@fern-api/api-workspace-validator";
import { FernToken } from "@fern-api/auth";
import { fernConfigJson, generatorsYml } from "@fern-api/configuration";
import { extractErrorMessage } from "@fern-api/core-utils";
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { OSSWorkspace } from "@fern-api/lazy-fern-workspace";
import { TaskAbortSignal, TaskContext } from "@fern-api/task-context";
import {
    AbstractAPIWorkspace,
    getBaseOpenAPIWorkspaceSettingsFromGeneratorInvocation
} from "@fern-api/workspace-loader";

import { FernFiddle } from "@fern-fern/fiddle-sdk";

import { downloadSnippetsForTask } from "./downloadSnippetsForTask.js";
import type { AutomationRunOptions } from "./RemoteGeneratorRunRecorder.js";
import { resolveAutoDiscoveredFernignorePath } from "./resolveAutoDiscoveredFernignorePath.js";
import { runRemoteGenerationForGenerator } from "./runRemoteGenerationForGenerator.js";

export interface RemoteGenerationForAPIWorkspaceResponse {
    snippetsProducedBy: generatorsYml.GeneratorInvocation[];
}

export async function runRemoteGenerationForAPIWorkspace({
    projectConfig,
    organization,
    workspace,
    context,
    generatorGroup,
    version,
    shouldLogS3Url,
    token,
    whitelabel,
    absolutePathToPreview,
    isPreview,
    fiddlePreview,
    pushPreviewBranch,
    mode,
    fernignorePath,
    skipFernignore,
    dynamicIrOnly,
    validateWorkspace,
    retryRateLimited,
    requireEnvVars,
    automationMode,
    autoMerge,
    skipIfNoDiff,
    automation,
    loginCommand
}: {
    projectConfig: fernConfigJson.ProjectConfig;
    organization: string;
    workspace: AbstractAPIWorkspace<unknown>;
    context: TaskContext;
    generatorGroup: generatorsYml.GeneratorGroup;
    version: string | undefined;
    shouldLogS3Url: boolean;
    token: FernToken;
    whitelabel: FernFiddle.WhitelabelConfig | undefined;
    absolutePathToPreview: AbsoluteFilePath | undefined;
    /** Controls CLI-side behavior (lenient env vars, skip version check). Falls back to absolutePathToPreview != null. */
    isPreview?: boolean;
    /** When provided, overrides the `preview` flag sent to Fiddle. When omitted, falls back to isPreview. */
    fiddlePreview?: boolean;
    /** When true, tells Fiddle to push a preview branch to the SDK repo. */
    pushPreviewBranch?: boolean;
    mode: "pull-request" | undefined;
    fernignorePath: string | undefined;
    skipFernignore?: boolean;
    dynamicIrOnly: boolean;
    validateWorkspace?: boolean;
    retryRateLimited: boolean;
    requireEnvVars: boolean;
    /**
     * Pre-existing Fiddle-API flag. Separate from {@link automation} because Fiddle consumes it
     * directly for server-side behaviors (no-diff detection, separate PRs, automerge). We set both
     * when running `fern automations generate`; one drives CLI fan-out, the other drives Fiddle.
     */
    automationMode?: boolean;
    autoMerge?: boolean;
    skipIfNoDiff?: boolean;
    /**
     * When provided, per-generator failures are captured via {@link AutomationRunOptions.recorder}
     * and siblings continue running instead of aborting the group. When absent, a single failure
     * throws.
     */
    automation?: AutomationRunOptions;
    /**
     * CLI command to reference in auth-failure hints (e.g. 'fern login' for v1,
     * 'fern auth login' for CLI v2). Defaults to 'fern login'.
     */
    loginCommand?: string;
}): Promise<RemoteGenerationForAPIWorkspaceResponse | null> {
    if (generatorGroup.generators.length === 0) {
        context.logger.warn("No generators specified.");
        return null;
    }

    const snippetsProducedBy: generatorsYml.GeneratorInvocation[] = [];

    const results = await Promise.all(
        generatorGroup.generators.map((generatorInvocation) =>
            context.runInteractiveTask({ name: generatorInvocation.name }, (interactiveTaskContext) =>
                generateOne({
                    generatorInvocation,
                    interactiveTaskContext,
                    // Closed-over state + params passed through to the per-generator worker.
                    projectConfig,
                    organization,
                    workspace,
                    context,
                    generatorGroup,
                    version,
                    shouldLogS3Url,
                    token,
                    whitelabel,
                    absolutePathToPreview,
                    isPreview,
                    fiddlePreview,
                    pushPreviewBranch,
                    mode,
                    fernignorePath,
                    skipFernignore,
                    dynamicIrOnly,
                    validateWorkspace,
                    retryRateLimited,
                    requireEnvVars,
                    automationMode,
                    autoMerge,
                    skipIfNoDiff,
                    automation,
                    loginCommand,
                    onSnippetsProduced: (invocation) => snippetsProducedBy.push(invocation)
                })
            )
        )
    );

    if (automation == null && results.some((didSucceed) => !didSucceed)) {
        // Subtasks have already logged and reported their failures via their own
        // `failAndThrow`. Throw a bare TaskAbortSignal to unwind without firing
        // redundant logging, PostHog, or Sentry events.
        throw new TaskAbortSignal();
    }

    return {
        snippetsProducedBy
    };
}

/**
 * Generates one SDK for a single generator invocation, recording the outcome to the recorder
 * when automation fan-out is active. Failures inside the try block are caught so sibling
 * generators can keep running; without automation, failures propagate as before.
 */
async function generateOne({
    generatorInvocation,
    interactiveTaskContext,
    projectConfig,
    organization,
    workspace,
    context,
    generatorGroup,
    version,
    shouldLogS3Url,
    token,
    whitelabel,
    absolutePathToPreview,
    isPreview,
    fiddlePreview,
    pushPreviewBranch,
    mode,
    fernignorePath,
    skipFernignore,
    dynamicIrOnly,
    validateWorkspace,
    retryRateLimited,
    requireEnvVars,
    automationMode,
    autoMerge,
    skipIfNoDiff,
    automation,
    loginCommand,
    onSnippetsProduced
}: {
    generatorInvocation: generatorsYml.GeneratorInvocation;
    interactiveTaskContext: Parameters<Parameters<TaskContext["runInteractiveTask"]>[1]>[0];
    projectConfig: fernConfigJson.ProjectConfig;
    organization: string;
    workspace: AbstractAPIWorkspace<unknown>;
    context: TaskContext;
    generatorGroup: generatorsYml.GeneratorGroup;
    version: string | undefined;
    shouldLogS3Url: boolean;
    token: FernToken;
    whitelabel: FernFiddle.WhitelabelConfig | undefined;
    absolutePathToPreview: AbsoluteFilePath | undefined;
    isPreview: boolean | undefined;
    fiddlePreview: boolean | undefined;
    pushPreviewBranch: boolean | undefined;
    mode: "pull-request" | undefined;
    fernignorePath: string | undefined;
    skipFernignore: boolean | undefined;
    dynamicIrOnly: boolean;
    validateWorkspace: boolean | undefined;
    retryRateLimited: boolean;
    requireEnvVars: boolean;
    automationMode: boolean | undefined;
    autoMerge: boolean | undefined;
    skipIfNoDiff: boolean | undefined;
    automation: AutomationRunOptions | undefined;
    loginCommand: string | undefined;
    /** Invoked post-success when the generator produced snippets. */
    onSnippetsProduced: (invocation: generatorsYml.GeneratorInvocation) => void;
}): Promise<void> {
    const startedAt = Date.now();
    try {
        const settings = getBaseOpenAPIWorkspaceSettingsFromGeneratorInvocation(generatorInvocation);

        const fernWorkspace = await workspace.toFernWorkspace(
            { context },
            settings,
            generatorInvocation.apiOverride?.specs
        );

        if (validateWorkspace) {
            await validateAPIWorkspaceAndLogIssues({
                workspace: fernWorkspace,
                context,
                logWarnings: false,
                ossWorkspace: workspace instanceof OSSWorkspace ? workspace : undefined
            });
        }

        // When --skip-fernignore is set, skip auto-discovery and use no fernignore path.
        // The skipFernignore flag is passed downstream to upload an empty .fernignore.
        // Otherwise, auto-discover .fernignore from the generator's local output directory
        // if not explicitly provided via --fernignore.
        const effectiveFernignorePath = skipFernignore
            ? undefined
            : (fernignorePath ??
              (await resolveAutoDiscoveredFernignorePath({
                  generatorInvocation,
                  context: interactiveTaskContext
              })));

        const remoteTaskHandlerResponse = await runRemoteGenerationForGenerator({
            projectConfig,
            organization,
            workspace: fernWorkspace,
            interactiveTaskContext,
            generatorInvocation: {
                ...generatorInvocation,
                outputMode: generatorInvocation.outputMode._visit<FernFiddle.OutputMode>({
                    downloadFiles: () => generatorInvocation.outputMode,
                    github: (val) => {
                        return FernFiddle.OutputMode.github({
                            ...val,
                            makePr: mode === "pull-request"
                        });
                    },
                    githubV2: (val) => {
                        if (mode === "pull-request") {
                            return FernFiddle.OutputMode.githubV2(FernFiddle.GithubOutputModeV2.pullRequest(val));
                        }
                        return generatorInvocation.outputMode;
                    },
                    publish: () => generatorInvocation.outputMode,
                    publishV2: () => generatorInvocation.outputMode,
                    _other: () => generatorInvocation.outputMode
                })
            },
            version,
            audiences: generatorGroup.audiences,
            shouldLogS3Url,
            token,
            whitelabel,
            readme: generatorInvocation.readme,
            irVersionOverride: generatorInvocation.irVersionOverride,
            absolutePathToPreview,
            isPreview,
            fiddlePreview,
            pushPreviewBranch,
            fernignorePath: effectiveFernignorePath,
            skipFernignore,
            dynamicIrOnly,
            retryRateLimited,
            requireEnvVars,
            automationMode,
            autoMerge,
            skipIfNoDiff,
            loginCommand
        });

        if (remoteTaskHandlerResponse?.createdSnippets) {
            onSnippetsProduced(generatorInvocation);

            if (
                generatorInvocation.absolutePathToLocalSnippets != null &&
                remoteTaskHandlerResponse.snippetsS3PreSignedReadUrl != null
            ) {
                await downloadSnippetsForTask({
                    snippetsS3PreSignedReadUrl: remoteTaskHandlerResponse.snippetsS3PreSignedReadUrl,
                    absolutePathToLocalSnippetJSON: generatorInvocation.absolutePathToLocalSnippets,
                    context: interactiveTaskContext
                });
            }
        }

        automation?.recorder.recordSuccess({
            apiName: workspace.workspaceName,
            groupName: generatorGroup.groupName,
            generatorName: generatorInvocation.name,
            version: remoteTaskHandlerResponse?.actualVersion ?? null,
            durationMs: Date.now() - startedAt
        });
    } catch (error) {
        if (automation == null) {
            throw error;
        }
        // A TaskAbortSignal means the task already logged its real error and marked
        // itself failed via `failAndThrow`. Pull the original message off the context
        // for the summary, then re-throw so it propagates up to `runInteractiveTask`,
        // which silently swallows it (see TaskContextImpl.failWithoutThrowing).
        // Re-logging here would produce `[object Object]` since `TaskAbortSignal`
        // isn't an `Error` and has no serializable message.
        if (error instanceof TaskAbortSignal) {
            automation.recorder.recordFailure({
                apiName: workspace.workspaceName,
                groupName: generatorGroup.groupName,
                generatorName: generatorInvocation.name,
                errorMessage: interactiveTaskContext.getLastFailureMessage() ?? "Generator failed",
                durationMs: Date.now() - startedAt
            });
            throw error;
        }
        const message = extractErrorMessage(error);
        automation.recorder.recordFailure({
            apiName: workspace.workspaceName,
            groupName: generatorGroup.groupName,
            generatorName: generatorInvocation.name,
            errorMessage: message,
            durationMs: Date.now() - startedAt
        });
        // Mark the task as failed but don't propagate — siblings continue running.
        interactiveTaskContext.failWithoutThrowing(message);
    }
}
