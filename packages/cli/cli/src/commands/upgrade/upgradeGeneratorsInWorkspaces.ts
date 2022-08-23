import { upgradeGenerators } from "@fern-api/manage-generator";
import { Project } from "@fern-api/project-loader";
import { writeFile } from "fs/promises";
import yaml from "js-yaml";
import { CliContext } from "../../cli-context/CliContext";

export async function upgradeGeneratorsInWorkspaces(project: Project, cliContext: CliContext): Promise<void> {
    await Promise.all(
        project.workspaces.map((workspace) =>
            cliContext.runTaskForWorkspace(workspace, async (context) => {
                const updatedGeneratorsConfiguration = upgradeGenerators({
                    generatorsConfiguration: workspace.generatorsConfiguration.rawConfiguration,
                    context,
                });
                await writeFile(
                    workspace.generatorsConfiguration.absolutePathToConfiguration,
                    yaml.dump(updatedGeneratorsConfiguration)
                );
            })
        )
    );
}
