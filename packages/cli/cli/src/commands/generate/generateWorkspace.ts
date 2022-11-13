import { runLocalGenerationForWorkspace } from "@fern-api/local-workspace-runner";
import { runRemoteGenerationForWorkspace } from "@fern-api/remote-workspace-runner";
import { TaskContext } from "@fern-api/task-context";
import { Workspace } from "@fern-api/workspace-loader";
import { generateIrForWorkspace } from "../generate-ir/generateIrForWorkspace";

export async function generateWorkspace({
    workspace,
    runLocal,
    keepDocker,
    organization,
    context,
}: {
    workspace: Workspace;
    runLocal: boolean;
    keepDocker: boolean;
    organization: string;
    context: TaskContext;
}): Promise<void> {
    const intermediateRepresentation = await generateIrForWorkspace({
        workspace,
        context,
        generationLanguage: undefined,
        audiences: [],
    });

    if (runLocal) {
        await runLocalGenerationForWorkspace({
            organization,
            workspace,
            intermediateRepresentation,
            keepDocker,
        });
    } else {
        await runRemoteGenerationForWorkspace({
            workspace,
            organization,
            context,
            generatorInvocations: workspace.generatorsConfiguration.draft,
            version: undefined,
        });
    }
}
