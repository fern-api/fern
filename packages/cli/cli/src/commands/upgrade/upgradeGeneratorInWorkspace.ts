import { upgradeGeneratorsIfPresent } from "@fern-api/manage-generator";
import { loadRawWorkspaceConfiguration } from "@fern-api/workspace-configuration";
import chalk from "chalk";
import { writeFile } from "fs/promises";
import yaml from "js-yaml";
import { loadProject } from "../utils/load-project/loadProject";

export async function upgradeGeneratorsInWorkspace(commandLineWorkspaces: readonly string[]): Promise<void> {
    const { workspaces } = await loadProject({ commandLineWorkspaces });

    for (const workspace of workspaces) {
        const workspaceConfiguration = await loadRawWorkspaceConfiguration(
            workspace.generatorsConfiguration.absolutePathToConfiguration
        );
        const updatedWorkspaceConfiguration = upgradeGeneratorsIfPresent({ workspaceConfiguration });
        if (updatedWorkspaceConfiguration.upgrades.length > 0) {
            await writeFile(
                workspace.generatorsConfiguration.absolutePathToConfiguration,
                yaml.dump(updatedWorkspaceConfiguration.updatedWorkspaceConfiguration)
            );
            for (const upgradeInfo of updatedWorkspaceConfiguration.upgrades) {
                console.log(
                    chalk.green(
                        `Upgraded ${upgradeInfo.name} from ${upgradeInfo.previousVersion} to ${upgradeInfo.upgradedVersion}`
                    )
                );
            }
        } else {
            console.log(chalk.green("No upgrades found"));
        }
    }
}
