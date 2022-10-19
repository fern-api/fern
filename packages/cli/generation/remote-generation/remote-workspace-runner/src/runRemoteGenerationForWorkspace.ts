import { GeneratorInvocation } from "@fern-api/generators-configuration";
import { TaskContext } from "@fern-api/task-context";
import { Workspace } from "@fern-api/workspace-loader";
import { runRemoteGenerationForGenerator } from "./runRemoteGenerationForGenerator";

export async function runRemoteGenerationForWorkspace({
    organization,
    workspace,
    context,
    generatorInvocations,
    version,
}: {
    organization: string;
    workspace: Workspace;
    context: TaskContext;
    generatorInvocations: GeneratorInvocation[];
    version: string | undefined;
}): Promise<void> {
    if (generatorInvocations.length === 0) {
        context.logger.warn("No generators specified.");
        return;
    }

    await Promise.all(
        generatorInvocations.map((generatorInvocation) =>
            context.runInteractiveTask({ name: generatorInvocation.name }, (interactiveTaskContext) =>
                runRemoteGenerationForGenerator({
                    organization,
                    workspace,
                    interactiveTaskContext,
                    generatorInvocation,
                    version,
                })
            )
        )
    );
}
