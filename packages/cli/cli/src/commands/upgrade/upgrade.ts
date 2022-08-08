import boxen from "boxen";
import chalk from "chalk";
import execa from "execa";
import pupa from "pupa";
import { PackageInfo } from "../../cli";
import { isFernCliUpgradeAvailable } from "../../upgradeNotifier";
import { upgradeGeneratorsInWorkspace } from "./upgradeGeneratorInWorkspace";

export async function upgrade({
    commandLineWorkspaces,
    packageInfo,
}: {
    commandLineWorkspaces: readonly string[];
    packageInfo: PackageInfo;
}): Promise<void> {
    if (packageInfo.packageVersion == null) {
        throw new Error("Failed to upgrade because PACKAGE_VERSION is undefined");
    } else if (packageInfo.packageName == null) {
        throw new Error("Failed to upgrade because PACKAGE_NAME is undefined");
    }
    const fernCliUpgradeInfo = await isFernCliUpgradeAvailable({
        packageName: packageInfo.packageName,
        packageVersion: packageInfo.packageVersion,
    });
    if (fernCliUpgradeInfo.upgradeAvailable) {
        await execa("npm", ["install", "-g", packageInfo.packageName]);
        const template =
            "Upgraded from" + chalk.dim(" {currentVersion}") + chalk.reset(" → ") + chalk.green("{latestVersion}");
        const message = boxen(
            pupa(template, {
                packageName: packageInfo.packageName,
                currentVersion: packageInfo.packageVersion,
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
        const { stdout } = await execa("fern", ["upgrade", `${commandLineWorkspaces.join(" ")}`]);
        console.log(stdout);
    } else {
        await upgradeGeneratorsInWorkspace(commandLineWorkspaces);
    }
}
