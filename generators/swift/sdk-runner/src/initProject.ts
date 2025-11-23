import { loadProject, Project } from "@fern-api/project-loader";
import { createMockTaskContext } from "@fern-api/task-context";

export async function initProject(
    args: Omit<loadProject.Args, "context" | "cliName" | "cliVersion">
): Promise<Project> {
    const cliName = "swift-sdk-runner"; // TODO: Update
    const cliVersion = "0.0.1"; // TODO: Update
    const project = await loadProject({
        ...args,
        cliName,
        cliVersion,
        context: createMockTaskContext() // TODO: Update
    });

    return project;
}
