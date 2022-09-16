import boxen from "boxen";
import chalk from "chalk";
import { CliEnvironment } from "../CliEnvironment";

export async function getFernCliUpgradeMessage({
    cliEnvironment,
    toVersion,
}: {
    cliEnvironment: CliEnvironment;
    toVersion: string;
}): Promise<string> {
    const message =
        "Update available " +
        chalk.dim(cliEnvironment.packageVersion) +
        chalk.reset(" → ") +
        chalk.green(toVersion) +
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
