import chalk from "chalk";
import { writeFile } from "fs/promises";
import produce from "immer";
import { CliContext } from "../../cli-context/CliContext";
import { isFernCliUpgradeAvailable } from "../../cli-context/upgrade-utils/isFernCliUpgradeAvailable";
import { Project } from "../../loadProject";
import { rerunFernCliAtVersion } from "../../rerunFernCliAtVersion";
import { upgradeGeneratorsInWorkspaces } from "./upgradeGeneratorsInWorkspaces";

export async function upgrade({ project, cliContext }: { project: Project; cliContext: CliContext }): Promise<void> {
    const fernCliUpgradeInfo = await isFernCliUpgradeAvailable(cliContext.environment);
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
            cliEnvironment: cliContext.environment,
        });
    }
}
