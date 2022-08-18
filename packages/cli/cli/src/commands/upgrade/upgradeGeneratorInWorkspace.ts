import { upgradeGenerators } from "@fern-api/manage-generator";
import chalk from "chalk";
import { writeFile } from "fs/promises";
import yaml from "js-yaml";
import { loadProject } from "../utils/load-project/loadProject";

export async function upgradeGeneratorsInWorkspace(commandLineWorkspaces: readonly string[]): Promise<void> {
    const { workspaces } = await loadProject({ commandLineWorkspaces });

    for (const workspace of workspaces) {
        const { updatedGeneratorsConfiguration, didUpgrade } = upgradeGenerators({
            generatorsConfiguration: workspace.generatorsConfiguration.rawConfiguration,
        });
        await writeFile(
            workspace.generatorsConfiguration.absolutePathToConfiguration,
            yaml.dump(updatedGeneratorsConfiguration)
        );
        if (!didUpgrade) {
            console.log(chalk.green("No upgrades found"));
        }
    }
}
