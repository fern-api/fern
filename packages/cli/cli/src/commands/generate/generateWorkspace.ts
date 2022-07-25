import { runLocalGenerationForWorkspace } from "@fern-api/local-workspace-runner";
import { runRemoteGenerationForWorkspace } from "@fern-api/remote-workspace-runner";
import { loadWorkspaceConfiguration } from "@fern-api/workspace-configuration";
import { generateIrForWorkspace } from "../generate-ir/generateIrForWorkspace";

export async function generateWorkspace({
    absolutePathToWorkspaceConfiguration,
    runLocal,
    keepDocker,
    organization,
}: {
    absolutePathToWorkspaceConfiguration: string;
    runLocal: boolean;
    keepDocker: boolean;
    organization: string;
}): Promise<void> {
    const workspaceConfiguration = await loadWorkspaceConfiguration(absolutePathToWorkspaceConfiguration);
    const intermediateRepresentation = await generateIrForWorkspace({ workspaceConfiguration });
    if (runLocal) {
        await runLocalGenerationForWorkspace({
            organization,
            workspaceConfiguration,
            intermediateRepresentation,
            keepDocker,
        });
    } else {
        await runRemoteGenerationForWorkspace({
            workspaceConfiguration,
            intermediateRepresentation,
            organization,
        });
    }
}
