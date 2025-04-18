import { FernToken } from "@fern-api/auth";
import { fernConfigJson, generatorsYml } from "@fern-api/configuration";
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { TaskContext } from "@fern-api/task-context";
import {
    AbstractAPIWorkspace,
    getBaseOpenAPIWorkspaceSettingsFromGeneratorInvocation
} from "@fern-api/workspace-loader";

import { FernFiddle } from "@fern-fern/fiddle-sdk";

import { downloadSnippetsForTask } from "./downloadSnippetsForTask";
import { runRemoteGenerationForGenerator } from "./runRemoteGenerationForGenerator";

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
    mode
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
                const fernWorkspace = await workspace.toFernWorkspace(
                    { context },
                    getBaseOpenAPIWorkspaceSettingsFromGeneratorInvocation(generatorInvocation)
                );

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
                    absolutePathToPreview
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
