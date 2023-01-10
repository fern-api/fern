import { GeneratorGroup } from "@fern-api/generators-configuration";
import { TaskContext } from "@fern-api/task-context";
import { Workspace } from "@fern-api/workspace-loader";
import { runRemoteGenerationForGenerator } from "./runRemoteGenerationForGenerator";

export async function runRemoteGenerationForWorkspace({
    organization,
    workspace,
    context,
    generatorGroup,
    version,
    shouldLogS3Url,
    token,
}: {
    organization: string;
    workspace: Workspace;
    context: TaskContext;
    generatorGroup: GeneratorGroup;
    version: string | undefined;
    shouldLogS3Url: boolean;
    token: string;
}): Promise<void> {
    if (generatorGroup.generators.length === 0) {
        context.logger.warn("No generators specified.");
        return;
    }

    const results = await Promise.all(
        generatorGroup.generators.map((generatorInvocation) =>
            context.runInteractiveTask({ name: generatorInvocation.name }, async (interactiveTaskContext) => {
                try {
                    await runRemoteGenerationForGenerator({
                        organization,
                        workspace,
                        interactiveTaskContext,
                        generatorInvocation,
                        version,
                        audiences: generatorGroup.audiences,
                        shouldLogS3Url,
                        token,
                    });
                } catch (e) {
                    interactiveTaskContext.failWithoutThrowing(undefined, e);
                }
            })
        )
    );

    if (results.some((didSucceed) => !didSucceed)) {
        context.failAndThrow();
    }
}
