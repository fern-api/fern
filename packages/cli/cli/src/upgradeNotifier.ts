import boxen from "boxen";
import chalk from "chalk";
import latestVersion from "latest-version";
import pupa from "pupa";
import semverDiff from "semver-diff";

export type FernCliUpgradeInfo = FernCliUpgradeAvailable | FernCliNoUpgradeAvailable;

export interface FernCliUpgradeAvailable {
    upgradeAvailable: true;
    version: string;
}

export interface FernCliNoUpgradeAvailable {
    upgradeAvailable: false;
}

export async function isFernCliUpgradeAvailable({
    packageVersion,
    packageName,
}: {
    packageVersion: string;
    packageName: string;
}): Promise<FernCliUpgradeInfo> {
    const latestPackageVersion = await latestVersion(packageName);
    const diff = semverDiff(packageVersion, latestPackageVersion);
    if (diff != null) {
        return {
            upgradeAvailable: true,
            version: latestPackageVersion,
        };
    }
    return {
        upgradeAvailable: false,
    };
}

export async function getFernCliUpgradeMessage({
    packageVersion,
    packageName,
}: {
    packageVersion: string;
    packageName: string;
}): Promise<string | undefined> {
    try {
        const upgradeInfo = await isFernCliUpgradeAvailable({ packageVersion, packageName });
        if (upgradeInfo.upgradeAvailable) {
            const template =
                "Update available " +
                chalk.dim("{currentVersion}") +
                chalk.reset(" → ") +
                chalk.green("{latestVersion}") +
                " \nRun " +
                chalk.cyan("{updateCommand}") +
                " to update";
            const message = boxen(
                pupa(template, {
                    packageName,
                    currentVersion: packageVersion,
                    latestVersion: upgradeInfo.version,
                    updateCommand: "fern upgrade",
                }),
                {
                    padding: 1,
                    margin: 1,
                    textAlignment: "center",
                    borderColor: "yellow",
                    borderStyle: "round",
                }
            );
            return message;
        }
    } catch (e) {}
    return undefined;
}
