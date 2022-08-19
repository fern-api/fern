import { upgradeGenerators } from "@fern-api/manage-generator";
import { writeFile } from "fs/promises";
import yaml from "js-yaml";
import { Project } from "../../loadProject";

export async function upgradeGeneratorsInWorkspaces(project: Project): Promise<void> {
    for (const workspace of project.workspaces) {
        const updatedGeneratorsConfiguration = upgradeGenerators({
            generatorsConfiguration: workspace.generatorsConfiguration.rawConfiguration,
        });
        await writeFile(
            workspace.generatorsConfiguration.absolutePathToConfiguration,
            yaml.dump(updatedGeneratorsConfiguration)
        );
    }
}
