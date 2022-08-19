import semverDiff from "semver-diff";
import { CliEnvironment } from "../readCliEnvironment";
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
    if (cliEnvironment.packageVersion === "0.0.0") {
        return {
            upgradeAvailable: false,
        };
    }
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
