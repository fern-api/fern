import { upgradeGeneratorsIfPresent } from "@fern-api/manage-generator";
import { loadRawWorkspaceConfiguration } from "@fern-api/workspace-configuration";
import { writeFile } from "fs/promises";
import yaml from "js-yaml";
import chalk from "chalk";
import { loadProject } from "../utils/load-project/loadProject";

export async function upgradeGeneratorsInWorkspace(commandLineWorkspaces: readonly string[]): Promise<void> {
    const { workspaceConfigurations } = await loadProject({ commandLineWorkspaces });

    for (const workspaceConfigurationFilePath of workspaceConfigurations) {
        const workspaceConfiguration = await loadRawWorkspaceConfiguration(workspaceConfigurationFilePath);
        const updatedWorkspaceConfiguration = upgradeGeneratorsIfPresent({ workspaceConfiguration });
        await writeFile(workspaceConfigurationFilePath, yaml.dump(updatedWorkspaceConfiguration));
        for (const upgradeInfo of updatedWorkspaceConfiguration.upgrades) {
            console.log(
                chalk.green(
                    `Upgraded ${upgradeInfo.name} from ${upgradeInfo.previousVersion} to ${upgradeInfo.upgradedVersion}`
                )
            );
        }
    }
}
