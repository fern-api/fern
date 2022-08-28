import { Project } from "@fern-api/project-loader";
import { CliContext } from "../../cli-context/CliContext";
import { releaseWorkspace } from "./releaseWorkspace";

export async function releaseWorkspaces({
    project,
    cliContext,
}: {
    project: Project;
    cliContext: CliContext;
}): Promise<void> {
    await Promise.all(
        project.workspaces.map((workspace) =>
            releaseWorkspace({
                workspace,
                organization: project.config.organization,
                cliContext,
            })
        )
    );
}
