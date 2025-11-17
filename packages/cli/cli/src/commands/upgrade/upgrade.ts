import { runMigrations } from "@fern-api/cli-migrations";
import { FERN_DIRECTORY, getFernDirectory, loadProjectConfig } from "@fern-api/configuration-loader";
import { loggingExeca } from "@fern-api/logging-execa";
import { isVersionAhead } from "@fern-api/semver-utils";
import chalk from "chalk";
import { writeFile } from "fs/promises";
import { produce } from "immer";
import yargs from "yargs";

import { CliContext } from "../../cli-context/CliContext";
import { doesVersionOfCliExist } from "../../cli-context/upgrade-utils/doesVersionOfCliExist";
import { rerunFernCliAtVersion } from "../../rerunFernCliAtVersion";

export const PREVIOUS_VERSION_ENV_VAR = "FERN_PRE_UPGRADE_VERSION";

function ensureFinalNewline(content: string): string {
    return content.endsWith("\n") ? content : content + "\n";
}

async function validateTargetVersion({
    cliContext,
    targetVersion,
    currentVersion
}: {
    cliContext: CliContext;
    targetVersion: string;
    currentVersion: string;
}): Promise<void> {
    const versionExists = await doesVersionOfCliExist({
        cliEnvironment: cliContext.environment,
        version: targetVersion
    });
    if (!versionExists) {
        return cliContext.failAndThrow(
            `Failed to upgrade to ${targetVersion} because it does not exist. See https://www.npmjs.com/package/${cliContext.environment.packageName}?activeTab=versions.`
        );
    }

    const versionAhead = isVersionAhead(targetVersion, currentVersion);
    if (!versionAhead) {
        return cliContext.failAndThrow(
            `Cannot upgrade because target version (${targetVersion}) is not ahead of existing version ${currentVersion}`
        );
    }
}

/**
 * Handles CLI upgrades and migrations between versions.
 *
 * Flow:
 *   1. Determine the target version (explicit via --version, or latest available)
 *   2. Determine the source version (explicit via --from, or from fern.config.json)
 *   3. If current CLI version !== target version:
 *      - Install target version globally
 *      - Re-run at target version with --from and --to flags
 *   4. If current CLI version === target version:
 *      - Run migrations from source → target
 *      - Update fern.config.json to target version
 */
export async function upgrade({
    cliContext,
    includePreReleases,
    targetVersion,
    fromVersion
}: {
    cliContext: CliContext;
    includePreReleases: boolean;
    targetVersion: string | undefined;
    fromVersion: string | undefined;
}): Promise<void> {
    const isLocalDev = cliContext.environment.packageVersion === "0.0.0";

    // Determine target version
    let resolvedTargetVersion = targetVersion?.trim();
    if (!resolvedTargetVersion) {
        const fernUpgradeInfo = await cliContext.isUpgradeAvailable({ includePreReleases });
        if (fernUpgradeInfo.cliUpgradeInfo == null || !fernUpgradeInfo.cliUpgradeInfo.isUpgradeAvailable) {
            cliContext.logger.info("No upgrade available.");
            return;
        }
        resolvedTargetVersion = fernUpgradeInfo.cliUpgradeInfo.latestVersion;
    }

    // Early return if already at target version
    if (cliContext.environment.packageVersion === resolvedTargetVersion || isLocalDev) {
        // We're at the target version - load config and run migrations
        const fernDirectory = await getFernDirectory();
        if (fernDirectory == null) {
            return cliContext.failAndThrow(`Directory "${FERN_DIRECTORY}" not found.`);
        }
        const projectConfig = await cliContext.runTask((context) =>
            loadProjectConfig({ directory: fernDirectory, context })
        );

        const resolvedFromVersion =
            fromVersion?.trim() || process.env[PREVIOUS_VERSION_ENV_VAR]?.trim() || projectConfig.version;

        cliContext.logger.info(
            `Running migrations from ${chalk.dim(resolvedFromVersion)} → ${chalk.green(resolvedTargetVersion)}`
        );

        await cliContext.runTask(async (context) => {
            await runMigrations({
                fromVersion: resolvedFromVersion,
                toVersion: resolvedTargetVersion,
                context
            });
        });
        await cliContext.exitIfFailed();

        const newProjectConfig = produce(projectConfig.rawConfig, (draft) => {
            draft.version = resolvedTargetVersion;
        });
        await writeFile(
            projectConfig._absolutePath,
            ensureFinalNewline(JSON.stringify(newProjectConfig, undefined, 2))
        );
        cliContext.logger.info(`Updated fern.config.json to version ${chalk.green(resolvedTargetVersion)}`);
        return;
    }

    // Not at target version yet - validate, then install and rerun
    await validateTargetVersion({
        cliContext,
        targetVersion: resolvedTargetVersion,
        currentVersion: cliContext.environment.packageVersion
    });

    // Load config to get source version
    const fernDirectory = await getFernDirectory();
    if (fernDirectory == null) {
        return cliContext.failAndThrow(`Directory "${FERN_DIRECTORY}" not found.`);
    }
    const projectConfig = await cliContext.runTask((context) =>
        loadProjectConfig({ directory: fernDirectory, context })
    );

    const resolvedFromVersion =
        fromVersion?.trim() || process.env[PREVIOUS_VERSION_ENV_VAR]?.trim() || projectConfig.version;

    cliContext.logger.info(
        `Upgrading from ${chalk.dim(cliContext.environment.packageVersion)} → ${chalk.green(resolvedTargetVersion)}`
    );

    await loggingExeca(cliContext.logger, "npm", [
        "install",
        "-g",
        `${cliContext.environment.packageName}@${resolvedTargetVersion}`
    ]);

    // Preserve original args except for --version/--to/--from which we replace
    const rerunArgs = ["upgrade", "--from", resolvedFromVersion, "--to", resolvedTargetVersion];

    // Re-parse process.argv with yargs to get structured arguments
    const parsedArgv = yargs(process.argv.slice(2))
        .exitProcess(false) // Don't exit on parse
        .help(false) // Don't process --help
        .version(false) // Don't process --version
        .parserConfiguration({ "camel-case-expansion": false }) // Preserve dash-case
        .parseSync();

    // Preserve all flags except the ones we explicitly replace
    const excludeKeys = new Set(["_", "$0", "version", "to", "from"]);

    for (const [key, value] of Object.entries(parsedArgv)) {
        if (excludeKeys.has(key)) continue;

        // Add the flag and its value
        rerunArgs.push(`--${key}`);
        if (value !== true) {
            rerunArgs.push(String(value));
        }
    }

    await rerunFernCliAtVersion({
        version: resolvedTargetVersion,
        cliContext,
        env: {
            [PREVIOUS_VERSION_ENV_VAR]: resolvedFromVersion
        },
        args: rerunArgs
    });
}
