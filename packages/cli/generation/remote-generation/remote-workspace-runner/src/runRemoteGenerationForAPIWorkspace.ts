import { FernToken } from "@fern-api/auth";
import { fernConfigJson, generatorsYml } from "@fern-api/configuration";
import { TaskContext } from "@fern-api/task-context";
import { FernWorkspaceMetadata } from "@fern-api/workspace-loader";
import { downloadSnippetsForTask } from "./downloadSnippetsForTask";
import { runRemoteGenerationForGenerator } from "./runRemoteGenerationForGenerator";

export interface RemoteGenerationForAPIWorkspaceResponse {
    snippetsProducedBy: generatorsYml.GeneratorInvocation[];
}

export async function runRemoteGenerationForAPIWorkspace({
    projectConfig,
    organization,
    workspaceGetter,
    context,
    version,
    shouldLogS3Url,
    token
}: {
    projectConfig: fernConfigJson.ProjectConfig;
    organization: string;
    workspaceGetter: (
        sdkLanguage: generatorsYml.GenerationLanguage | undefined
    ) => Promise<FernWorkspaceMetadata | undefined>;
    context: TaskContext;
    version: string | undefined;
    shouldLogS3Url: boolean;
    token: FernToken;
}): Promise<RemoteGenerationForAPIWorkspaceResponse | null> {
    const toplevelWorkspaceMetadata = await workspaceGetter(undefined);
    const generatorGroup = toplevelWorkspaceMetadata?.group;

    if (generatorGroup == null) {
        context.failWithoutThrowing("Could not load workspace");
        return null;
    }

    if (generatorGroup.generators.length === 0) {
        context.logger.warn("No generators specified.");
        return null;
    }

    const interactiveTasks: Promise<boolean>[] = [];
    const snippetsProducedBy: generatorsYml.GeneratorInvocation[] = [];

    interactiveTasks.push(
        ...generatorGroup.generators.map((generatorInvocation) =>
            context.runInteractiveTask({ name: generatorInvocation.name }, async (interactiveTaskContext) => {
                const workspaceMetadata = await workspaceGetter(generatorInvocation.language);

                if (workspaceMetadata == null) {
                    interactiveTaskContext.failWithoutThrowing("Could not load workspace");
                    return;
                } else {
                    const remoteTaskHandlerResponse = await runRemoteGenerationForGenerator({
                        projectConfig,
                        organization,
                        workspace: workspaceMetadata.workspace,
                        interactiveTaskContext,
                        generatorInvocation,
                        version,
                        audiences: generatorGroup.audiences,
                        shouldLogS3Url,
                        token,
                        whitelabel: workspaceMetadata.workspace.generatorsConfiguration?.whitelabel,
                        irVersionOverride: generatorInvocation.irVersionOverride,
                        absolutePathToPreview: workspaceMetadata.absolutePathToPreview,
                        readme: generatorInvocation.readme
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
