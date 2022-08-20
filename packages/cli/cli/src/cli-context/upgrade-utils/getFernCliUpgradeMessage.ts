import boxen from "boxen";
import chalk from "chalk";
import { CliEnvironment } from "../CliEnvironment";
import { isFernCliUpgradeAvailable } from "./isFernCliUpgradeAvailable";

export async function getFernCliUpgradeMessage(cliEnvironment: CliEnvironment): Promise<string | undefined> {
    const upgradeInfo = await isFernCliUpgradeAvailable(cliEnvironment);
    if (!upgradeInfo.upgradeAvailable) {
        return undefined;
    }

    const message =
        "Update available " +
        chalk.dim(cliEnvironment.packageVersion) +
        chalk.reset(" → ") +
        chalk.green(upgradeInfo.latestVersion) +
        " \nRun " +
        chalk.cyan(`${cliEnvironment.cliName} upgrade`) +
        " to update";

    return boxen(message, {
        padding: 1,
        margin: 1,
        textAlignment: "center",
        borderColor: "yellow",
        borderStyle: "round",
    });
}
