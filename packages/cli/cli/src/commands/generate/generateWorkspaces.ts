import { loadProject } from "../utils/load-project/loadProject";
import { generateWorkspace } from "./generateWorkspace";

export async function generateWorkspaces({
    commandLineWorkspaces,
    runLocal,
    keepDocker,
}: {
    commandLineWorkspaces: readonly string[];
    runLocal: boolean;
    keepDocker: boolean;
}): Promise<void> {
    const { workspaces, organization } = await loadProject({
        commandLineWorkspaces,
    });

    await Promise.all(
        workspaces.map((workspace) =>
            generateWorkspace({
                workspace,
                runLocal,
                keepDocker,
                organization,
            })
        )
    );
}
