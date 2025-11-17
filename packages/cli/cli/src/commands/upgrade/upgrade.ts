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

import { CliContext } from "../../cli-context/CliContext";
import { RerunCliError, rerunFernCliAtVersion } from "../../rerunFernCliAtVersion";

export const PREVIOUS_VERSION_ENV_VAR = "FERN_PRE_UPGRADE_VERSION";

function ensureFinalNewline(content: string): string {
    return content.endsWith("\n") ? content : content + "\n";
}

interface GitVersionResult {
    version: string | null;
    /** Reason why version retrieval failed, if applicable */
    failureReason?: "not-git-repo" | "config-not-tracked" | "no-git-history" | "parse-error" | "no-version-field";
}

/**
 * Converts git failure reason to human-readable message.
 */
function getGitFailureMessage(reason: GitVersionResult["failureReason"]): string {
    if (!reason) {
        return "";
    }

    switch (reason) {
        case "not-git-repo":
            return " (not a git repository)";
        case "config-not-tracked":
            return " (fern.config.json not tracked by git)";
        case "no-git-history":
            return " (no git history for fern.config.json)";
        case "parse-error":
            return " (failed to parse fern.config.json from git)";
        case "no-version-field":
            return " (no version field in fern.config.json)";
    }
}

/**
 * Retrieves the previous version from git history of fern.config.json.
 * Returns version and optional failure reason for better error messages.
 */
async function getPreviousVersionFromGit(fernDirectory: string, logger: Logger): Promise<GitVersionResult> {
    try {
        // Get the git root directory
        const { stdout: gitRoot, failed: gitRootFailed } = await loggingExeca(
            logger,
            "git",
            ["rev-parse", "--show-toplevel"],
            {
                cwd: fernDirectory,
                doNotPipeOutput: true,
                reject: false
            }
        );

        if (gitRootFailed || !gitRoot.trim()) {
            return { version: null, failureReason: "not-git-repo" };
        }

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
            return { version: null, failureReason: "config-not-tracked" };
        }

        // Get the file content from git history
        const { stdout: configContent, failed: showFailed } = await loggingExeca(
            logger,
            "git",
            ["show", `HEAD:${configPath}`],
            {
                cwd: gitRootPath,
                doNotPipeOutput: true,
                reject: false
            }
        );

        if (showFailed || !configContent.trim()) {
            return { version: null, failureReason: "no-git-history" };
        }

        const previousConfig = JSON.parse(configContent);
        const version = previousConfig.version ?? null;

        if (version == null) {
            return { version: null, failureReason: "no-version-field" };
        }

        return { version };
    } catch (error) {
        // JSON parse error or unexpected error
        logger.debug(`Failed to retrieve version from git: ${error}`);
        return { version: null, failureReason: "parse-error" };
    }
}

/**
 * Resolves the source version for migrations, with support for faulty upgrade detection.
 *
 * Resolution order:
 * 1. Explicit --from flag (highest priority)
 * 2. Git history if --from-git flag is set
 * 3. Git history if faulty upgrade detected (FERN_PRE_UPGRADE_VERSION equals current CLI version)
 * 4. FERN_PRE_UPGRADE_VERSION environment variable (if valid)
 * 5. Fallback to projectConfig.version
 *
 * @param options Configuration for version resolution
 * @returns The resolved source version to migrate from
 */
async function resolveSourceVersion({
    fromVersion,
    fromGit,
    cliContext,
    fernDirectory,
    projectConfig,
    isLocalDev
}: {
    fromVersion: string | undefined;
    fromGit: boolean | undefined;
    cliContext: CliContext;
    fernDirectory: string;
    projectConfig: { version: string };
    isLocalDev: boolean;
}): Promise<string> {
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
        const gitResult = await getPreviousVersionFromGit(fernDirectory, cliContext.logger);
        if (gitResult.version != null) {
            if (isFaultyUpgrade) {
                cliContext.logger.debug(
                    `Detected faulty upgrade (FERN_PRE_UPGRADE_VERSION=${process.env[PREVIOUS_VERSION_ENV_VAR]}). Using version from git history: ${gitResult.version}`
                );
            }
            resolvedFromVersion = gitResult.version;
        } else {
            // Fallback to projectConfig.version if git retrieval fails
            if (isFaultyUpgrade) {
                const reason = getGitFailureMessage(gitResult.failureReason);
                cliContext.logger.warn(
                    `Detected potential faulty upgrade but could not retrieve version from git history${reason}. Using current config version: ${projectConfig.version}`
                );
                resolvedFromVersion = projectConfig.version;
            } else if (fromGit) {
                const reason = getGitFailureMessage(gitResult.failureReason);
                cliContext.logger.debug(`Could not retrieve version from git${reason}. Falling back to config.`);
                resolvedFromVersion = resolvedFromVersion || projectConfig.version;
            } else {
                resolvedFromVersion = resolvedFromVersion || projectConfig.version;
            }
        }
    }

    return resolvedFromVersion;
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
 * Filters out upgrade-specific flags from CLI arguments.
 * Removes: upgrade command, --version, --to, --from, --from-git
 * Preserves all other flags for passing through to the rerun command.
 */
