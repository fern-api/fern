import { loadProject, Project } from "@fern-api/project-loader";
import { createMockTaskContext } from "@fern-api/task-context";

export async function initProject(
    args: Omit<loadProject.Args, "context" | "cliName" | "cliVersion">
): Promise<Project> {
    const cliName = "generate-swift-sdk";
    const cliVersion = require("../package.json").version;
    if (typeof cliVersion !== "string") {
        throw new Error("Cannot determine CLI version from package.json");
    }
    const project = await loadProject({
        ...args,
        cliName,
        cliVersion,
        context: createMockTaskContext()
    });

    return project;
}
