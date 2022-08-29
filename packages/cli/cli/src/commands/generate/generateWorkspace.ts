import { runLocalGenerationForWorkspace } from "@fern-api/local-workspace-runner";
import { runRemoteGenerationForWorkspace } from "@fern-api/remote-workspace-runner";
import { TaskContext, TASK_FAILURE } from "@fern-api/task-context";
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
    const intermediateRepresentation = await generateIrForWorkspace({ workspace, context });
    if (intermediateRepresentation === TASK_FAILURE) {
        return;
    }

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
            intermediateRepresentation,
            organization,
            context,
            generatorConfigs: workspace.generatorsConfiguration.draft.map((generator) => ({
                id: generator.name,
                version: generator.version,
                willDownloadFiles: generator.absolutePathToLocalOutput != null,
                customConfig: generator.config,
                outputs: {
                    npm: undefined,
                    maven: undefined,
                },
            })),
            generatorInvocations: workspace.generatorsConfiguration.draft,
            version: undefined,
        });
    }
}
