import { runMigrations } from "@fern-api/cli-migrations";
import {
    FERN_DIRECTORY,
    getFernDirectory,
    loadProjectConfig,
    PROJECT_CONFIG_FILENAME
} from "@fern-api/configuration-loader";
import { Logger } from "@fern-api/logger";
import { loggingExeca } from "@fern-api/logging-execa";
import { isVersionAhead } from "@fern-api/semver-utils";
import chalk from "chalk";
import { writeFile } from "fs/promises";
import { produce } from "immer";
import yargs from "yargs";

import { CliContext } from "../../cli-context/CliContext";
import { rerunFernCliAtVersion } from "../../rerunFernCliAtVersion";

export const PREVIOUS_VERSION_ENV_VAR = "FERN_PRE_UPGRADE_VERSION";

function ensureFinalNewline(content: string): string {
    return content.endsWith("\n") ? content : content + "\n";
}

/**
 * Retrieves the previous version from git history of fern.config.json.
 * Returns null if not in a git repository or if unable to retrieve the version.
 */
async function getPreviousVersionFromGit(fernDirectory: string, logger: Logger): Promise<string | null> {
    try {
        // Get the git root directory
        const { stdout: gitRoot } = await loggingExeca(logger, "git", ["rev-parse", "--show-toplevel"], {
            cwd: fernDirectory,
            doNotPipeOutput: true,
            reject: false
        });
        const gitRootPath = gitRoot.trim();

        // Get the path to fern.config.json relative to git root
        const { stdout: relativePath } = await loggingExeca(
            logger,
            "git",
            ["ls-files", "--full-name", PROJECT_CONFIG_FILENAME],
            {
                cwd: fernDirectory,
                doNotPipeOutput: true,
                reject: false
            }
        );

        const configPath = relativePath.trim().split("\n")[0]; // Get first match

        if (!configPath) {
            // File not tracked by git, return null
            return null;
        }

        // Get the file content from git history
        const { stdout: configContent } = await loggingExeca(logger, "git", ["show", `HEAD:${configPath}`], {
            cwd: gitRootPath,
            doNotPipeOutput: true,
            reject: false
        });

        const previousConfig = JSON.parse(configContent);
        return previousConfig.version ?? null;
    } catch (error) {
        // Not in a git repo, file not in git history, or parse error
        return null;
    }
}

function validateVersionAhead({
    cliContext,
    targetVersion,
    currentVersion
}: {
    cliContext: CliContext;
    targetVersion: string;
    currentVersion: string;
}): void {
    const versionAhead = isVersionAhead(targetVersion, currentVersion);
    if (!versionAhead) {
        cliContext.failAndThrow(
            `Cannot upgrade because target version (${targetVersion}) is not ahead of existing version ${currentVersion}`
        );
    }
}

/**
 * Handles CLI upgrades and migrations between versions.
 *
 * Flow:
 *   1. Determine the target version (explicit via --version, or latest available)
 *   2. If current CLI version === target version (or local dev):
 *      - Load config to determine source version
 *      - Run migrations from source → target
 *      - Update fern.config.json to target version
 *   3. If current CLI version !== target version:
 *      - Validate target is ahead of current
 *      - Load config to determine source version
 *      - Re-run at target version with --from and --to flags (npx handles installation)
 */
export async function upgrade({
    cliContext,
    includePreReleases,
    targetVersion,
    fromVersion,
    fromGit
}: {
    cliContext: CliContext;
    includePreReleases: boolean;
    targetVersion: string | undefined;
    fromVersion: string | undefined;
    fromGit?: boolean;
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

        let resolvedFromVersion = fromVersion?.trim();
        const envVersion = process.env[PREVIOUS_VERSION_ENV_VAR]?.trim();

        // Detect faulty upgrade: if FERN_PRE_UPGRADE_VERSION equals current CLI version,
        // the upgrade came from a faulty version. Fall back to git history.
        // But only if --from flag was not explicitly provided
        const isFaultyUpgrade = !fromVersion && envVersion === cliContext.environment.packageVersion && !isLocalDev;

        // Don't use env var if it's 0.0.0 (local dev version) or if it indicates a faulty upgrade
        if (!resolvedFromVersion && envVersion && envVersion !== "0.0.0" && !isFaultyUpgrade && !fromGit) {
            resolvedFromVersion = envVersion;
        }

        if (!resolvedFromVersion || isFaultyUpgrade || fromGit) {
            const gitVersion = await getPreviousVersionFromGit(fernDirectory, cliContext.logger);
            if (gitVersion != null) {
                if (isFaultyUpgrade) {
                    cliContext.logger.debug(
                        `Detected faulty upgrade (FERN_PRE_UPGRADE_VERSION=${process.env[PREVIOUS_VERSION_ENV_VAR]}). Using version from git history: ${gitVersion}`
                    );
                }
                resolvedFromVersion = gitVersion;
            } else {
                // Fallback to projectConfig.version if git retrieval fails
                if (isFaultyUpgrade) {
                    cliContext.logger.warn(
                        `Detected potential faulty upgrade but could not retrieve version from git history. Using current config version: ${projectConfig.version}`
                    );
                    resolvedFromVersion = projectConfig.version;
                } else {
                    resolvedFromVersion = resolvedFromVersion || projectConfig.version;
                }
            }
        }

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

    // Not at target version yet - validate version ordering, then install and rerun
    validateVersionAhead({
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

    let resolvedFromVersion = fromVersion?.trim();
    const envVersion = process.env[PREVIOUS_VERSION_ENV_VAR]?.trim();

    // Detect faulty upgrade: if FERN_PRE_UPGRADE_VERSION equals current CLI version,
    // the upgrade came from a faulty version. Fall back to git history.
    // But only if --from flag was not explicitly provided
    const isFaultyUpgrade = !fromVersion && envVersion === cliContext.environment.packageVersion && !isLocalDev;

    // Don't use env var if it's 0.0.0 (local dev version) or if it indicates a faulty upgrade
    if (!resolvedFromVersion && envVersion && envVersion !== "0.0.0" && !isFaultyUpgrade && !fromGit) {
        resolvedFromVersion = envVersion;
    }

    if (!resolvedFromVersion || isFaultyUpgrade || fromGit) {
        const gitVersion = await getPreviousVersionFromGit(fernDirectory, cliContext.logger);
        if (gitVersion != null) {
            if (isFaultyUpgrade) {
                cliContext.logger.debug(
                    `Detected faulty upgrade (FERN_PRE_UPGRADE_VERSION=${process.env[PREVIOUS_VERSION_ENV_VAR]}). Using version from git history: ${gitVersion}`
                );
            }
            resolvedFromVersion = gitVersion;
        } else {
            // Fallback to projectConfig.version if git retrieval fails
            if (isFaultyUpgrade) {
                cliContext.logger.warn(
                    `Detected potential faulty upgrade but could not retrieve version from git history. Using current config version: ${projectConfig.version}`
                );
                resolvedFromVersion = projectConfig.version;
            } else {
                resolvedFromVersion = resolvedFromVersion || projectConfig.version;
            }
        }
    }

    cliContext.logger.info(
        `Upgrading from ${chalk.dim(cliContext.environment.packageVersion)} → ${chalk.green(resolvedTargetVersion)}`
    );

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
        if (excludeKeys.has(key)) {
            continue;
        }

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
        args: rerunArgs,
        context: "upgrade"
    });
}
