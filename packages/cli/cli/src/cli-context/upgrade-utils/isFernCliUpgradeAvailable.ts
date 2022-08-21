import semverDiff from "semver-diff";
import { CliEnvironment } from "../CliEnvironment";
import { getLatestVersionOfCli } from "./getLatestVersionOfCli";

export type FernCliUpgradeInfo = FernCliUpgradeAvailable | FernCliNoUpgradeAvailable;

export interface FernCliUpgradeAvailable {
    upgradeAvailable: true;
    latestVersion: string;
}

export interface FernCliNoUpgradeAvailable {
    upgradeAvailable: false;
}

export async function isFernCliUpgradeAvailable(cliEnvironment: CliEnvironment): Promise<FernCliUpgradeInfo> {
    const latestPackageVersion = await getLatestVersionOfCli(cliEnvironment);
    const diff = semverDiff(cliEnvironment.packageVersion, latestPackageVersion);
    if (diff != null) {
        return {
            upgradeAvailable: true,
            latestVersion: latestPackageVersion,
        };
    }
    return {
        upgradeAvailable: false,
    };
}
