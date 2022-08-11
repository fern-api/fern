import { loadProject } from "../utils/load-project/loadProject";
import { validateWorkspaceAndLogIssues } from "./validateWorkspaceAndLogIssues";

export async function validateWorkspaces({
    commandLineWorkspaces,
}: {
    commandLineWorkspaces: readonly string[];
}): Promise<void> {
    const { workspaces } = await loadProject({
        commandLineWorkspaces,
    });

    await Promise.all(workspaces.map((workspace) => validateWorkspaceAndLogIssues(workspace)));
}
