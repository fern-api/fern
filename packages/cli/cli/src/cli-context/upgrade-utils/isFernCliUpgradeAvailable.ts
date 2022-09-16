import semverDiff from "semver-diff";
import { CliContext } from "../CliContext";
import { getLatestVersionOfCli } from "./getLatestVersionOfCli";

export interface FernCliUpgradeInfo {
    upgradeAvailable: boolean;
    latestVersion: string;
}

export async function isFernCliUpgradeAvailable(cliContext: CliContext): Promise<FernCliUpgradeInfo> {
    cliContext.logger.debug(`Checking if ${cliContext.environment.packageName} upgrade is available...`);

    const latestPackageVersion = await getLatestVersionOfCli(cliContext.environment);
    const diff = semverDiff(cliContext.environment.packageVersion, latestPackageVersion);

    cliContext.logger.debug(
        `Latest version: ${latestPackageVersion}. ` + (diff != null ? "Upgrade available." : "No upgrade available.")
    );

    return {
        upgradeAvailable: diff != null,
        latestVersion: latestPackageVersion,
    };
}
