import boxen from "boxen";
import chalk from "chalk";
import execa from "execa";
import pupa from "pupa";
import { parseRawCliEnvironmentOrThrow, RawCliEnvironment } from "../../cliEnvironment";
import { isFernCliUpgradeAvailable } from "../../upgradeNotifier";
import { upgradeGeneratorsInWorkspace } from "./upgradeGeneratorInWorkspace";

export async function upgrade({
    commandLineWorkspaces,
    rawCliEnvironment,
}: {
    commandLineWorkspaces: readonly string[];
    rawCliEnvironment: RawCliEnvironment;
}): Promise<void> {
    const { cliName, packageName, packageVersion } = parseRawCliEnvironmentOrThrow(
        rawCliEnvironment,
        "Failed to upgrade."
    );
    const fernCliUpgradeInfo = await isFernCliUpgradeAvailable({ packageName, packageVersion });
    if (fernCliUpgradeInfo.upgradeAvailable) {
        await execa("npm", ["install", "-g", packageName]);
        const template =
            "Upgraded {cliName} from" +
            chalk.dim(" {currentVersion}") +
            chalk.reset(" → ") +
            chalk.green("{latestVersion}");
        const message = boxen(
            pupa(template, {
                cliName,
                packageName,
                currentVersion: packageVersion,
                latestVersion: fernCliUpgradeInfo.version,
            }),
            {
                padding: 1,
                margin: 1,
                textAlignment: "center",
                borderColor: "yellow",
                borderStyle: "round",
            }
        );
        console.log(message);
        const { stdout } = await execa(cliName, ["upgrade", `${commandLineWorkspaces.join(" ")}`], {
            cwd: process.cwd(),
        });
        console.log(stdout);
    } else {
        await upgradeGeneratorsInWorkspace(commandLineWorkspaces);
    }
}
