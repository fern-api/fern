import { runMigrations } from "@fern-api/migrations";
import chalk from "chalk";
import { writeFile } from "fs/promises";
import produce from "immer";
import { CliContext } from "../../cli-context/CliContext";
import { isFernCliUpgradeAvailable } from "../../cli-context/upgrade-utils/isFernCliUpgradeAvailable";
import { Project } from "../../loadProject";
import { rerunFernCliAtVersion } from "../../rerunFernCliAtVersion";
import { upgradeGeneratorsInWorkspaces } from "./upgradeGeneratorsInWorkspaces";

const PREVIOUS_VERSION_ENV_VAR = "FERN_PRE_UPGRADE_VERSION";

export async function upgrade({ project, cliContext }: { project: Project; cliContext: CliContext }): Promise<void> {
    const fernCliUpgradeInfo = await isFernCliUpgradeAvailable(cliContext.environment);
    if (!fernCliUpgradeInfo.upgradeAvailable) {
        const previousVersion = process.env[PREVIOUS_VERSION_ENV_VAR];
        if (previousVersion == null) {
            cliContext.logger.info("No upgrade available.");
            return;
        } else {
            await cliContext.runTask(async (context) => {
                await runMigrations({
                    fromVersion: previousVersion,
                    toVersion: fernCliUpgradeInfo.latestVersion,
                    context,
                });
            });
            await cliContext.exitIfFailed();
        }
        await upgradeGeneratorsInWorkspaces(project, cliContext);
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
        cliContext.logger.info(message);
        await rerunFernCliAtVersion({
            version: fernCliUpgradeInfo.latestVersion,
            cliEnvironment: cliContext.environment,
        });
    }
}
