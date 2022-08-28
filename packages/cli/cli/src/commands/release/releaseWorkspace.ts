import { GenerationLevel, runRemoteGenerationForWorkspace } from "@fern-api/remote-workspace-runner";
import { TASK_FAILURE } from "@fern-api/task-context";
import { Workspace } from "@fern-api/workspace-loader";
import { CliContext } from "../../cli-context/CliContext";
import { generateIrForWorkspace } from "../generate-ir/generateIrForWorkspace";

export async function releaseWorkspace({
    workspace,
    organization,
    cliContext,
}: {
    workspace: Workspace;
    organization: string;
    cliContext: CliContext;
}): Promise<void> {
    await cliContext.runTaskForWorkspace(workspace, async (context) => {
        const intermediateRepresentation = await generateIrForWorkspace({ workspace, context });
        if (intermediateRepresentation === TASK_FAILURE) {
            return;
        }
        await runRemoteGenerationForWorkspace({
            workspace,
            intermediateRepresentation,
            organization,
            context,
            generationLevel: GenerationLevel.Release,
        });
    });
}
