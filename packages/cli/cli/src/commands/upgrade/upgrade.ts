import chalk from "chalk";
import { writeFile } from "fs/promises";
import produce from "immer";
import { Project } from "../../createProjectLoader";
import { CliEnvironment } from "../../readCliEnvironment";
import { rerunFernCliAtVersion } from "../../rerunFernCliAtVersion";
import { isFernCliUpgradeAvailable } from "../../upgrade-utils/isFernCliUpgradeAvailable";
import { upgradeGeneratorsInWorkspaces } from "./upgradeGeneratorsInWorkspaces";

export async function upgrade({
    project,
    cliEnvironment,
}: {
    project: Project;
    cliEnvironment: CliEnvironment;
}): Promise<void> {
    const fernCliUpgradeInfo = await isFernCliUpgradeAvailable(cliEnvironment);
    if (!fernCliUpgradeInfo.upgradeAvailable) {
        await upgradeGeneratorsInWorkspaces(project);
    } else {
        const newProjectConfig = produce(project.config, (draft) => {
            draft.version = fernCliUpgradeInfo.latestVersion;
        });
        await writeFile(project.config._absolutePath, JSON.stringify(newProjectConfig, undefined, 2));
        const message =
            "Upgraded {cliName} from" +
            chalk.dim(" {currentVersion}") +
            chalk.reset(" → ") +
            chalk.green("{latestVersion}");
        console.log(message);
        await rerunFernCliAtVersion({
            version: fernCliUpgradeInfo.latestVersion,
            cliEnvironment,
        });
    }
}
