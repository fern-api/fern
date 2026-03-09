import { validateAPIWorkspaceAndLogIssues } from "@fern-api/api-workspace-validator";
import { FernToken } from "@fern-api/auth";
import { FERNIGNORE_FILENAME, fernConfigJson, generatorsYml } from "@fern-api/configuration";
import { AbsoluteFilePath, doesPathExist, join, RelativeFilePath } from "@fern-api/fs-utils";
import { OSSWorkspace } from "@fern-api/lazy-fern-workspace";
import { TaskContext } from "@fern-api/task-context";
import {
    AbstractAPIWorkspace,
    getBaseOpenAPIWorkspaceSettingsFromGeneratorInvocation
} from "@fern-api/workspace-loader";

import { FernFiddle } from "@fern-fern/fiddle-sdk";

import { downloadSnippetsForTask } from "./downloadSnippetsForTask.js";
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
    mode,
    fernignorePath,
    dynamicIrOnly,
    validateWorkspace,
    retryRateLimited
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
    mode: "pull-request" | undefined;
    fernignorePath: string | undefined;
    dynamicIrOnly: boolean;
    validateWorkspace?: boolean;
    retryRateLimited: boolean;
}): Promise<RemoteGenerationForAPIWorkspaceResponse | null> {
    if (generatorGroup.generators.length === 0) {
        context.logger.warn("No generators specified.");
        return null;
    }

    const interactiveTasks: Promise<boolean>[] = [];
    const snippetsProducedBy: generatorsYml.GeneratorInvocation[] = [];

    interactiveTasks.push(
        ...generatorGroup.generators.map((generatorInvocation) =>
            context.runInteractiveTask({ name: generatorInvocation.name }, async (interactiveTaskContext) => {
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

                // Auto-discover .fernignore from the generator's local output directory
                // if not explicitly provided via --fernignore
                const effectiveFernignorePath =
                    fernignorePath ??
                    (await resolveAutoDiscoveredFernignorePath({
                        generatorInvocation,
                        context: interactiveTaskContext
                    }));

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
                                    return FernFiddle.OutputMode.githubV2(
                                        FernFiddle.GithubOutputModeV2.pullRequest(val)
                                    );
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
                    fernignorePath: effectiveFernignorePath,
                    dynamicIrOnly,
                    retryRateLimited
                });
                if (remoteTaskHandlerResponse != null && remoteTaskHandlerResponse.createdSnippets) {
                    snippetsProducedBy.push(generatorInvocation);

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
            })
        )
    );

    const results = await Promise.all(interactiveTasks);
    if (results.some((didSucceed) => !didSucceed)) {
        context.failAndThrow();
    }

    return {
        snippetsProducedBy
    };
}

/**
 * If the generator is configured with local file system output (absolutePathToLocalOutput),
 * checks whether a .fernignore file exists in that output directory and returns its path.
 * Returns undefined if the generator has no local output path or no .fernignore file exists.
 */
async function resolveAutoDiscoveredFernignorePath({
    generatorInvocation,
    context
}: {
    generatorInvocation: generatorsYml.GeneratorInvocation;
    context: TaskContext;
}): Promise<string | undefined> {
    if (generatorInvocation.absolutePathToLocalOutput == null) {
        return undefined;
    }
    const fernignoreFilePath = join(
        generatorInvocation.absolutePathToLocalOutput,
        RelativeFilePath.of(FERNIGNORE_FILENAME)
    );
    if (await doesPathExist(fernignoreFilePath)) {
        context.logger.debug(`Auto-discovered ${FERNIGNORE_FILENAME} at ${fernignoreFilePath}`);
        return fernignoreFilePath;
    }
    return undefined;
}
