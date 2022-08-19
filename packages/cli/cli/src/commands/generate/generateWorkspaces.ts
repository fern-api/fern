import { Project } from "../../createProjectLoader";
import { generateWorkspace } from "./generateWorkspace";

export async function generateWorkspaces({
    project,
    runLocal,
    keepDocker,
}: {
    project: Project;
    runLocal: boolean;
    keepDocker: boolean;
}): Promise<void> {
    await Promise.all(
        project.workspaces.map((workspace) =>
            generateWorkspace({
                workspace,
                runLocal,
                keepDocker,
                organization: project.config.organization,
            })
        )
    );
}
