import { FernToken } from "@fern-api/auth";
import { GeneratorGroup, GeneratorInvocation } from "@fern-api/generators-configuration";
import { TaskContext } from "@fern-api/task-context";
import { FernWorkspace } from "@fern-api/workspace-loader";
import { runRemoteGenerationForGenerator } from "./runRemoteGenerationForGenerator";

export interface RemoteGenerationForAPIWorkspaceResponse {
    snippetsProducedBy: GeneratorInvocation[];
}

export async function runRemoteGenerationForAPIWorkspace({
    organization,
    workspace,
    context,
    generatorGroup,
    version,
    shouldLogS3Url,
    token,
}: {
    organization: string;
    workspace: FernWorkspace;
    context: TaskContext;
    generatorGroup: GeneratorGroup;
    version: string | undefined;
    shouldLogS3Url: boolean;
    token: FernToken;
}): Promise<RemoteGenerationForAPIWorkspaceResponse | null> {
    if (generatorGroup.generators.length === 0) {
        context.logger.warn("No generators specified.");
        return null;
    }

    const interactiveTasks: Promise<boolean>[] = [];
    const snippetsProducedBy: GeneratorInvocation[] = [];

    interactiveTasks.push(
        ...generatorGroup.generators.map((generatorInvocation) =>
            context.runInteractiveTask({ name: generatorInvocation.name }, async (interactiveTaskContext) => {
                const remoteTaskHandlerResponse = await runRemoteGenerationForGenerator({
                    organization,
                    workspace,
                    interactiveTaskContext,
                    generatorInvocation,
                    version,
                    audiences: generatorGroup.audiences,
                    shouldLogS3Url,
                    token,
                });
                if (remoteTaskHandlerResponse != null && remoteTaskHandlerResponse.createdSnippets) {
                    snippetsProducedBy.push(generatorInvocation);
                }
            })
        )
    );

    const results = await Promise.all(interactiveTasks);
    if (results.some((didSucceed) => !didSucceed)) {
        context.failAndThrow();
    }

    return {
        snippetsProducedBy,
    };
}
