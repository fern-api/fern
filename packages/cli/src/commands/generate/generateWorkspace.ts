import { loadWorkspaceDefinition } from "@fern-api/commons";
import { runLocalGenerationForWorkspace } from "@fern-api/local-workspace-runner";
import { runRemoteGenerationForWorkspace } from "@fern-api/remote-workspace-runner";
import { generateIrForWorkspace } from "../generate-ir/generateIrForWorkspace";

export async function generateWorkspace({
    absolutePathToWorkspaceDefinition,
    runLocal,
    keepDocker,
    organization,
}: {
    absolutePathToWorkspaceDefinition: string;
    runLocal: boolean;
    keepDocker: boolean;
    organization: string;
}): Promise<void> {
    const workspaceDefinition = await loadWorkspaceDefinition(absolutePathToWorkspaceDefinition);
    const intermediateRepresentation = await generateIrForWorkspace({ workspaceDefinition });
    if (runLocal) {
        await runLocalGenerationForWorkspace({
            organization,
            workspaceDefinition,
            intermediateRepresentation,
            keepDocker,
        });
    } else {
        await runRemoteGenerationForWorkspace({
            workspaceDefinition,
            intermediateRepresentation,
            organization,
        });
    }
}
