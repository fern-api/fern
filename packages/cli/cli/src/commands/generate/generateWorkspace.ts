import { runLocalGenerationForWorkspace } from "@fern-api/local-workspace-runner";
import { runRemoteGenerationForWorkspace } from "@fern-api/remote-workspace-runner";
import { Workspace } from "@fern-api/workspace-loader";
import { CliContext } from "../../cli-context/CliContext";
import { generateIrForWorkspace } from "../generate-ir/generateIrForWorkspace";

export async function generateWorkspace({
    workspace,
    runLocal,
    keepDocker,
    organization,
    cliContext,
}: {
    workspace: Workspace;
    runLocal: boolean;
    keepDocker: boolean;
    organization: string;
    cliContext: CliContext;
}): Promise<void> {
    const intermediateRepresentation = await generateIrForWorkspace({ workspace, cliContext });
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
        });
    }
}
