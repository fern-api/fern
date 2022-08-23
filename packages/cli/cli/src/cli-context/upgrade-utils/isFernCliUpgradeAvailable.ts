import semverDiff from "semver-diff";
import { CliEnvironment } from "../CliEnvironment";
import { getLatestVersionOfCli } from "./getLatestVersionOfCli";

export interface FernCliUpgradeInfo {
    upgradeAvailable: boolean;
    latestVersion: string;
}

export async function isFernCliUpgradeAvailable(cliEnvironment: CliEnvironment): Promise<FernCliUpgradeInfo> {
    const latestPackageVersion = await getLatestVersionOfCli(cliEnvironment);
    const diff = semverDiff(cliEnvironment.packageVersion, latestPackageVersion);
    return {
        upgradeAvailable: diff != null,
        latestVersion: latestPackageVersion,
    };
}
