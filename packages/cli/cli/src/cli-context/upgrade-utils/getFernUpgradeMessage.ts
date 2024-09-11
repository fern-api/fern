import boxen from "boxen";
import chalk from "chalk";
import { FernUpgradeInfo } from "../CliContext";
import { CliEnvironment } from "../CliEnvironment";
import { FernGeneratorUpgradeInfo } from "./getGeneratorVersions";

export function getFernUpgradeMessage({
    cliEnvironment,
    upgradeInfo
}: {
    cliEnvironment: CliEnvironment;
    upgradeInfo: FernUpgradeInfo;
}): string | undefined {
    let upgradeAvailable = false;
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
        upgradeAvailable = true;
    }

    // To start we're truncating the list and recommending the user use a different command
    // to see the full list so as to not overwhelm them
    message += getGeneratorUpgradeMessage({
        generatorUpgradeInfo: upgradeInfo.generatorUpgradeInfo,
        limit: 2,
        includeBoxen: false
    });
    const generatorsNeedingUpgrades = upgradeInfo.generatorUpgradeInfo.filter((gui) => gui.isUpgradeAvailable);
    if (generatorsNeedingUpgrades.length > 0) {
        message += `\nRun ${chalk.cyan("fern generator upgrade")} to upgrade your generators.`;
        upgradeAvailable = true;
    }
    if (generatorsNeedingUpgrades.length > 2) {
        message +=
            `\nRun ${chalk.cyan("fern generator upgrade --list")}` +
            "to see the full list of generator upgrades available.";
    }

    return upgradeAvailable
        ? boxen(message, {
              padding: 1,
              float: "center",
              textAlignment: "center",
              borderColor: "yellow",
              borderStyle: "round"
          })
        : undefined;
}

export function getGeneratorUpgradeMessage({
    generatorUpgradeInfo,
    limit,
    includeBoxen = true
}: {
    generatorUpgradeInfo: FernGeneratorUpgradeInfo[];
    limit?: number;
    includeBoxen?: boolean;
}): string | undefined {
    let message = "";
    const generatorUpgradeNeeded = false;

    let generatorsNeedingUpgrades = generatorUpgradeInfo.filter((gui) => gui.isUpgradeAvailable);
    if (limit != null) {
        generatorsNeedingUpgrades = generatorsNeedingUpgrades.slice(0, limit + 1);
    }
    for (const generatorUpgrade of generatorsNeedingUpgrades) {
        // Format => Generator 1.0.0 → 1.1.0 (API: API Name, Group: Group Name)
        // ex: "Python SDK 1.0.0 → 1.1.0 (API: myApi, Group: myGroup)"
        message +=
            `\n${normalizeGeneratorName(generatorUpgrade.generatorName)} (${
                generatorUpgrade.apiName != null ? "API:" + generatorUpgrade.apiName + ", " : ""
            } Group: ${generatorUpgrade.generatorGroup})` +
            chalk.dim(generatorUpgrade.currentVersion) +
            chalk.reset(" → ") +
            chalk.green(generatorUpgrade.latestVersion);
    }

    if (generatorUpgradeNeeded) {
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
    return;
}

function normalizeGeneratorName(generatorName: string): string {
    if (generatorName.startsWith("fernapi/")) {
        generatorName = generatorName.replace("fernapi/", "");
    }
    switch (generatorName) {
        // Python
        case "fern-python-sdk":
            return "Python SDK";
        case "fern-pydantic-model":
            return "Pydantic Model";
        case "fern-fastapi-server":
            return "FastAPI";
        // TypeScript
        case "fern-typescript-browser-sdk":
        case "fern-typescript-node-sdk":
        case "fern-typescript-sdk":
            return "TypeScript SDK";
        case "fern-typescript-express":
            return "Express";
        // Java
        case "fern-java-sdk":
            return "Java SDK";
        case "java-model":
            return "Java Model";
        case "fern-java-spring":
            return "Spring";
        // Go
        case "fern-go-sdk":
            return "Go SDK";
        case "fern-go-model":
            return "Go Model";
        case "fern-go-fiber":
            return "Fiber";
        // C#
        case "fern-csharp-sdk":
            return "C# SDK";
        case "fern-csharp-model":
            return "C# Model";
        // Ruby
        case "fern-ruby-sdk":
            return "Ruby SDK";
        case "fern-ruby-model":
            return "Ruby Model";
        // Misc.
        case "fern-postman":
            return "Postman";
        case "fern-openapi":
            return "OpenAPI";

        default: {
            if (generatorName.startsWith("fern-")) {
                return generatorName.replace("fern-", "");
            }
            return generatorName;
        }
    }
}
