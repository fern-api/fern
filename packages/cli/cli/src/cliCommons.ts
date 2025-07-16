import { LogLevel } from "@fern-api/logger";
import { Project, loadProject } from "@fern-api/project-loader";

import { CliContext } from "./cli-context/CliContext";

export interface GlobalCliOptions {
    "log-level": LogLevel;
}

export async function loadProjectAndRegisterWorkspacesWithContext(
    cliContext: CliContext,
    args: Omit<loadProject.Args, "context" | "cliName" | "cliVersion">,
    registerDocsWorkspace = false
): Promise<Project> {
    const context = cliContext.addTask().start();
    const project = await loadProject({
        ...args,
        cliName: cliContext.environment.cliName,
        cliVersion: cliContext.environment.packageVersion,
        context
    });
    context.finish();

    if (registerDocsWorkspace && project.docsWorkspaces != null) {
        cliContext.registerWorkspaces([...project.apiWorkspaces, project.docsWorkspaces]);
    } else {
        cliContext.registerWorkspaces(project.apiWorkspaces);
    }

    cliContext.registerProject(project);

    return project;
}
