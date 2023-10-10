import { FernToken } from "@fern-api/auth";
import { GeneratorGroup } from "@fern-api/generators-configuration";
import { TaskContext } from "@fern-api/task-context";
import { FernWorkspace } from "@fern-api/workspace-loader";
import { runRemoteGenerationForGenerator } from "./runRemoteGenerationForGenerator";

export interface RemoteGenerationForAPIWorkspaceResponse {
    // TODO: Ideally we'd return all the SDKs that wrote snippets right here.
    //
    // For now, we just use the index of the GeneratorInvocation in the given GeneratorGroup.
    generatorsWroteSnippets: number[];
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
}): Promise<void> {
    if (generatorGroup.generators.length === 0) {
        context.logger.warn("No generators specified.");
        return;
    }

    const interactiveTasks: Promise<boolean>[] = [];

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
            })
        )
    );

    const results = await Promise.all(interactiveTasks);
    if (results.some((didSucceed) => !didSucceed)) {
        context.failAndThrow();
    }
}
