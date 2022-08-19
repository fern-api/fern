import { Project } from "../../loadProject";
import { validateWorkspaceAndLogIssues } from "./validateWorkspaceAndLogIssues";

export async function validateWorkspaces({ project }: { project: Project }): Promise<void> {
    await Promise.all(project.workspaces.map((workspace) => validateWorkspaceAndLogIssues(workspace)));
}
