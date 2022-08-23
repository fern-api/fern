import { Project } from "@fern-api/project-loader";
import { CliContext } from "../../cli-context/CliContext";
import { generateWorkspace } from "./generateWorkspace";

export async function generateWorkspaces({
    project,
    runLocal,
    keepDocker,
    cliContext,
}: {
    project: Project;
    runLocal: boolean;
    keepDocker: boolean;
    cliContext: CliContext;
}): Promise<void> {
    await Promise.all(
        project.workspaces.map((workspace) =>
            generateWorkspace({
                workspace,
                runLocal,
                keepDocker,
                organization: project.config.organization,
                cliContext,
            })
        )
    );
}