function filterUpgradeFlags(args: string[]): string[] {
    const flagsToRemove = new Set(["--version", "--to", "--from", "--from-git"]);
    const result: string[] = [];
    let i = 0;

    while (i < args.length) {
        const arg = args[i];

        // Skip the "upgrade" command if it's the first argument
        if (i === 0 && arg === "upgrade") {
            i++;
            continue;
        }

        // Check if this is a flag we should remove
        const isRemovedFlag = flagsToRemove.has(arg ?? "");
        const isRemovedFlagWithEquals = Array.from(flagsToRemove).some((flag) => arg?.startsWith(`${flag}=`));

        if (isRemovedFlag) {
            // Skip the flag
            i++;
            // Also skip the next argument if it exists and doesn't look like a flag
            if (i < args.length && !args[i]?.startsWith("-")) {
                i++;
            }
        } else if (isRemovedFlagWithEquals) {
            // Skip --flag=value format
            i++;
        } else if (arg != null) {
            // Keep this argument
            result.push(arg);
            i++;
        } else {
            i++;
        }
    }

    return result;
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
        const cliUpgradeInfo = fernUpgradeInfo.cliUpgradeInfo;
        const hasUpgradeAvailable = cliUpgradeInfo != null && cliUpgradeInfo.isUpgradeAvailable;

        if (hasUpgradeAvailable) {
            resolvedTargetVersion = cliUpgradeInfo.latestVersion;
        } else {
            // No newer version available - check if we should run migrations for current version
            if (isLocalDev) {
                cliContext.logger.info("No upgrade available.");
                return;
            }

            const fernDirectory = await getFernDirectory();
            if (fernDirectory == null) {
                return cliContext.failAndThrow(`Directory "${FERN_DIRECTORY}" not found.`);
            }
            const projectConfig = await cliContext.runTask((context) =>
                loadProjectConfig({ directory: fernDirectory, context })
            );

            // If config version differs from CLI version, run migrations to bring it up to date
            if (projectConfig.version !== cliContext.environment.packageVersion) {
                resolvedTargetVersion = cliContext.environment.packageVersion;
                cliContext.logger.info(
                    `No newer version available, but config version (${projectConfig.version}) differs from CLI version (${cliContext.environment.packageVersion})`
                );
            } else {
                cliContext.logger.info("No upgrade available.");
                return;
            }
        }
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

        const resolvedFromVersion = await resolveSourceVersion({
            fromVersion,
            fromGit,
            cliContext,
            fernDirectory,
            projectConfig,
            isLocalDev
        });

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

    const resolvedFromVersion = await resolveSourceVersion({
        fromVersion,
        fromGit,
        cliContext,
        fernDirectory,
        projectConfig,
        isLocalDev
    });

    cliContext.logger.info(
        `Upgrading from ${chalk.dim(cliContext.environment.packageVersion)} → ${chalk.green(resolvedTargetVersion)}`
    );

    // Filter out upgrade-specific flags and build args for rerun
    const otherArgs = filterUpgradeFlags(process.argv.slice(2));
    const rerunArgs = ["upgrade", "--from", resolvedFromVersion, "--to", resolvedTargetVersion, ...otherArgs];

    try {
        await rerunFernCliAtVersion({
            version: resolvedTargetVersion,
            cliContext,
            env: {
                [PREVIOUS_VERSION_ENV_VAR]: resolvedFromVersion
            },
            args: rerunArgs,
            throwOnError: true
        });
    } catch (error) {
        if (error instanceof RerunCliError) {
            // Log error output for debugging
            cliContext.logger.debug(`Rerun CLI failed with stdout: ${error.stdout}`);
            cliContext.logger.debug(`Rerun CLI failed with stderr: ${error.stderr}`);

            // Check if it's a version not found error by looking for common npm error patterns
            const errorOutput = (error.stderr ?? "") + (error.stdout ?? "");
            const isVersionNotFound =
                errorOutput.includes("ETARGET") ||
                errorOutput.includes("E404") ||
                errorOutput.includes("404 Not Found") ||
                errorOutput.includes("No matching version found") ||
                errorOutput.includes("version not found");

            if (isVersionNotFound) {
                return cliContext.failAndThrow(
                    `Failed to upgrade to ${resolvedTargetVersion} because it does not exist. See https://www.npmjs.com/package/${cliContext.environment.packageName}?activeTab=versions.`
                );
            }
        }
        throw error;
    }
}
