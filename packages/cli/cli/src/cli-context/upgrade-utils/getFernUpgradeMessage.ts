import boxen from "boxen";
import chalk from "chalk";

import { FernRegistryClient } from "@fern-fern/generators-sdk";

import { FernUpgradeInfo } from "../CliContext";
import { CliEnvironment } from "../CliEnvironment";
import { FernGeneratorUpgradeInfo } from "./getGeneratorVersions";

function hasGeneratorUpgrade(generatorUpgradeInfo: FernGeneratorUpgradeInfo[]): boolean {
    return generatorUpgradeInfo.filter((gui) => gui.isUpgradeAvailable).length > 0;
}

function hasUpgrade(upgradeInfo: FernUpgradeInfo): boolean {
    return (
        (upgradeInfo.cliUpgradeInfo?.isUpgradeAvailable ?? false) ||
        hasGeneratorUpgrade(upgradeInfo.generatorUpgradeInfo)
    );
}

export async function getFernUpgradeMessage({
    cliEnvironment,
    upgradeInfo
}: {
    cliEnvironment: CliEnvironment;
    upgradeInfo: FernUpgradeInfo;
}): Promise<string | undefined> {
    if (!hasUpgrade(upgradeInfo)) {
        return;
    }

    let message = `${chalk.underline("Upgrades available")}\n\n`;

    if (upgradeInfo.cliUpgradeInfo?.isUpgradeAvailable) {
        message +=
            "Fern " +
            chalk.dim(cliEnvironment.packageVersion) +
            chalk.reset(" → ") +
            chalk.green(upgradeInfo.cliUpgradeInfo.latestVersion) +
            " \n(Run " +
            chalk.cyan(`${cliEnvironment.cliName} upgrade`) +
            " to update)";
    }

    // To start we're truncating the list and recommending the user use a different command
    // to see the full list so as to not overwhelm them
    const generatorUpgradeMessage = await getGeneratorUpgradeMessage({
        generatorUpgradeInfo: upgradeInfo.generatorUpgradeInfo,
        limit: 2,
        includeBoxen: false
    });
    if (generatorUpgradeMessage != null) {
        message += generatorUpgradeMessage;
    }

    const generatorsNeedingUpgrades = upgradeInfo.generatorUpgradeInfo.filter((gui) => gui.isUpgradeAvailable);
    if (generatorsNeedingUpgrades.length > 0) {
        message += `\nRun ${chalk.cyan("fern generator upgrade")} to upgrade your generators.`;
    }
    if (generatorsNeedingUpgrades.length > 2) {
        message +=
            `\nRun ${chalk.cyan("fern generator upgrade --list")}` +
            " to see the full list of generator upgrades available.";
    }

    return boxen(message, {
        padding: 1,
        float: "center",
        textAlignment: "center",
        borderColor: "yellow",
        borderStyle: "round"
    });
}

export async function getGeneratorUpgradeMessage({
    generatorUpgradeInfo,
    header,
    limit,
    includeBoxen = true
}: {
    generatorUpgradeInfo: FernGeneratorUpgradeInfo[];
    header?: string;
    limit?: number;
    includeBoxen?: boolean;
}): Promise<string | undefined> {
    if (!hasGeneratorUpgrade(generatorUpgradeInfo)) {
        return;
    }

    let message = header ?? "";

    let generatorsNeedingUpgrades = generatorUpgradeInfo.filter((gui) => gui.isUpgradeAvailable);
    if (limit != null) {
        generatorsNeedingUpgrades = generatorsNeedingUpgrades.slice(0, limit + 1);
    }

    const sortedUpgrades = generatorsNeedingUpgrades.sort(
        (a, b) => a.generatorName.localeCompare(b.generatorName) || a.currentVersion.localeCompare(b.currentVersion)
    );
    for (const generatorUpgrade of sortedUpgrades) {
        // Format => Generator 1.0.0 → 1.1.0 (API: API Name, Group: Group Name)
        // ex: "Python SDK 1.0.0 → 1.1.0 (API: myApi, Group: myGroup)"
        message +=
            `\n${await normalizeGeneratorName(generatorUpgrade.generatorName)} (${
                generatorUpgrade.apiName != null ? "API: " + generatorUpgrade.apiName + ", " : ""
            }Group: ${generatorUpgrade.generatorGroup}) ` +
            chalk.dim(generatorUpgrade.currentVersion) +
            chalk.reset(" → ") +
            chalk.green(generatorUpgrade.latestVersion);
    }

    message += "\n";

    return includeBoxen
        ? boxen(message, {
              padding: 1,
              float: "center",
              textAlignment: "center",
              borderColor: "yellow",
              borderStyle: "round"
          })
        : message;
}

async function normalizeGeneratorName(generatorImage: string): Promise<string> {
    const client = new FernRegistryClient({
        environment: process.env.DEFAULT_FDR_ORIGIN ?? "https://registry.buildwithfern.com"
    });
    const generatorResponse = await client.generators.getGeneratorByImage({ dockerImage: generatorImage });
    if (!generatorResponse.ok || generatorResponse.body == null) {
        throw new Error(`Generator ${generatorImage} not found`);
    }
    return generatorResponse.body.displayName;
}
