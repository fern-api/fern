import boxen from "boxen";
import chalk from "chalk";
import latestVersion from "latest-version";
import pupa from "pupa";
import semverDiff from "semver-diff";

const FERN_PACKAGE_NAME = "fern-api";

export async function getUpgradeMessage(currentVersion: string): Promise<string | undefined> {
    const latestPackageVersion = await latestVersion(FERN_PACKAGE_NAME);
    const diff = semverDiff(currentVersion, latestPackageVersion);
    if (diff != null) {
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
                packageName: FERN_PACKAGE_NAME,
                currentVersion,
                latestVersion: latestPackageVersion,
                updateCommand: `npm i -g ${FERN_PACKAGE_NAME}`,
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
    return undefined;
}
